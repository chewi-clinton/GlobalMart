from django.contrib import admin
from .models import Currency, ExchangeRate


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ["currency_code", "currency_name", "symbol", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["currency_code", "currency_name"]


@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ["from_currency", "to_currency", "rate", "effective_date"]
    list_filter = ["effective_date", "from_currency"]
    search_fields = ["from_currency__currency_code", "to_currency__currency_code"]
    ordering = ["-effective_date"]