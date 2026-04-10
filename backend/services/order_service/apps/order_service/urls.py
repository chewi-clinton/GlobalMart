from django.urls import path
from .views import (
    OrderListView,
    OrderDetailView,
    CancelOrderView,
    AdminOrderListView,
)

urlpatterns = [
    # Customer orders
    path("", OrderListView.as_view(), name="order-list"),
    path("<int:order_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("<int:order_id>/cancel/", CancelOrderView.as_view(), name="order-cancel"),

    # Admin
    path("admin/all/", AdminOrderListView.as_view(), name="admin-order-list"),
]