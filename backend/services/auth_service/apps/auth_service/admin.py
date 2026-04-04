from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, CustomerTier, CustomerProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "role", "is_active", "created_at"]
    list_filter = ["role", "is_active"]
    search_fields = ["email", "username"]
    ordering = ["-created_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("username", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "role", "password1", "password2"),
        }),
    )


@admin.register(CustomerTier)
class CustomerTierAdmin(admin.ModelAdmin):
    list_display = ["tier_name", "discount_pct", "min_lifetime_value"]


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "tier", "lifetime_value", "registered_date"]
    list_filter = ["tier"]