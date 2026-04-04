from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    ProductListView,
    ProductDetailView,
    ProductCreateView,
    ProductUpdateView,
    ProductDeleteView,
    ProductVariantListView,
    ProductVariantCreateView,
    ProductImageListView,
    ProductImageCreateView,
)

urlpatterns = [
    # Categories
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<int:category_id>/", CategoryDetailView.as_view(), name="category-detail"),

    # Products
    path("", ProductListView.as_view(), name="product-list"),
    path("<int:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path("create/", ProductCreateView.as_view(), name="product-create"),
    path("<int:product_id>/update/", ProductUpdateView.as_view(), name="product-update"),
    path("<int:product_id>/delete/", ProductDeleteView.as_view(), name="product-delete"),

    # Variants
    path("<int:product_id>/variants/", ProductVariantListView.as_view(), name="variant-list"),
    path("<int:product_id>/variants/add/", ProductVariantCreateView.as_view(), name="variant-add"),

    # Images
    path("<int:product_id>/images/", ProductImageListView.as_view(), name="image-list"),
    path("<int:product_id>/images/add/", ProductImageCreateView.as_view(), name="image-add"),
]