from django.apps import AppConfig


class InventoryServiceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.inventory_service"
    label = "inventory_service"