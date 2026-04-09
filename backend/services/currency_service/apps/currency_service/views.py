from decimal import Decimal
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Currency, ExchangeRate
from .serializers import (
    CurrencySerializer,
    ExchangeRateSerializer,
    RateLookupSerializer,
    ConversionSerializer,
)


# ─── Currencies ───────────────────────────────────────────────────────

class CurrencyListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        currencies = Currency.objects.filter(is_active=True).order_by("currency_code")
        serializer = CurrencySerializer(currencies, many=True)
        return Response(serializer.data)


# ─── Exchange Rates ───────────────────────────────────────────────────

class ExchangeRateListView(APIView):
    """Returns the latest rate for every currency pair."""
    permission_classes = [AllowAny]

    def get(self, request):
        # Get latest effective date
        latest = ExchangeRate.objects.order_by("-effective_date").first()
        if not latest:
            return Response({"error": "No exchange rates available."}, status=status.HTTP_404_NOT_FOUND)

        rates = ExchangeRate.objects.filter(
            effective_date=latest.effective_date
        ).select_related("from_currency", "to_currency")

        serializer = ExchangeRateSerializer(rates, many=True)
        return Response(serializer.data)


# ─── Single Rate Lookup ───────────────────────────────────────────────

class RateLookupView(APIView):
    """
    GET /api/currencies/rate/?from=USD&to=XAF
    Returns the latest rate for a specific currency pair.
    Called by Order Service via HTTP.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from_code = request.query_params.get("from", "").upper()
        to_code = request.query_params.get("to", "").upper()

        if not from_code or not to_code:
            return Response(
                {"error": "Both 'from' and 'to' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Same currency — rate is always 1
        if from_code == to_code:
            return Response({
                "from_currency": from_code,
                "to_currency": to_code,
                "rate": "1.000000",
                "effective_date": None,
            })

        rate = ExchangeRate.objects.filter(
            from_currency_id=from_code,
            to_currency_id=to_code,
        ).order_by("-effective_date").first()

        if not rate:
            return Response(
                {"error": f"No rate found for {from_code} → {to_code}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RateLookupSerializer({
            "from_currency": rate.from_currency_id,
            "to_currency": rate.to_currency_id,
            "rate": rate.rate,
            "effective_date": rate.effective_date,
        })
        return Response(serializer.data)


# ─── Conversion ───────────────────────────────────────────────────────

class ConvertView(APIView):
    """
    GET /api/currencies/convert/?amount=100&from=USD&to=XAF
    Converts an amount from one currency to another.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from_code = request.query_params.get("from", "").upper()
        to_code = request.query_params.get("to", "").upper()
        amount_str = request.query_params.get("amount")

        if not from_code or not to_code or not amount_str:
            return Response(
                {"error": "Parameters 'amount', 'from' and 'to' are all required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(amount_str)
        except Exception:
            return Response(
                {"error": "Invalid amount."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if from_code == to_code:
            return Response({
                "from_currency": from_code,
                "to_currency": to_code,
                "amount": amount,
                "converted_amount": amount,
                "rate": "1.000000",
                "effective_date": None,
            })

        rate = ExchangeRate.objects.filter(
            from_currency_id=from_code,
            to_currency_id=to_code,
        ).order_by("-effective_date").first()

        if not rate:
            return Response(
                {"error": f"No rate found for {from_code} → {to_code}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        converted = (amount * rate.rate).quantize(Decimal("0.01"))

        serializer = ConversionSerializer({
            "from_currency": from_code,
            "to_currency": to_code,
            "amount": amount,
            "converted_amount": converted,
            "rate": rate.rate,
            "effective_date": rate.effective_date,
        })
        return Response(serializer.data)


# ─── Manual Sync ──────────────────────────────────────────────────────

class SyncRatesView(APIView):
    """
    POST /api/currencies/sync/
    Admin only — triggers a manual sync from Open Exchange Rates API.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            from .tasks import sync_exchange_rates
            sync_exchange_rates()
            return Response({"message": "Exchange rates synced successfully."})
        except Exception as e:
            return Response(
                {"error": f"Sync failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )