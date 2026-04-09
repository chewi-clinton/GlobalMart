from django.db import models


# ─── Currency ─────────────────────────────────────────────────────────

class Currency(models.Model):
    currency_code = models.CharField(max_length=3, primary_key=True)
    currency_name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "currencies"

    def __str__(self):
        return f"{self.currency_code} — {self.currency_name}"


# ─── Exchange Rate ─────────────────────────────────────────────────────

class ExchangeRate(models.Model):
    from_currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        related_name="rates_from",
        db_column="from_currency",
    )
    to_currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        related_name="rates_to",
        db_column="to_currency",
    )
    rate = models.DecimalField(max_digits=12, decimal_places=6)
    effective_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "exchange_rates"
        unique_together = [["from_currency", "to_currency", "effective_date"]]
        indexes = [
            models.Index(fields=["from_currency", "to_currency"]),
            models.Index(fields=["effective_date"]),
        ]
        ordering = ["-effective_date"]

    def __str__(self):
        return f"{self.from_currency_id} → {self.to_currency_id} @ {self.rate}"