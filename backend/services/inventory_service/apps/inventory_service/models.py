from django.db import models


# ─── Warehouse ────────────────────────────────────────────────────────

class Warehouse(models.Model):
    warehouse_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "warehouses"
        indexes = [
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.name} — {self.location}"


# ─── Inventory ────────────────────────────────────────────────────────

class Inventory(models.Model):
    inventory_id = models.AutoField(primary_key=True)
    product_id = models.IntegerField(db_index=True)    # FK to product_service
    variant_id = models.IntegerField(null=True, blank=True, db_index=True)  # optional variant
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="inventory",
        db_column="warehouse_id",
    )
    quantity_on_hand = models.IntegerField(default=0)
    reorder_threshold = models.IntegerField(default=10)
    version = models.IntegerField(default=0)  # optimistic locking CAS column

    class Meta:
        db_table = "inventory"
        unique_together = [["product_id", "variant_id", "warehouse"]]
        indexes = [
            models.Index(fields=["product_id"]),
            models.Index(fields=["variant_id"]),
            models.Index(fields=["warehouse"]),
        ]

    def __str__(self):
        return f"Product {self.product_id} @ Warehouse {self.warehouse_id} — {self.quantity_on_hand} units"


# ─── Inventory History ────────────────────────────────────────────────

class InventoryHistory(models.Model):
    ACTION_CHOICES = [
        ("addition", "Addition"),
        ("deduction", "Deduction"),
        ("adjustment", "Adjustment"),
        ("transfer", "Transfer"),
        ("reservation", "Reservation"),
        ("release", "Release"),
    ]

    history_id = models.BigAutoField(primary_key=True)
    inventory = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE,
        related_name="history",
        db_column="inventory_id",
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    quantity_change = models.IntegerField()
    previous_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    reason = models.CharField(max_length=255, blank=True)
    performed_by = models.IntegerField(null=True, blank=True)  # user_id from auth service
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_history"
        indexes = [
            models.Index(fields=["inventory"]),
            models.Index(fields=["created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} — {self.quantity_change} units @ {self.created_at}"