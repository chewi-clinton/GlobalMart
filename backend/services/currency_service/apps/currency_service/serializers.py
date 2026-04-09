from rest_framework import serializers
from .models import Currency, ExchangeRate


# ─── Currency ─────────────────────────────────────────────────────────

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["currency_code", "currency_name", "symbol", "is_active"]


# ─── Exchange Rate ─────────────────────────────────────────────────────

class ExchangeRateSerializer(serializers.ModelSerializer):
    from_currency = serializers.CharField(source="from_currency_id")
    to_currency = serializers.CharField(source="to_currency_id")

    class Meta:
        model = ExchangeRate
        fields = ["from_currency", "to_currency", "rate", "effective_date", "created_at"]


# ─── Rate Lookup ──────────────────────────────────────────────────────

class RateLookupSerializer(serializers.Serializer):
    """Used for the single rate lookup endpoint."""
    from_currency = serializers.CharField(max_length=3)
    to_currency = serializers.CharField(max_length=3)
    rate = serializers.DecimalField(max_digits=12, decimal_places=6)
    effective_date = serializers.DateField()


# ─── Conversion ───────────────────────────────────────────────────────

class ConversionSerializer(serializers.Serializer):
    """Used for the amount conversion endpoint."""
    from_currency = serializers.CharField(max_length=3)
    to_currency = serializers.CharField(max_length=3)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    converted_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    rate = serializers.DecimalField(max_digits=12, decimal_places=6)
    effective_date = serializers.DateField()