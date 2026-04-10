from django.apps import AppConfig


class OrderServiceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.order_service"
    label = "order_service"