from django.db import models


# ─── Payment ──────────────────────────────────────────────────────────

class Payment(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    METHOD_CHOICES = [
        ("mtn_momo", "MTN Mobile Money"),
        ("orange_money", "Orange Money"),
        ("card", "Credit/Debit Card"),
    ]

    payment_id = models.AutoField(primary_key=True)
    order_id = models.IntegerField(db_index=True, unique=True)  # FK to order_service
    customer_id = models.IntegerField(db_index=True)            # FK to auth_service
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency_code = models.CharField(max_length=3, default="XAF")
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    transaction_id = models.CharField(max_length=255, blank=True)  # CamPay transaction ID
    phone_number = models.CharField(max_length=20, blank=True)     # MoMo phone number
    gateway_response = models.JSONField(default=dict, blank=True)  # raw gateway response
    idempotency_key = models.CharField(max_length=255, unique=True)  # prevent duplicate processing
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        indexes = [
            models.Index(fields=["order_id"]),
            models.Index(fields=["customer_id"]),
            models.Index(fields=["status"]),
            models.Index(fields=["transaction_id"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment #{self.payment_id} — Order {self.order_id} — {self.status}"


# ─── Refund ───────────────────────────────────────────────────────────

class Refund(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("processed", "Processed"),
    ]

    refund_id = models.AutoField(primary_key=True)
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="refunds",
        db_column="payment_id",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    processed_by = models.IntegerField(null=True, blank=True)  # admin user_id
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "refunds"
        indexes = [
            models.Index(fields=["payment"]),
            models.Index(fields=["status"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Refund #{self.refund_id} — Payment {self.payment_id} — {self.status}"