from django.db import models


# ─── Order ────────────────────────────────────────────────────────────

class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    order_id = models.AutoField(primary_key=True)
    customer_id = models.IntegerField(db_index=True)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="unpaid")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency_code = models.CharField(max_length=3, default="XAF")
    shipping_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        indexes = [
            models.Index(fields=["customer_id"]),
            models.Index(fields=["status"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["order_date"]),
        ]
        ordering = ["-order_date"]

    def __str__(self):
        return f"Order #{self.order_id} — {self.customer_id} — {self.status}"


# ─── Order Item ───────────────────────────────────────────────────────

class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        db_column="order_id",
    )
    line_number = models.IntegerField()
    product_id = models.IntegerField(db_index=True)
    variant_id = models.IntegerField(null=True, blank=True)
    seller_id = models.IntegerField(db_index=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "order_items"
        unique_together = [["order", "line_number"]]
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["product_id"]),
            models.Index(fields=["seller_id"]),
        ]

    def __str__(self):
        return f"Order #{self.order_id} — Line {self.line_number} — Product {self.product_id}"