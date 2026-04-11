from django.contrib import admin
from .models import Payment, Refund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "payment_id", "order_id", "customer_id",
        "amount", "currency_code", "payment_method",
        "status", "created_at",
    ]
    list_filter = ["status", "payment_method", "currency_code"]
    search_fields = ["order_id", "customer_id", "transaction_id"]
    ordering = ["-created_at"]
    readonly_fields = ["idempotency_key", "gateway_response", "transaction_id"]


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = [
        "refund_id", "payment", "amount",
        "status", "processed_by", "created_at",
    ]
    list_filter = ["status"]
    ordering = ["-created_at"]