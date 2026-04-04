from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    ProductListView,
    ProductDetailView,
    ProductVariantListView,
    ProductImageListView,
)

urlpatterns = [
    # Categories
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<int:category_id>/", CategoryDetailView.as_view(), name="category-detail"),

    # Products
    path("", ProductListView.as_view(), name="product-list"),
    path("<int:product_id>/", ProductDetailView.as_view(), name="product-detail"),

    # Variants
    path("<int:product_id>/variants/", ProductVariantListView.as_view(), name="variant-list"),

    # Images
    path("<int:product_id>/images/", ProductImageListView.as_view(), name="image-list"),
]