import secrets
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta


# ─── Customer Tiers ───────────────────────────────────────────────────

class CustomerTier(models.Model):
    tier_id = models.AutoField(primary_key=True)
    tier_name = models.CharField(max_length=20)
    discount_pct = models.DecimalField(max_digits=5, decimal_places=2)
    min_lifetime_value = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "customer_tiers"

    def __str__(self):
        return self.tier_name


# ─── User Manager ─────────────────────────────────────────────────────

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, role="customer", **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)
        return self.create_user(email, username, password, **extra_fields)


# ─── User ─────────────────────────────────────────────────────────────

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("customer", "Customer"),
        ("seller", "Seller"),
        ("admin", "Admin"),
    ]

    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")

    # Verification
    is_verified = models.BooleanField(default=False)

    # Django internals
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
            models.Index(fields=["is_verified"]),
        ]

    def __str__(self):
        return self.email


# ─── Customer Profile ─────────────────────────────────────────────────

class CustomerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="customer_profile",
        db_column="user_id",
    )
    tier = models.ForeignKey(
        CustomerTier,
        on_delete=models.SET_NULL,
        null=True,
        related_name="customers",
        db_column="tier_id",
    )
    lifetime_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    registered_date = models.DateField(auto_now_add=True)

    class Meta:
        db_table = "customer_profiles"
        indexes = [
            models.Index(fields=["tier"]),
        ]



def _default_reset_expiry():
    return timezone.now() + timedelta(hours=1)


class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
    )
    token = models.CharField(max_length=64, unique=True, default=secrets.token_urlsafe)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=_default_reset_expiry)
    used = models.BooleanField(default=False)

    class Meta:
        db_table = "password_reset_tokens"
        indexes = [
            models.Index(fields=["token"]),
        ]

    def is_valid(self):
        return not self.used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"ResetToken({self.user.email})"