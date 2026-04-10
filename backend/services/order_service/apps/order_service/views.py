import requests
from decimal import Decimal
from django.db import transaction
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Order, OrderItem
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    PlaceOrderSerializer,
    CancelOrderSerializer,
)
from .permissions import IsAdmin, IsCustomer, IsCustomerOrAdmin
from .events import publish_event


# ─── Helper ───────────────────────────────────────────────────────────

def get_token_payload(request):
    try:
        authenticator = JWTAuthentication()
        result = authenticator.authenticate(request)
        if result is None:
            return None
        _, token = result
        return token.payload
    except (InvalidToken, TokenError):
        return None


def check_stock(product_id, quantity, variant_id=None):
    """Call Inventory Service to validate stock."""
    try:
        url = f"{settings.INVENTORY_SERVICE_URL}/api/inventory/check/"
        params = {"product_id": product_id, "quantity": quantity}
        if variant_id:
            params["variant_id"] = variant_id
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("available", False)
        return False
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Inventory check failed: {e}")
        return True  # fail open — don't block order if inventory service is down


def get_exchange_rate(from_currency, to_currency):
    """Call Currency Service to get exchange rate."""
    try:
        if from_currency == to_currency:
            return Decimal("1.000000")
        url = f"{settings.CURRENCY_SERVICE_URL}/api/currencies/rate/"
        params = {"from": from_currency, "to": to_currency}
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return Decimal(str(data.get("rate", "1.000000")))
        return Decimal("1.000000")
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Currency rate fetch failed: {e}")
        return Decimal("1.000000")


# ─── Orders ───────────────────────────────────────────────────────────

class OrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get("role") == "admin":
            qs = Order.objects.all()
            status_filter = request.query_params.get("status")
            if status_filter:
                qs = qs.filter(status=status_filter)
        else:
            qs = Order.objects.filter(customer_id=payload.get("user_id"))

        serializer = OrderListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get("role") not in ("customer", "admin"):
            return Response({"error": "Customer access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = serializer.validated_data["items"]
        currency_code = serializer.validated_data["currency_code"]
        shipping_address = serializer.validated_data["shipping_address"]
        notes = serializer.validated_data["notes"]

        # Step 1 — Validate stock for all items
        for item in items_data:
            available = check_stock(
                item["product_id"],
                item["quantity"],
                item.get("variant_id"),
            )
            if not available:
                return Response(
                    {"error": f"Insufficient stock for product {item['product_id']}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Step 2 — Calculate totals
        total_amount = Decimal("0.00")
        for item in items_data:
            item_total = Decimal(str(item["unit_price"])) * item["quantity"]
            item["total_price"] = item_total
            total_amount += item_total

        # Step 3 — Create order in ACID transaction
        with transaction.atomic():
            order = Order.objects.create(
                customer_id=payload.get("user_id"),
                total_amount=total_amount,
                currency_code=currency_code,
                shipping_address=shipping_address,
                notes=notes,
                status="pending",
                payment_status="unpaid",
            )

            for line_number, item in enumerate(items_data, start=1):
                OrderItem.objects.create(
                    order=order,
                    line_number=line_number,
                    product_id=item["product_id"],
                    variant_id=item.get("variant_id"),
                    seller_id=item["seller_id"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    total_price=item["total_price"],
                )

        # Step 4 — Publish order.placed event
        publish_event("order.placed", {
            "order_id": order.order_id,
            "customer_id": order.customer_id,
            "total_amount": str(order.total_amount),
            "currency_code": order.currency_code,
            "items": [
                {
                    "product_id": item["product_id"],
                    "variant_id": item.get("variant_id"),
                    "seller_id": item["seller_id"],
                    "quantity": item["quantity"],
                    "unit_price": str(item["unit_price"]),
                }
                for item in items_data
            ],
        })

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, order_id):
        try:
            return Order.objects.prefetch_related("items").get(order_id=order_id)
        except Order.DoesNotExist:
            return None

    def get(self, request, order_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        order = self.get_object(order_id)
        if not order:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Customers can only see their own orders
        if payload.get("role") == "customer" and order.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(OrderDetailSerializer(order).data)


class CancelOrderView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, order_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Customers can only cancel their own orders
        if payload.get("role") == "customer" and order.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only pending or confirmed orders can be cancelled
        if order.status not in ("pending", "confirmed"):
            return Response(
                {"error": f"Cannot cancel order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CancelOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = "cancelled"
        order.save()

        # Publish stock release event
        publish_event("inventory.stock_release", {
            "order_id": order.order_id,
            "items": [
                {
                    "product_id": item.product_id,
                    "variant_id": item.variant_id,
                    "quantity": item.quantity,
                }
                for item in order.items.all()
            ],
        })

        return Response(OrderDetailSerializer(order).data)


class AdminOrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        qs = Order.objects.all()
        status_filter = request.query_params.get("status")
        customer_id = request.query_params.get("customer_id")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        serializer = OrderListSerializer(qs, many=True)
        return Response(serializer.data)