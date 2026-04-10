from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["line_number", "product_id", "variant_id", "seller_id", "quantity", "unit_price", "total_price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_id", "customer_id", "status", "payment_status", "total_amount", "currency_code", "order_date"]
    list_filter = ["status", "payment_status", "currency_code"]
    search_fields = ["customer_id", "order_id"]
    ordering = ["-order_date"]
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "line_number", "product_id", "seller_id", "quantity", "unit_price", "total_price"]
    search_fields = ["product_id", "seller_id"]