from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage


# ─── Category ─────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "category_id", "name", "slug", "parent",
            "description", "is_active", "children",
        ]

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "slug", "parent", "description", "is_active"]


# ─── Product Image ────────────────────────────────────────────────────

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "image_id", "image_url", "alt_text",
            "is_primary", "display_order",
        ]


# ─── Product Variant ──────────────────────────────────────────────────

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            "variant_id", "sku", "variant_attributes",
            "price_override", "is_active",
        ]


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["sku", "variant_attributes", "price_override", "is_active"]

    def create(self, validated_data):
        product = self.context["product"]
        return ProductVariant.objects.create(product=product, **validated_data)


# ─── Product ──────────────────────────────────────────────────────────

class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing products."""
    category_name = serializers.CharField(source="category.name", read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "product_id", "title", "slug", "base_price",
            "currency_code", "status", "category_name",
            "primary_image", "created_at",
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first()
        if image:
            return image.image_url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail — includes variants and images."""
    category = CategorySerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "product_id", "seller_id", "title", "slug",
            "description", "base_price", "currency_code",
            "specs", "status", "category", "variants",
            "images", "created_at", "updated_at",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating products."""

    class Meta:
        model = Product
        fields = [
            "title", "slug", "description", "base_price",
            "currency_code", "specs", "status", "category",
        ]

    def create(self, validated_data):
        seller_id = self.context["seller_id"]
        return Product.objects.create(seller_id=seller_id, **validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ─── Product Image Write ──────────────────────────────────────────────

class ProductImageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["image_url", "alt_text", "is_primary", "display_order"]

    def create(self, validated_data):
        product = self.context["product"]
        # If this image is set as primary, unset all others
        if validated_data.get("is_primary"):
            ProductImage.objects.filter(product=product).update(is_primary=False)
        return ProductImage.objects.create(product=product, **validated_data)