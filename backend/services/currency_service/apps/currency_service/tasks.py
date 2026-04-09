import logging
import requests
from datetime import date
from django.conf import settings
from .models import Currency, ExchangeRate

logger = logging.getLogger(__name__)

# Common currencies to seed
CURRENCIES = {
    "USD": {"name": "US Dollar", "symbol": "$"},
    "EUR": {"name": "Euro", "symbol": "€"},
    "GBP": {"name": "British Pound", "symbol": "£"},
    "XAF": {"name": "Central African CFA Franc", "symbol": "FCFA"},
    "NGN": {"name": "Nigerian Naira", "symbol": "₦"},
    "GHS": {"name": "Ghanaian Cedi", "symbol": "₵"},
    "KES": {"name": "Kenyan Shilling", "symbol": "KSh"},
    "ZAR": {"name": "South African Rand", "symbol": "R"},
    "CNY": {"name": "Chinese Yuan", "symbol": "¥"},
    "JPY": {"name": "Japanese Yen", "symbol": "¥"},
    "CAD": {"name": "Canadian Dollar", "symbol": "CA$"},
    "AUD": {"name": "Australian Dollar", "symbol": "A$"},
    "INR": {"name": "Indian Rupee", "symbol": "₹"},
    "CHF": {"name": "Swiss Franc", "symbol": "CHF"},
}


def sync_exchange_rates():
    """
    Fetches latest exchange rates from Open Exchange Rates API
    and stores them in the database.
    Called by Celery beat every hour and by the manual sync endpoint.
    """
    app_id = settings.OPEN_EXCHANGE_RATES_APP_ID
    base = settings.BASE_CURRENCY

    if not app_id:
        logger.error("OPEN_EXCHANGE_RATES_APP_ID is not set")
        return

    try:
        logger.info("Fetching exchange rates from Open Exchange Rates...")
        url = f"https://openexchangerates.org/api/latest.json?app_id={app_id}&base={base}"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        rates = data.get("rates", {})
        today = date.today()

        # Ensure all currencies exist
        for code, info in CURRENCIES.items():
            Currency.objects.get_or_create(
                currency_code=code,
                defaults={
                    "currency_name": info["name"],
                    "symbol": info["symbol"],
                },
            )

        # Ensure base currency exists
        Currency.objects.get_or_create(
            currency_code=base,
            defaults={"currency_name": "US Dollar", "symbol": "$"},
        )

        created_count = 0
        for to_code, rate_value in rates.items():
            if to_code not in CURRENCIES and to_code != base:
                continue

            try:
                to_currency = Currency.objects.get(currency_code=to_code)
                from_currency = Currency.objects.get(currency_code=base)

                _, created = ExchangeRate.objects.update_or_create(
                    from_currency=from_currency,
                    to_currency=to_currency,
                    effective_date=today,
                    defaults={"rate": rate_value},
                )
                if created:
                    created_count += 1
            except Currency.DoesNotExist:
                continue

        logger.info(f"Exchange rates synced. {created_count} new rate(s) created.")

    except requests.RequestException as e:
        logger.error(f"Failed to fetch exchange rates: {e}")
    except Exception as e:
        logger.error(f"Unexpected error syncing rates: {e}")