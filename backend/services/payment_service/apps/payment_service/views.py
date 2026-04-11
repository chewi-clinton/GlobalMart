import uuid
import requests
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Payment, Refund
from .serializers import (
    PaymentSerializer,
    InitiatePaymentSerializer,
    PaymentWebhookSerializer,
    RefundSerializer,
    RequestRefundSerializer,
    ProcessRefundSerializer,
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


def get_campay_token():
    """Get CamPay access token."""
    try:
        response = requests.post(
            f"{settings.CAMPAY_BASE_URL}/token/",
            json={
                "username": settings.CAMPAY_USERNAME,
                "password": settings.CAMPAY_PASSWORD,
            },
            timeout=10,
        )
        if response.status_code == 200:
            return response.json().get("token")
        return None
    except Exception:
        return None


# ─── Payments ─────────────────────────────────────────────────────────

class PaymentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get("role") == "admin":
            qs = Payment.objects.all()
        else:
            qs = Payment.objects.filter(customer_id=payload.get("user_id"))

        serializer = PaymentSerializer(qs, many=True)
        return Response(serializer.data)


class InitiatePaymentView(APIView):
    """
    POST /api/payments/initiate/
    Customer initiates a payment for an order.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = InitiatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data["order_id"]
        amount = serializer.validated_data["amount"]
        currency_code = serializer.validated_data["currency_code"]
        payment_method = serializer.validated_data["payment_method"]
        phone_number = serializer.validated_data["phone_number"]

        # Idempotency check — prevent duplicate payments
        idempotency_key = f"order_{order_id}_customer_{payload.get('user_id')}"
        existing = Payment.objects.filter(idempotency_key=idempotency_key).first()
        if existing:
            return Response(PaymentSerializer(existing).data)

        # Create payment record
        payment = Payment.objects.create(
            order_id=order_id,
            customer_id=payload.get("user_id"),
            amount=amount,
            currency_code=currency_code,
            payment_method=payment_method,
            phone_number=phone_number,
            status="pending",
            idempotency_key=idempotency_key,
        )

        # Initiate MoMo payment via CamPay
        if payment_method in ("mtn_momo", "orange_money"):
            try:
                token = get_campay_token()
                if token:
                    response = requests.post(
                        f"{settings.CAMPAY_BASE_URL}/collect/",
                        headers={"Authorization": f"Token {token}"},
                        json={
                            "amount": str(amount),
                            "from": phone_number,
                            "description": f"GlobalMart Order #{order_id}",
                            "external_reference": str(payment.payment_id),
                        },
                        timeout=30,
                    )
                    if response.status_code == 200:
                        data = response.json()
                        payment.transaction_id = data.get("reference", "")
                        payment.gateway_response = data
                        payment.save()
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"CamPay initiation failed: {e}")

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, payment_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payment = Payment.objects.get(payment_id=payment_id)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "customer" and payment.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)


class PaymentWebhookView(APIView):
    """
    POST /api/payments/webhook/
    CamPay calls this endpoint when payment status changes.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PaymentWebhookSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        reference = serializer.validated_data["reference"]
        gateway_status = serializer.validated_data["status"]

        try:
            payment = Payment.objects.get(transaction_id=reference)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Idempotent — skip if already processed
        if payment.status in ("success", "failed"):
            return Response({"message": "Already processed."})

        if gateway_status == "SUCCESSFUL":
            payment.status = "success"
            payment.save()
            publish_event("payment.completed", {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "customer_id": payment.customer_id,
                "amount": str(payment.amount),
                "currency_code": payment.currency_code,
            })
        else:
            payment.status = "failed"
            payment.save()
            publish_event("payment.failed", {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "customer_id": payment.customer_id,
            })

        return Response({"message": "Webhook processed."})


# ─── Refunds ──────────────────────────────────────────────────────────

class RequestRefundView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, payment_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payment = Payment.objects.get(payment_id=payment_id)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "customer" and payment.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if payment.status != "success":
            return Response(
                {"error": "Only successful payments can be refunded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RequestRefundSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        refund = Refund.objects.create(
            payment=payment,
            amount=serializer.validated_data["amount"],
            reason=serializer.validated_data["reason"],
            status="pending",
        )

        return Response(RefundSerializer(refund).data, status=status.HTTP_201_CREATED)


class ProcessRefundView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, refund_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            refund = Refund.objects.select_related("payment").get(refund_id=refund_id)
        except Refund.DoesNotExist:
            return Response({"error": "Refund not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProcessRefundSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        action = serializer.validated_data["action"]

        if action == "approve":
            refund.status = "approved"
            refund.processed_by = payload.get("user_id")
            refund.save()

            refund.payment.status = "refunded"
            refund.payment.save()

            publish_event("payment.refunded", {
                "refund_id": refund.refund_id,
                "payment_id": refund.payment.payment_id,
                "order_id": refund.payment.order_id,
                "customer_id": refund.payment.customer_id,
                "amount": str(refund.amount),
            })
        else:
            refund.status = "rejected"
            refund.processed_by = payload.get("user_id")
            refund.save()

        return Response(RefundSerializer(refund).data)