
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Warehouse, Inventory, InventoryHistory
from .serializers import (
    WarehouseSerializer,
    WarehouseWriteSerializer,
    InventorySerializer,
    InventoryListSerializer,
    InventoryWriteSerializer,
    StockAdjustSerializer,
    ThresholdUpdateSerializer,
    StockCheckSerializer,
)
from .permissions import IsAdmin, IsSellerOrAdmin
from .events import publish_event
from .authentication import TokenPayload


# ─── Helper ───────────────────────────────────────────────────────────

def get_token_payload(request):
    """
    Read the JWT payload that JWTPayloadAuthentication already placed
    on request.user. No duplicate parsing, no DB lookup.
    """
    if isinstance(request.user, TokenPayload):
        return request.user
    return None


# ─── Warehouses ───────────────────────────────────────────────────────

class WarehouseListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        warehouses = Warehouse.objects.filter(is_active=True)
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WarehouseWriteSerializer(data=request.data)
        if serializer.is_valid():
            warehouse = serializer.save()
            return Response(WarehouseSerializer(warehouse).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WarehouseDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, warehouse_id):
        try:
            return Warehouse.objects.get(warehouse_id=warehouse_id)
        except Warehouse.DoesNotExist:
            return None

    def get(self, request, warehouse_id):
        warehouse = self.get_object(warehouse_id)
        if not warehouse:
            return Response({"error": "Warehouse not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(WarehouseSerializer(warehouse).data)

    def put(self, request, warehouse_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        warehouse = self.get_object(warehouse_id)
        if not warehouse:
            return Response({"error": "Warehouse not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WarehouseWriteSerializer(warehouse, data=request.data, partial=True)
        if serializer.is_valid():
            warehouse = serializer.save()
            return Response(WarehouseSerializer(warehouse).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Inventory ────────────────────────────────────────────────────────

class InventoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("admin", "seller"):
            return Response({"error": "Admin or seller access required."}, status=status.HTTP_403_FORBIDDEN)

        qs = Inventory.objects.select_related("warehouse").all()
        product_id = request.query_params.get("product_id")
        warehouse_id = request.query_params.get("warehouse_id")

        if product_id:
            qs = qs.filter(product_id=product_id)
        if warehouse_id:
            qs = qs.filter(warehouse_id=warehouse_id)

        serializer = InventoryListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = InventoryWriteSerializer(data=request.data)
        if serializer.is_valid():
            inventory = serializer.save()
            return Response(
                InventoryListSerializer(inventory).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, inventory_id):
        try:
            return Inventory.objects.select_related("warehouse").prefetch_related(
                "history"
            ).get(inventory_id=inventory_id)
        except Inventory.DoesNotExist:
            return None

    def get(self, request, inventory_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("admin", "seller"):
            return Response({"error": "Admin or seller access required."}, status=status.HTTP_403_FORBIDDEN)

        inventory = self.get_object(inventory_id)
        if not inventory:
            return Response({"error": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(InventorySerializer(inventory).data)


# ─── Stock Check ──────────────────────────────────────────────────────

class StockCheckView(APIView):
    """
    GET /api/inventory/check/?product_id=X&quantity=N&variant_id=Y
    Internal HTTP endpoint called by Order Service before placing an order.
    Returns available stock across all warehouses.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        product_id = request.query_params.get("product_id")
        quantity = request.query_params.get("quantity")
        variant_id = request.query_params.get("variant_id")

        if not product_id or not quantity:
            return Response(
                {"error": "product_id and quantity are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
            product_id = int(product_id)
        except ValueError:
            return Response({"error": "Invalid parameters."}, status=status.HTTP_400_BAD_REQUEST)

        qs = Inventory.objects.filter(product_id=product_id)
        if variant_id:
            qs = qs.filter(variant_id=int(variant_id))

        total_stock = sum(inv.quantity_on_hand for inv in qs)
        available = total_stock >= quantity

        return Response({
            "product_id": product_id,
            "variant_id": variant_id,
            "requested_quantity": quantity,
            "total_stock": total_stock,
            "available": available,
        })


# ─── Stock Adjustment ─────────────────────────────────────────────────

class StockAdjustView(APIView):
    """
    POST /api/inventory/<id>/adjust/
    Admin only — manually adjust stock up or down.
    """
    permission_classes = [AllowAny]

    def post(self, request, inventory_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            inventory = Inventory.objects.get(inventory_id=inventory_id)
        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StockAdjustSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quantity_change = serializer.validated_data["quantity"]
        reason = serializer.validated_data["reason"]
        previous_quantity = inventory.quantity_on_hand
        new_quantity = previous_quantity + quantity_change

        if new_quantity < 0:
            return Response(
                {"error": "Stock cannot go below zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            inventory.quantity_on_hand = new_quantity
            inventory.version += 1
            inventory.save()

            action = "addition" if quantity_change > 0 else "deduction"
            InventoryHistory.objects.create(
                inventory=inventory,
                action=action,
                quantity_change=quantity_change,
                previous_quantity=previous_quantity,
                new_quantity=new_quantity,
                reason=reason,
                performed_by=payload.get("user_id"),
            )

        # Check if below reorder threshold
        if new_quantity <= inventory.reorder_threshold:
            publish_event("inventory.low_stock", {
                "inventory_id": inventory.inventory_id,
                "product_id": inventory.product_id,
                "variant_id": inventory.variant_id,
                "warehouse_id": inventory.warehouse_id,
                "quantity_on_hand": new_quantity,
                "reorder_threshold": inventory.reorder_threshold,
            })

        return Response(InventoryListSerializer(inventory).data)


# ─── Threshold Update ─────────────────────────────────────────────────

class ThresholdUpdateView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, inventory_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            inventory = Inventory.objects.get(inventory_id=inventory_id)
        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ThresholdUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        inventory.reorder_threshold = serializer.validated_data["reorder_threshold"]
        inventory.save()

        return Response(InventoryListSerializer(inventory).data)
