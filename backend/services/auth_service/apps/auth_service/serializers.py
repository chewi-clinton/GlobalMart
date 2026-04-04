from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, CustomerProfile, CustomerTier


# ─── JWT ──────────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Injects user_id, email, username, role, is_verified into the JWT payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["user_id"] = user.user_id
        token["email"] = user.email
        token["username"] = user.username
        token["role"] = user.role
        token["is_verified"] = user.is_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Attach user info to the login response body as well
        data["user"] = {
            "user_id": self.user.user_id,
            "email": self.user.email,
            "username": self.user.username,
            "role": self.user.role,
            "is_verified": self.user.is_verified,
        }
        return data


# ─── Tiers ────────────────────────────────────────────────────────────

class CustomerTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTier
        fields = ["tier_id", "tier_name", "discount_pct", "min_lifetime_value"]


# ─── Registration ─────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["email", "username", "password", "phone", "role"]
        extra_kwargs = {
            "phone": {"required": False},
            "role": {"required": False},
        }

    def validate_role(self, value):
        # Public registration only allows customer or seller
        allowed = ["customer", "seller"]
        if value not in allowed:
            raise serializers.ValidationError(
                f"Role must be one of: {', '.join(allowed)}."
            )
        return value

    def create(self, validated_data):
        role = validated_data.get("role", "customer")
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            phone=validated_data.get("phone"),
            role=role,
        )
        # Only customers get a tier profile
        if role == "customer":
            entry_tier = CustomerTier.objects.order_by("min_lifetime_value").first()
            CustomerProfile.objects.create(user=user, tier=entry_tier)
        return user


# ─── Profile ──────────────────────────────────────────────────────────

class CustomerProfileSerializer(serializers.ModelSerializer):
    tier = CustomerTierSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ["tier", "lifetime_value", "registered_date"]


class UserProfileSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "user_id", "email", "username", "phone", "role",
            "is_verified", "created_at", "updated_at",
            "is_active", "customer_profile",
        ]
        read_only_fields = [
            "user_id", "email", "role", "is_verified",
            "created_at", "updated_at", "is_active",
        ]


# ─── Password ─────────────────────────────────────────────────────────

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])




class AdminUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "user_id", "email", "username", "phone",
            "role", "is_active", "is_verified", "created_at",
        ]


class TierOverrideSerializer(serializers.Serializer):
    tier_id = serializers.IntegerField()


class AdminUserStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()