from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


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
        return self.create_user(email, username, password, **extra_fields)


# ─── User ─────────────────────────────────────────────────────────────

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("customer", "Customer"),
        ("admin", "Admin"),
    ]

    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
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

    def __str__(self):
        return f"Profile({self.user.email})"