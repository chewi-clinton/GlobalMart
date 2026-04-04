from django.db import models


# ─── Category ─────────────────────────────────────────────────────────

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
        db_column="parent_id",
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories"
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["parent"]),
        ]

    def __str__(self):
        return self.name


# ─── Product ──────────────────────────────────────────────────────────

class Product(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("pending", "Pending"),
    ]

    product_id = models.AutoField(primary_key=True)
    seller_id = models.IntegerField(db_index=True)  # FK to user_service (no cross-DB FK)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="products",
        db_column="category_id",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    currency_code = models.CharField(max_length=3, default="USD")
    specs = models.JSONField(default=dict, blank=True)  # JSONB — product specifications
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        indexes = [
            models.Index(fields=["seller_id"]),
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self):
        return self.title


# ─── Product Variant ──────────────────────────────────────────────────

class ProductVariant(models.Model):
    variant_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
        db_column="product_id",
    )
    sku = models.CharField(max_length=100, unique=True)
    variant_attributes = models.JSONField(default=dict, blank=True)  # JSONB e.g. {"color": "red", "size": "XL"}
    price_override = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True
    )  # if null, use product base_price
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "product_variants"
        indexes = [
            models.Index(fields=["product"]),
            models.Index(fields=["sku"]),
        ]

    def __str__(self):
        return f"{self.product.title} — {self.sku}"


# ─── Product Image ────────────────────────────────────────────────────

class ProductImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        db_column="product_id",
    )
    image_url = models.CharField(max_length=500)  # Cloudflare R2 URL
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_images"
        indexes = [
            models.Index(fields=["product"]),
        ]
        ordering = ["display_order"]

    def __str__(self):
        return f"Image({self.product.title} — {self.image_id})"