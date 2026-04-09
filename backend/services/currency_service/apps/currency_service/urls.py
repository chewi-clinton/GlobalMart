from django.urls import path
from .views import (
    CurrencyListView,
    ExchangeRateListView,
    RateLookupView,
    ConvertView,
    SyncRatesView,
)

urlpatterns = [
    # Currencies
    path("", CurrencyListView.as_view(), name="currency-list"),

    # Rates
    path("rates/", ExchangeRateListView.as_view(), name="exchange-rate-list"),
    path("rate/", RateLookupView.as_view(), name="rate-lookup"),

    # Conversion
    path("convert/", ConvertView.as_view(), name="convert"),

    # Sync
    path("sync/", SyncRatesView.as_view(), name="sync-rates"),
]