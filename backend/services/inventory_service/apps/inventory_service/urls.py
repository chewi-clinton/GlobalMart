from django.urls import path
from .views import (
    WarehouseListView,
    WarehouseDetailView,
    InventoryListView,
    InventoryDetailView,
    StockCheckView,
    StockAdjustView,
    ThresholdUpdateView,
)

urlpatterns = [
    # Warehouses
    path("warehouses/", WarehouseListView.as_view(), name="warehouse-list"),
    path("warehouses/<int:warehouse_id>/", WarehouseDetailView.as_view(), name="warehouse-detail"),

    # Inventory
    path("", InventoryListView.as_view(), name="inventory-list"),
    path("<int:inventory_id>/", InventoryDetailView.as_view(), name="inventory-detail"),
    path("<int:inventory_id>/adjust/", StockAdjustView.as_view(), name="stock-adjust"),
    path("<int:inventory_id>/threshold/", ThresholdUpdateView.as_view(), name="threshold-update"),

    # Stock check — called by Order Service
    path("check/", StockCheckView.as_view(), name="stock-check"),
]