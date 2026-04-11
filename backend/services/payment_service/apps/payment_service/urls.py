from django.urls import path
from .views import (
    PaymentListView,
    InitiatePaymentView,
    PaymentDetailView,
    PaymentWebhookView,
    RequestRefundView,
    ProcessRefundView,
)

urlpatterns = [
    # Payments
    path("", PaymentListView.as_view(), name="payment-list"),
    path("initiate/", InitiatePaymentView.as_view(), name="initiate-payment"),
    path("<int:payment_id>/", PaymentDetailView.as_view(), name="payment-detail"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),

    # Refunds
    path("<int:payment_id>/refund/", RequestRefundView.as_view(), name="request-refund"),
    path("refunds/<int:refund_id>/process/", ProcessRefundView.as_view(), name="process-refund"),
]