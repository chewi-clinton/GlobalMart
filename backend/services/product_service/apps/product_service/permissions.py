from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.get("role") == "admin"


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.get("role") == "seller"


class IsSellerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.get("role") in ("seller", "admin")


class IsProductOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.seller_id == request.user.get("user_id")