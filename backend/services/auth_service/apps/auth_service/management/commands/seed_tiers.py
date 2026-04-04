from django.core.management.base import BaseCommand
from apps.auth_service.models import CustomerTier


TIERS = [
    {"tier_name": "Bronze",   "discount_pct": 0.00,  "min_lifetime_value": 0.00},
    {"tier_name": "Silver",   "discount_pct": 5.00,  "min_lifetime_value": 500.00},
    {"tier_name": "Gold",     "discount_pct": 10.00, "min_lifetime_value": 2000.00},
    {"tier_name": "Platinum", "discount_pct": 15.00, "min_lifetime_value": 5000.00},
]


class Command(BaseCommand):
    help = "Seeds the customer_tiers table with default tier data."

    def handle(self, *args, **options):
        created_count = 0
        for tier_data in TIERS:
            obj, created = CustomerTier.objects.get_or_create(
                tier_name=tier_data["tier_name"],
                defaults={
                    "discount_pct": tier_data["discount_pct"],
                    "min_lifetime_value": tier_data["min_lifetime_value"],
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  Created tier: {obj.tier_name}")
            else:
                self.stdout.write(f"  Already exists: {obj.tier_name}")

        self.stdout.write(self.style.SUCCESS(
            f"Done. {created_count} new tier(s) created."
        ))