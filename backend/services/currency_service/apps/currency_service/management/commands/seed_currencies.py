from django.core.management.base import BaseCommand
from apps.currency_service.models import Currency


CURRENCIES = [
    {"currency_code": "USD", "currency_name": "US Dollar", "symbol": "$"},
    {"currency_code": "EUR", "currency_name": "Euro", "symbol": "€"},
    {"currency_code": "GBP", "currency_name": "British Pound", "symbol": "£"},
    {"currency_code": "XAF", "currency_name": "Central African CFA Franc", "symbol": "FCFA"},
    {"currency_code": "NGN", "currency_name": "Nigerian Naira", "symbol": "₦"},
    {"currency_code": "GHS", "currency_name": "Ghanaian Cedi", "symbol": "₵"},
    {"currency_code": "KES", "currency_name": "Kenyan Shilling", "symbol": "KSh"},
    {"currency_code": "ZAR", "currency_name": "South African Rand", "symbol": "R"},
    {"currency_code": "CNY", "currency_name": "Chinese Yuan", "symbol": "¥"},
    {"currency_code": "JPY", "currency_name": "Japanese Yen", "symbol": "¥"},
    {"currency_code": "CAD", "currency_name": "Canadian Dollar", "symbol": "CA$"},
    {"currency_code": "AUD", "currency_name": "Australian Dollar", "symbol": "A$"},
    {"currency_code": "INR", "currency_name": "Indian Rupee", "symbol": "₹"},
    {"currency_code": "CHF", "currency_name": "Swiss Franc", "symbol": "CHF"},
]


class Command(BaseCommand):
    help = "Seeds the currencies table with default currencies."

    def handle(self, *args, **options):
        created_count = 0
        for currency_data in CURRENCIES:
            obj, created = Currency.objects.get_or_create(
                currency_code=currency_data["currency_code"],
                defaults={
                    "currency_name": currency_data["currency_name"],
                    "symbol": currency_data["symbol"],
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  Created: {obj.currency_code} — {obj.currency_name}")
            else:
                self.stdout.write(f"  Already exists: {obj.currency_code}")

        self.stdout.write(self.style.SUCCESS(
            f"Done. {created_count} new currency(ies) created."
        ))