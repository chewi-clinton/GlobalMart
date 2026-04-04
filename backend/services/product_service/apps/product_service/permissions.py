from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "seller"


class IsSellerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("seller", "admin")


class IsProductOwnerOrAdmin(BasePermission):
    """Only the seller who owns the product or an admin can edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return obj.seller_id == request.user.user_id