from django.contrib import admin
from .models import Warehouse, Inventory, InventoryHistory


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "capacity", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "location"]


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ["product_id", "variant_id", "warehouse", "quantity_on_hand", "reorder_threshold", "version"]
    list_filter = ["warehouse"]
    search_fields = ["product_id"]


@admin.register(InventoryHistory)
class InventoryHistoryAdmin(admin.ModelAdmin):
    list_display = ["inventory", "action", "quantity_change", "previous_quantity", "new_quantity", "created_at"]
    list_filter = ["action"]
    ordering = ["-created_at"]