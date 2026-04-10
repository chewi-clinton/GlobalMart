from rest_framework import serializers
from .models import Order, OrderItem


# ─── Order Item ───────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "order_item_id", "line_number", "product_id",
            "variant_id", "seller_id", "quantity",
            "unit_price", "total_price",
        ]


class OrderItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    seller_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)


# ─── Order ────────────────────────────────────────────────────────────

class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "order_id", "customer_id", "order_date",
            "status", "payment_status", "total_amount",
            "discount_amount", "currency_code", "items_count",
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "order_id", "customer_id", "order_date",
            "status", "payment_status", "total_amount",
            "discount_amount", "currency_code",
            "shipping_address", "notes", "items",
            "updated_at",
        ]


class PlaceOrderSerializer(serializers.Serializer):
    """Used when a customer places an order."""
    items = OrderItemWriteSerializer(many=True)
    currency_code = serializers.CharField(max_length=3, default="XAF")
    shipping_address = serializers.CharField(required=False, default="")
    notes = serializers.CharField(required=False, default="")


class CancelOrderSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, default="Cancelled by customer")