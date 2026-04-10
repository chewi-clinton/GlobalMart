from django.core.management.base import BaseCommand
from apps.inventory_service.models import Warehouse


WAREHOUSES = [
    {
        "name": "Main Warehouse Yaoundé",
        "location": "Yaoundé, Centre Region, Cameroon",
        "capacity": 10000,
    },
    {
        "name": "Douala Warehouse",
        "location": "Douala, Littoral Region, Cameroon",
        "capacity": 8000,
    },
    {
        "name": "Bafoussam Warehouse",
        "location": "Bafoussam, West Region, Cameroon",
        "capacity": 5000,
    },
]


class Command(BaseCommand):
    help = "Seeds the warehouses table with default warehouse data."

    def handle(self, *args, **options):
        created_count = 0
        for warehouse_data in WAREHOUSES:
            obj, created = Warehouse.objects.get_or_create(
                name=warehouse_data["name"],
                defaults={
                    "location": warehouse_data["location"],
                    "capacity": warehouse_data["capacity"],
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  Created: {obj.name}")
            else:
                self.stdout.write(f"  Already exists: {obj.name}")

        self.stdout.write(self.style.SUCCESS(
            f"Done. {created_count} new warehouse(s) created."
        ))