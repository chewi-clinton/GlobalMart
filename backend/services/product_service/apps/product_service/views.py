from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Category, Product, ProductVariant, ProductImage
from .serializers import (
    CategorySerializer,
    CategoryWriteSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    ProductVariantSerializer,
    ProductVariantWriteSerializer,
    ProductImageSerializer,
    ProductImageWriteSerializer,
)
from .permissions import IsAdmin, IsSeller, IsSellerOrAdmin
from .events import publish_event


# ─── Helper ───────────────────────────────────────────────────────────

def get_token_payload(request):
    """Extract JWT payload from request — returns dict or None."""
    try:
        authenticator = JWTAuthentication()
        result = authenticator.authenticate(request)
        if result is None:
            return None
        _, token = result
        return token.payload
    except (InvalidToken, TokenError):
        return None


# ─── Categories ───────────────────────────────────────────────────────

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.filter(
            parent=None, is_active=True
        ).prefetch_related("children")
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = CategoryWriteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, category_id):
        try:
            return Category.objects.get(category_id=category_id)
        except Category.DoesNotExist:
            return None

    def get(self, request, category_id):
        category = self.get_object(category_id)
        if not category:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CategorySerializer(category).data)

    def put(self, request, category_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        category = self.get_object(category_id)
        if not category:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CategoryWriteSerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Products ─────────────────────────────────────────────────────────

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Product.objects.select_related("category").prefetch_related("images")

        category_id = request.query_params.get("category")
        status_filter = request.query_params.get("status", "active")
        seller_id = request.query_params.get("seller_id")
        search = request.query_params.get("search")

        if category_id:
            qs = qs.filter(category_id=category_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if seller_id:
            qs = qs.filter(seller_id=seller_id)
        if search:
            qs = qs.filter(title__icontains=search)

        serializer = ProductListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("seller", "admin"):
            return Response({"error": "Seller or admin access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductWriteSerializer(
            data=request.data,
            context={"seller_id": payload.get("user_id")}
        )
        if serializer.is_valid():
            product = serializer.save()
            publish_event("product.created", {
                "product_id": product.product_id,
                "seller_id": product.seller_id,
                "title": product.title,
            })
            return Response(
                ProductDetailSerializer(product).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, product_id):
        try:
            return Product.objects.select_related("category").prefetch_related(
                "variants", "images"
            ).get(product_id=product_id)
        except Product.DoesNotExist:
            return None

    def get(self, request, product_id):
        product = self.get_object(product_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductDetailSerializer(product).data)

    def put(self, request, product_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("seller", "admin"):
            return Response({"error": "Seller or admin access required."}, status=status.HTTP_403_FORBIDDEN)

        product = self.get_object(product_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "seller" and product.seller_id != payload.get("user_id"):
            return Response({"error": "You can only update your own products."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductWriteSerializer(
            product, data=request.data, partial=True,
            context={"seller_id": product.seller_id}
        )
        if serializer.is_valid():
            product = serializer.save()
            publish_event("product.updated", {
                "product_id": product.product_id,
                "seller_id": product.seller_id,
            })
            return Response(ProductDetailSerializer(product).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, product_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("seller", "admin"):
            return Response({"error": "Seller or admin access required."}, status=status.HTTP_403_FORBIDDEN)

        product = self.get_object(product_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "seller" and product.seller_id != payload.get("user_id"):
            return Response({"error": "You can only deactivate your own products."}, status=status.HTTP_403_FORBIDDEN)

        product.status = "inactive"
        product.save()
        publish_event("product.updated", {
            "product_id": product.product_id,
            "seller_id": product.seller_id,
            "status": "inactive",
        })
        return Response({"message": "Product deactivated."})


# ─── Product Variants ─────────────────────────────────────────────────

class ProductVariantListView(APIView):
    permission_classes = [AllowAny]

    def get_product(self, product_id):
        try:
            return Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return None

    def get(self, request, product_id):
        product = self.get_product(product_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        variants = product.variants.filter(is_active=True)
        return Response(ProductVariantSerializer(variants, many=True).data)

    def post(self, request, product_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("seller", "admin"):
            return Response({"error": "Seller or admin access required."}, status=status.HTTP_403_FORBIDDEN)

        product = self.get_product(product_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "seller" and product.seller_id != payload.get("user_id"):
            return Response({"error": "You can only add variants to your own products."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductVariantWriteSerializer(
            data=request.data, context={"product": product}
        )
        if serializer.is_valid():
            variant = serializer.save()
            return Response(ProductVariantSerializer(variant).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Product Images ───────────────────────────────────────────────────

class ProductImageListView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_product(self, product_id):
        try:
            return Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return None

    def get(self, request, product_id):
        product = self.get_product(product_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        images = product.images.all()
        return Response(ProductImageSerializer(images, many=True).data)

    def post(self, request, product_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("seller", "admin"):
            return Response({"error": "Seller or admin access required."}, status=status.HTTP_403_FORBIDDEN)

        product = self.get_product(product_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "seller" and product.seller_id != payload.get("user_id"):
            return Response({"error": "You can only add images to your own products."}, status=status.HTTP_403_FORBIDDEN)

        # Handle file upload to R2
        file = request.FILES.get("image")
        if not file:
            return Response({"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from .r2_upload import upload_image_to_r2
            image_url = upload_image_to_r2(file)
        except Exception as e:
            return Response(
                {"error": f"Image upload failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        is_primary = request.data.get("is_primary", "false").lower() == "true"
        alt_text = request.data.get("alt_text", "")
        display_order = int(request.data.get("display_order", 0))

        # If primary unset all others
        if is_primary:
            ProductImage.objects.filter(product=product).update(is_primary=False)

        image = ProductImage.objects.create(
            product=product,
            image_url=image_url,
            alt_text=alt_text,
            is_primary=is_primary,
            display_order=display_order,
        )

        return Response(ProductImageSerializer(image).data, status=status.HTTP_201_CREATED)