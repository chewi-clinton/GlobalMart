from rest_framework import serializers
from .models import Warehouse, Inventory, InventoryHistory


# ─── Warehouse ────────────────────────────────────────────────────────

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = [
            "warehouse_id", "name", "location",
            "capacity", "is_active",
        ]


class WarehouseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["name", "location", "capacity", "is_active"]


# ─── Inventory History ────────────────────────────────────────────────

class InventoryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryHistory
        fields = [
            "history_id", "action", "quantity_change",
            "previous_quantity", "new_quantity",
            "reason", "performed_by", "created_at",
        ]


# ─── Inventory ────────────────────────────────────────────────────────

class InventorySerializer(serializers.ModelSerializer):
    warehouse = WarehouseSerializer(read_only=True)
    history = InventoryHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "inventory_id", "product_id", "variant_id",
            "warehouse", "quantity_on_hand",
            "reorder_threshold", "version", "history",
        ]


class InventoryListSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    warehouse_location = serializers.CharField(source="warehouse.location", read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "inventory_id", "product_id", "variant_id",
            "warehouse_name", "warehouse_location",
            "quantity_on_hand", "reorder_threshold", "version",
        ]


class InventoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = [
            "product_id", "variant_id", "warehouse",
            "quantity_on_hand", "reorder_threshold",
        ]

    def create(self, validated_data):
        return Inventory.objects.create(**validated_data)


class StockAdjustSerializer(serializers.Serializer):
    """Used for manual stock adjustments."""
    quantity = serializers.IntegerField()
    reason = serializers.CharField(max_length=255, required=False, default="Manual adjustment")


class ThresholdUpdateSerializer(serializers.Serializer):
    """Used for updating reorder threshold."""
    reorder_threshold = serializers.IntegerField(min_value=0)


class StockCheckSerializer(serializers.Serializer):
    """Used for pre-order stock validation."""
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)