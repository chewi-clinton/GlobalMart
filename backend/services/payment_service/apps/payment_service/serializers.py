from rest_framework import serializers
from .models import Payment, Refund


# ─── Payment ──────────────────────────────────────────────────────────

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "payment_id", "order_id", "customer_id",
            "amount", "currency_code", "payment_method",
            "status", "transaction_id", "phone_number",
            "created_at", "updated_at",
        ]


class InitiatePaymentSerializer(serializers.Serializer):
    """Used when a customer initiates a payment."""
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency_code = serializers.CharField(max_length=3, default="XAF")
    payment_method = serializers.ChoiceField(choices=["mtn_momo", "orange_money", "card"])
    phone_number = serializers.CharField(max_length=20, required=False, default="")


class PaymentWebhookSerializer(serializers.Serializer):
    """Used for CamPay webhook callbacks."""
    reference = serializers.CharField()
    status = serializers.CharField()
    amount = serializers.CharField(required=False)
    operator = serializers.CharField(required=False)


# ─── Refund ───────────────────────────────────────────────────────────

class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = [
            "refund_id", "payment", "amount",
            "reason", "status", "processed_by",
            "created_at", "updated_at",
        ]


class RequestRefundSerializer(serializers.Serializer):
    """Used when a customer requests a refund."""
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    reason = serializers.CharField(required=False, default="")


class ProcessRefundSerializer(serializers.Serializer):
    """Used when admin approves or rejects a refund."""
    action = serializers.ChoiceField(choices=["approve", "reject"])