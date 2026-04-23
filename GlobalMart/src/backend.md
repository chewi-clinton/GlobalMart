import logging

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, CustomerTier, CustomerProfile, PasswordResetToken
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    CustomerTierSerializer,
    AdminUserListSerializer,
    AdminUserStatusSerializer,
    TierOverrideSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import IsAdmin, IsCustomer, IsSeller
from .throttles import LoginRateThrottle, RegisterRateThrottle, PasswordResetRateThrottle
from .events import publish_event

logger = logging.getLogger(__name__)


# ─── Register ─────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        publish_event("user.registered", {
            "user_id": user.user_id,
            "email": user.email,
            "username": user.username,
            "role": user.role,
        })

        return Response(
            {"message": "Account created successfully."},
            status=status.HTTP_201_CREATED,
        )


# ─── Login ────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user_data = response.data.get("user", {})
            publish_event("user.login", {
                "user_id": user_data.get("user_id"),
                "email": user_data.get("email"),
            })
        return response


# ─── Logout ───────────────────────────────────────────────────────────

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."})
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─── Profile ──────────────────────────────────────────────────────────

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Change Password ──────────────────────────────────────────────────

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password changed successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Forgot / Reset Password ──────────────────────────────────────────

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=serializer.validated_data["email"])
            PasswordResetToken.objects.filter(user=user, used=False).delete()
            token_obj = PasswordResetToken.objects.create(user=user)
            logger.info(f"[DEV] Password reset token for {user.email}: {token_obj.token}")
        except User.DoesNotExist:
            pass

        return Response(
            {"message": "If that email is registered, a reset link has been sent."}
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = PasswordResetToken.objects.select_related("user").get(
                token=serializer.validated_data["token"]
            )
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"error": "Invalid or expired reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not token_obj.is_valid():
            return Response(
                {"error": "Reset token has expired or already been used."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = token_obj.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        token_obj.used = True
        token_obj.save(update_fields=["used"])

        return Response({"message": "Password reset successfully. You can now log in."})


# ─── Tiers ────────────────────────────────────────────────────────────

class TierListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tiers = CustomerTier.objects.all().order_by("min_lifetime_value")
        serializer = CustomerTierSerializer(tiers, many=True)
        return Response(serializer.data)


# ─── Admin ────────────────────────────────────────────────────────────

class AdminUserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = User.objects.all().order_by("-created_at")
        role_filter = request.query_params.get("role")
        if role_filter:
            qs = qs.filter(role=role_filter)
        serializer = AdminUserListSerializer(qs, many=True)
        return Response(serializer.data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        """Admin can toggle is_active (suspend/unsuspend a user)."""
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUserStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = serializer.validated_data["is_active"]
        user.save(update_fields=["is_active"])

        action = "activated" if user.is_active else "suspended"
        publish_event(f"user.{action}", {"user_id": user.user_id, "email": user.email})

        return Response({"message": f"User {action} successfully."})


class AdminTierOverrideView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(user_id=user_id, role="customer")
            profile = user.customer_profile
        except (User.DoesNotExist, CustomerProfile.DoesNotExist):
            return Response(
                {"error": "Customer not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TierOverrideSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            tier = CustomerTier.objects.get(tier_id=serializer.validated_data["tier_id"])
        except CustomerTier.DoesNotExist:
            return Response({"error": "Tier not found."}, status=status.HTTP_404_NOT_FOUND)

        profile.tier = tier
        profile.save()

        return Response({
            "message": f"Tier updated to '{tier.tier_name}' for {user.email}."
        })from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    TierListView,
    AdminUserListView,
    AdminUserDetailView,
    AdminTierOverrideView,
)

urlpatterns = [
    # ─── Auth ─────────────────────────────────────────────────────────
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # ─── Password ─────────────────────────────────────────────────────
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    # ─── Profile ──────────────────────────────────────────────────────
    path("profile/", ProfileView.as_view(), name="profile"),

    # ─── Tiers ────────────────────────────────────────────────────────
    path("tiers/", TierListView.as_view(), name="tiers"),

    # ─── Admin ────────────────────────────────────────────────────────
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("admin/users/<int:user_id>/tier/", AdminTierOverrideView.as_view(), name="admin-tier-override"),
]from rest_framework import serializers
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
    
from rest_framework import serializers
from .models import Currency, ExchangeRate


# ─── Currency ─────────────────────────────────────────────────────────

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["currency_code", "currency_name", "symbol", "is_active"]


# ─── Exchange Rate ─────────────────────────────────────────────────────

class ExchangeRateSerializer(serializers.ModelSerializer):
    from_currency = serializers.CharField(source="from_currency_id")
    to_currency = serializers.CharField(source="to_currency_id")

    class Meta:
        model = ExchangeRate
        fields = ["from_currency", "to_currency", "rate", "effective_date", "created_at"]


# ─── Rate Lookup ──────────────────────────────────────────────────────

class RateLookupSerializer(serializers.Serializer):
    """Used for the single rate lookup endpoint."""
    from_currency = serializers.CharField(max_length=3)
    to_currency = serializers.CharField(max_length=3)
    rate = serializers.DecimalField(max_digits=12, decimal_places=6)
    effective_date = serializers.DateField()


# ─── Conversion ───────────────────────────────────────────────────────

class ConversionSerializer(serializers.Serializer):
    """Used for the amount conversion endpoint."""
    from_currency = serializers.CharField(max_length=3)
    to_currency = serializers.CharField(max_length=3)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    converted_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    rate = serializers.DecimalField(max_digits=12, decimal_places=6)
    effective_date = serializers.DateField()from django.urls import path
from .views import (
    CurrencyListView,
    ExchangeRateListView,
    RateLookupView,
    ConvertView,
    SyncRatesView,
)

urlpatterns = [
    # Currencies
    path("", CurrencyListView.as_view(), name="currency-list"),

    # Rates
    path("rates/", ExchangeRateListView.as_view(), name="exchange-rate-list"),
    path("rate/", RateLookupView.as_view(), name="rate-lookup"),

    # Conversion
    path("convert/", ConvertView.as_view(), name="convert"),

    # Sync
    path("sync/", SyncRatesView.as_view(), name="sync-rates"),
]from decimal import Decimal
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Currency, ExchangeRate
from .serializers import (
    CurrencySerializer,
    ExchangeRateSerializer,
    RateLookupSerializer,
    ConversionSerializer,
)


# ─── Currencies ───────────────────────────────────────────────────────

class CurrencyListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        currencies = Currency.objects.filter(is_active=True).order_by("currency_code")
        serializer = CurrencySerializer(currencies, many=True)
        return Response(serializer.data)


# ─── Exchange Rates ───────────────────────────────────────────────────

class ExchangeRateListView(APIView):
    """Returns the latest rate for every currency pair."""
    permission_classes = [AllowAny]

    def get(self, request):
        # Get latest effective date
        latest = ExchangeRate.objects.order_by("-effective_date").first()
        if not latest:
            return Response({"error": "No exchange rates available."}, status=status.HTTP_404_NOT_FOUND)

        rates = ExchangeRate.objects.filter(
            effective_date=latest.effective_date
        ).select_related("from_currency", "to_currency")

        serializer = ExchangeRateSerializer(rates, many=True)
        return Response(serializer.data)


# ─── Single Rate Lookup ───────────────────────────────────────────────

class RateLookupView(APIView):
    """
    GET /api/currencies/rate/?from=USD&to=XAF
    Returns the latest rate for a specific currency pair.
    Called by Order Service via HTTP.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from_code = request.query_params.get("from", "").upper()
        to_code = request.query_params.get("to", "").upper()

        if not from_code or not to_code:
            return Response(
                {"error": "Both 'from' and 'to' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Same currency — rate is always 1
        if from_code == to_code:
            return Response({
                "from_currency": from_code,
                "to_currency": to_code,
                "rate": "1.000000",
                "effective_date": None,
            })

        rate = ExchangeRate.objects.filter(
            from_currency_id=from_code,
            to_currency_id=to_code,
        ).order_by("-effective_date").first()

        if not rate:
            return Response(
                {"error": f"No rate found for {from_code} → {to_code}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RateLookupSerializer({
            "from_currency": rate.from_currency_id,
            "to_currency": rate.to_currency_id,
            "rate": rate.rate,
            "effective_date": rate.effective_date,
        })
        return Response(serializer.data)


# ─── Conversion ───────────────────────────────────────────────────────

class ConvertView(APIView):
    """
    GET /api/currencies/convert/?amount=100&from=USD&to=XAF
    Converts an amount from one currency to another.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from_code = request.query_params.get("from", "").upper()
        to_code = request.query_params.get("to", "").upper()
        amount_str = request.query_params.get("amount")

        if not from_code or not to_code or not amount_str:
            return Response(
                {"error": "Parameters 'amount', 'from' and 'to' are all required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(amount_str)
        except Exception:
            return Response(
                {"error": "Invalid amount."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if from_code == to_code:
            return Response({
                "from_currency": from_code,
                "to_currency": to_code,
                "amount": amount,
                "converted_amount": amount,
                "rate": "1.000000",
                "effective_date": None,
            })

        rate = ExchangeRate.objects.filter(
            from_currency_id=from_code,
            to_currency_id=to_code,
        ).order_by("-effective_date").first()

        if not rate:
            return Response(
                {"error": f"No rate found for {from_code} → {to_code}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        converted = (amount * rate.rate).quantize(Decimal("0.01"))

        serializer = ConversionSerializer({
            "from_currency": from_code,
            "to_currency": to_code,
            "amount": amount,
            "converted_amount": converted,
            "rate": rate.rate,
            "effective_date": rate.effective_date,
        })
        return Response(serializer.data)


# ─── Manual Sync ──────────────────────────────────────────────────────

class SyncRatesView(APIView):
    """
    POST /api/currencies/sync/
    Admin only — triggers a manual sync from Open Exchange Rates API.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            from .tasks import sync_exchange_rates
            sync_exchange_rates()
            return Response({"message": "Exchange rates synced successfully."})
        except Exception as e:
            return Response(
                {"error": f"Sync failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )from decimal import Decimal
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Currency, ExchangeRate
from .serializers import (
    CurrencySerializer,
    ExchangeRateSerializer,
    RateLookupSerializer,
    ConversionSerializer,
)


# ─── Currencies ───────────────────────────────────────────────────────

class CurrencyListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        currencies = Currency.objects.filter(is_active=True).order_by("currency_code")
        serializer = CurrencySerializer(currencies, many=True)
        return Response(serializer.data)


# ─── Exchange Rates ───────────────────────────────────────────────────

class ExchangeRateListView(APIView):
    """Returns the latest rate for every currency pair."""
    permission_classes = [AllowAny]

    def get(self, request):
        # Get latest effective date
        latest = ExchangeRate.objects.order_by("-effective_date").first()
        if not latest:
            return Response({"error": "No exchange rates available."}, status=status.HTTP_404_NOT_FOUND)

        rates = ExchangeRate.objects.filter(
            effective_date=latest.effective_date
        ).select_related("from_currency", "to_currency")

        serializer = ExchangeRateSerializer(rates, many=True)
        return Response(serializer.data)


# ─── Single Rate Lookup ───────────────────────────────────────────────

class RateLookupView(APIView):
    """
    GET /api/currencies/rate/?from=USD&to=XAF
    Returns the latest rate for a specific currency pair.
    Called by Order Service via HTTP.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from_code = request.query_params.get("from", "").upper()
        to_code = request.query_params.get("to", "").upper()

        if not from_code or not to_code:
            return Response(
                {"error": "Both 'from' and 'to' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Same currency — rate is always 1
        if from_code == to_code:
            return Response({
                "from_currency": from_code,
                "to_currency": to_code,
                "rate": "1.000000",
                "effective_date": None,
            })

        rate = ExchangeRate.objects.filter(
            from_currency_id=from_code,
            to_currency_id=to_code,
        ).order_by("-effective_date").first()

        if not rate:
            return Response(
                {"error": f"No rate found for {from_code} → {to_code}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RateLookupSerializer({
            "from_currency": rate.from_currency_id,
            "to_currency": rate.to_currency_id,
            "rate": rate.rate,
            "effective_date": rate.effective_date,
        })
        return Response(serializer.data)


# ─── Conversion ───────────────────────────────────────────────────────

class ConvertView(APIView):
    """
    GET /api/currencies/convert/?amount=100&from=USD&to=XAF
    Converts an amount from one currency to another.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from_code = request.query_params.get("from", "").upper()
        to_code = request.query_params.get("to", "").upper()
        amount_str = request.query_params.get("amount")

        if not from_code or not to_code or not amount_str:
            return Response(
                {"error": "Parameters 'amount', 'from' and 'to' are all required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(amount_str)
        except Exception:
            return Response(
                {"error": "Invalid amount."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if from_code == to_code:
            return Response({
                "from_currency": from_code,
                "to_currency": to_code,
                "amount": amount,
                "converted_amount": amount,
                "rate": "1.000000",
                "effective_date": None,
            })

        rate = ExchangeRate.objects.filter(
            from_currency_id=from_code,
            to_currency_id=to_code,
        ).order_by("-effective_date").first()

        if not rate:
            return Response(
                {"error": f"No rate found for {from_code} → {to_code}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        converted = (amount * rate.rate).quantize(Decimal("0.01"))

        serializer = ConversionSerializer({
            "from_currency": from_code,
            "to_currency": to_code,
            "amount": amount,
            "converted_amount": converted,
            "rate": rate.rate,
            "effective_date": rate.effective_date,
        })
        return Response(serializer.data)


# ─── Manual Sync ──────────────────────────────────────────────────────

class SyncRatesView(APIView):
    """
    POST /api/currencies/sync/
    Admin only — triggers a manual sync from Open Exchange Rates API.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            from .tasks import sync_exchange_rates
            sync_exchange_rates()
            return Response({"message": "Exchange rates synced successfully."})
        except Exception as e:
            return Response(
                {"error": f"Sync failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
from rest_framework import serializers
from .models import Warehouse, Inventory, InventoryHistory


# ─── Warehouse ────────────────────────────────────────────────────────

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = [
            "warehouse_id", "name", "location",
            "capacity", "is_active",
        ]


class WarehouseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["name", "location", "capacity", "is_active"]


# ─── Inventory History ────────────────────────────────────────────────

class InventoryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryHistory
        fields = [
            "history_id", "action", "quantity_change",
            "previous_quantity", "new_quantity",
            "reason", "performed_by", "created_at",
        ]


# ─── Inventory ────────────────────────────────────────────────────────

class InventorySerializer(serializers.ModelSerializer):
    warehouse = WarehouseSerializer(read_only=True)
    history = InventoryHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "inventory_id", "product_id", "variant_id",
            "warehouse", "quantity_on_hand",
            "reorder_threshold", "version", "history",
        ]


class InventoryListSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    warehouse_location = serializers.CharField(source="warehouse.location", read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "inventory_id", "product_id", "variant_id",
            "warehouse_name", "warehouse_location",
            "quantity_on_hand", "reorder_threshold", "version",
        ]


class InventoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = [
            "product_id", "variant_id", "warehouse",
            "quantity_on_hand", "reorder_threshold",
        ]

    def create(self, validated_data):
        return Inventory.objects.create(**validated_data)


class StockAdjustSerializer(serializers.Serializer):
    """Used for manual stock adjustments."""
    quantity = serializers.IntegerField()
    reason = serializers.CharField(max_length=255, required=False, default="Manual adjustment")


class ThresholdUpdateSerializer(serializers.Serializer):
    """Used for updating reorder threshold."""
    reorder_threshold = serializers.IntegerField(min_value=0)


class StockCheckSerializer(serializers.Serializer):
    """Used for pre-order stock validation."""
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)from django.urls import path
from .views import (
    WarehouseListView,
    WarehouseDetailView,
    InventoryListView,
    InventoryDetailView,
    StockCheckView,
    StockAdjustView,
    ThresholdUpdateView,
)

urlpatterns = [
    # Warehouses
    path("warehouses/", WarehouseListView.as_view(), name="warehouse-list"),
    path("warehouses/<int:warehouse_id>/", WarehouseDetailView.as_view(), name="warehouse-detail"),

    # Inventory
    path("", InventoryListView.as_view(), name="inventory-list"),
    path("<int:inventory_id>/", InventoryDetailView.as_view(), name="inventory-detail"),
    path("<int:inventory_id>/adjust/", StockAdjustView.as_view(), name="stock-adjust"),
    path("<int:inventory_id>/threshold/", ThresholdUpdateView.as_view(), name="threshold-update"),

    # Stock check — called by Order Service
    path("check/", StockCheckView.as_view(), name="stock-check"),
]from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Warehouse, Inventory, InventoryHistory
from .serializers import (
    WarehouseSerializer,
    WarehouseWriteSerializer,
    InventorySerializer,
    InventoryListSerializer,
    InventoryWriteSerializer,
    StockAdjustSerializer,
    ThresholdUpdateSerializer,
    StockCheckSerializer,
)
from .permissions import IsAdmin, IsSellerOrAdmin
from .events import publish_event


# ─── Helper ───────────────────────────────────────────────────────────

def get_token_payload(request):
    try:
        authenticator = JWTAuthentication()
        result = authenticator.authenticate(request)
        if result is None:
            return None
        _, token = result
        return token.payload
    except (InvalidToken, TokenError):
        return None


# ─── Warehouses ───────────────────────────────────────────────────────

class WarehouseListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        warehouses = Warehouse.objects.filter(is_active=True)
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WarehouseWriteSerializer(data=request.data)
        if serializer.is_valid():
            warehouse = serializer.save()
            return Response(WarehouseSerializer(warehouse).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WarehouseDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, warehouse_id):
        try:
            return Warehouse.objects.get(warehouse_id=warehouse_id)
        except Warehouse.DoesNotExist:
            return None

    def get(self, request, warehouse_id):
        warehouse = self.get_object(warehouse_id)
        if not warehouse:
            return Response({"error": "Warehouse not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(WarehouseSerializer(warehouse).data)

    def put(self, request, warehouse_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        warehouse = self.get_object(warehouse_id)
        if not warehouse:
            return Response({"error": "Warehouse not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WarehouseWriteSerializer(warehouse, data=request.data, partial=True)
        if serializer.is_valid():
            warehouse = serializer.save()
            return Response(WarehouseSerializer(warehouse).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Inventory ────────────────────────────────────────────────────────

class InventoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("admin", "seller"):
            return Response({"error": "Admin or seller access required."}, status=status.HTTP_403_FORBIDDEN)

        qs = Inventory.objects.select_related("warehouse").all()
        product_id = request.query_params.get("product_id")
        warehouse_id = request.query_params.get("warehouse_id")

        if product_id:
            qs = qs.filter(product_id=product_id)
        if warehouse_id:
            qs = qs.filter(warehouse_id=warehouse_id)

        serializer = InventoryListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = InventoryWriteSerializer(data=request.data)
        if serializer.is_valid():
            inventory = serializer.save()
            return Response(
                InventoryListSerializer(inventory).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, inventory_id):
        try:
            return Inventory.objects.select_related("warehouse").prefetch_related(
                "history"
            ).get(inventory_id=inventory_id)
        except Inventory.DoesNotExist:
            return None

    def get(self, request, inventory_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") not in ("admin", "seller"):
            return Response({"error": "Admin or seller access required."}, status=status.HTTP_403_FORBIDDEN)

        inventory = self.get_object(inventory_id)
        if not inventory:
            return Response({"error": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(InventorySerializer(inventory).data)


# ─── Stock Check ──────────────────────────────────────────────────────

class StockCheckView(APIView):
    """
    GET /api/inventory/check/?product_id=X&quantity=N&variant_id=Y
    Internal HTTP endpoint called by Order Service before placing an order.
    Returns available stock across all warehouses.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        product_id = request.query_params.get("product_id")
        quantity = request.query_params.get("quantity")
        variant_id = request.query_params.get("variant_id")

        if not product_id or not quantity:
            return Response(
                {"error": "product_id and quantity are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
            product_id = int(product_id)
        except ValueError:
            return Response({"error": "Invalid parameters."}, status=status.HTTP_400_BAD_REQUEST)

        qs = Inventory.objects.filter(product_id=product_id)
        if variant_id:
            qs = qs.filter(variant_id=int(variant_id))

        total_stock = sum(inv.quantity_on_hand for inv in qs)
        available = total_stock >= quantity

        return Response({
            "product_id": product_id,
            "variant_id": variant_id,
            "requested_quantity": quantity,
            "total_stock": total_stock,
            "available": available,
        })


# ─── Stock Adjustment ─────────────────────────────────────────────────

class StockAdjustView(APIView):
    """
    POST /api/inventory/<id>/adjust/
    Admin only — manually adjust stock up or down.
    """
    permission_classes = [AllowAny]

    def post(self, request, inventory_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            inventory = Inventory.objects.get(inventory_id=inventory_id)
        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StockAdjustSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quantity_change = serializer.validated_data["quantity"]
        reason = serializer.validated_data["reason"]
        previous_quantity = inventory.quantity_on_hand
        new_quantity = previous_quantity + quantity_change

        if new_quantity < 0:
            return Response(
                {"error": "Stock cannot go below zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            inventory.quantity_on_hand = new_quantity
            inventory.version += 1
            inventory.save()

            action = "addition" if quantity_change > 0 else "deduction"
            InventoryHistory.objects.create(
                inventory=inventory,
                action=action,
                quantity_change=quantity_change,
                previous_quantity=previous_quantity,
                new_quantity=new_quantity,
                reason=reason,
                performed_by=payload.get("user_id"),
            )

        # Check if below reorder threshold
        if new_quantity <= inventory.reorder_threshold:
            publish_event("inventory.low_stock", {
                "inventory_id": inventory.inventory_id,
                "product_id": inventory.product_id,
                "variant_id": inventory.variant_id,
                "warehouse_id": inventory.warehouse_id,
                "quantity_on_hand": new_quantity,
                "reorder_threshold": inventory.reorder_threshold,
            })

        return Response(InventoryListSerializer(inventory).data)


# ─── Threshold Update ─────────────────────────────────────────────────

class ThresholdUpdateView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, inventory_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            inventory = Inventory.objects.get(inventory_id=inventory_id)
        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ThresholdUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        inventory.reorder_threshold = serializer.validated_data["reorder_threshold"]
        inventory.save()

        return Response(InventoryListSerializer(inventory).data)

from rest_framework import serializers
from .models import NotificationLog


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = [
            "log_id", "user_id", "event_type",
            "recipient_email", "subject", "message",
            "status", "error_message", "sent_at",
        ]from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", include("apps.notification_service.health_urls")),
]

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/orders/", include("apps.order_service.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("health/", include("apps.order_service.health_urls")),
]from rest_framework import serializers
from .models import Order, OrderItem


# ─── Order Item ───────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "order_item_id", "line_number", "product_id",
            "variant_id", "seller_id", "quantity",
            "unit_price", "total_price",
        ]


class OrderItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    seller_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)


# ─── Order ────────────────────────────────────────────────────────────

class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "order_id", "customer_id", "order_date",
            "status", "payment_status", "total_amount",
            "discount_amount", "currency_code", "items_count",
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "order_id", "customer_id", "order_date",
            "status", "payment_status", "total_amount",
            "discount_amount", "currency_code",
            "shipping_address", "notes", "items",
            "updated_at",
        ]


class PlaceOrderSerializer(serializers.Serializer):
    """Used when a customer places an order."""
    items = OrderItemWriteSerializer(many=True)
    currency_code = serializers.CharField(max_length=3, default="XAF")
    shipping_address = serializers.CharField(required=False, default="")
    notes = serializers.CharField(required=False, default="")


class CancelOrderSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, default="Cancelled by customer")from django.urls import path
from .views import (
    OrderListView,
    OrderDetailView,
    CancelOrderView,
    AdminOrderListView,
)

urlpatterns = [
    # Customer orders
    path("", OrderListView.as_view(), name="order-list"),
    path("<int:order_id>/", OrderDetailView.as_view(), name="order-detail"),
    path("<int:order_id>/cancel/", CancelOrderView.as_view(), name="order-cancel"),

    # Admin
    path("admin/all/", AdminOrderListView.as_view(), name="admin-order-list"),
]import requests
from decimal import Decimal
from django.db import transaction
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Order, OrderItem
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    PlaceOrderSerializer,
    CancelOrderSerializer,
)
from .permissions import IsAdmin, IsCustomer, IsCustomerOrAdmin
from .events import publish_event


# ─── Helper ───────────────────────────────────────────────────────────

def get_token_payload(request):
    try:
        authenticator = JWTAuthentication()
        result = authenticator.authenticate(request)
        if result is None:
            return None
        _, token = result
        return token.payload
    except (InvalidToken, TokenError):
        return None


def check_stock(product_id, quantity, variant_id=None):
    """Call Inventory Service to validate stock."""
    try:
        url = f"{settings.INVENTORY_SERVICE_URL}/api/inventory/check/"
        params = {"product_id": product_id, "quantity": quantity}
        if variant_id:
            params["variant_id"] = variant_id
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("available", False)
        return False
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Inventory check failed: {e}")
        return True  # fail open — don't block order if inventory service is down


def get_exchange_rate(from_currency, to_currency):
    """Call Currency Service to get exchange rate."""
    try:
        if from_currency == to_currency:
            return Decimal("1.000000")
        url = f"{settings.CURRENCY_SERVICE_URL}/api/currencies/rate/"
        params = {"from": from_currency, "to": to_currency}
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return Decimal(str(data.get("rate", "1.000000")))
        return Decimal("1.000000")
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Currency rate fetch failed: {e}")
        return Decimal("1.000000")


# ─── Orders ───────────────────────────────────────────────────────────

class OrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get("role") == "admin":
            qs = Order.objects.all()
            status_filter = request.query_params.get("status")
            if status_filter:
                qs = qs.filter(status=status_filter)
        else:
            qs = Order.objects.filter(customer_id=payload.get("user_id"))

        serializer = OrderListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get("role") not in ("customer", "admin"):
            return Response({"error": "Customer access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = serializer.validated_data["items"]
        currency_code = serializer.validated_data["currency_code"]
        shipping_address = serializer.validated_data["shipping_address"]
        notes = serializer.validated_data["notes"]

        # Step 1 — Validate stock for all items
        for item in items_data:
            available = check_stock(
                item["product_id"],
                item["quantity"],
                item.get("variant_id"),
            )
            if not available:
                return Response(
                    {"error": f"Insufficient stock for product {item['product_id']}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Step 2 — Calculate totals
        total_amount = Decimal("0.00")
        for item in items_data:
            item_total = Decimal(str(item["unit_price"])) * item["quantity"]
            item["total_price"] = item_total
            total_amount += item_total

        # Step 3 — Create order in ACID transaction
        with transaction.atomic():
            order = Order.objects.create(
                customer_id=payload.get("user_id"),
                total_amount=total_amount,
                currency_code=currency_code,
                shipping_address=shipping_address,
                notes=notes,
                status="pending",
                payment_status="unpaid",
            )

            for line_number, item in enumerate(items_data, start=1):
                OrderItem.objects.create(
                    order=order,
                    line_number=line_number,
                    product_id=item["product_id"],
                    variant_id=item.get("variant_id"),
                    seller_id=item["seller_id"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    total_price=item["total_price"],
                )

        # Step 4 — Publish order.placed event
        publish_event("order.placed", {
            "order_id": order.order_id,
            "customer_id": order.customer_id,
            "total_amount": str(order.total_amount),
            "currency_code": order.currency_code,
            "items": [
                {
                    "product_id": item["product_id"],
                    "variant_id": item.get("variant_id"),
                    "seller_id": item["seller_id"],
                    "quantity": item["quantity"],
                    "unit_price": str(item["unit_price"]),
                }
                for item in items_data
            ],
        })

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, order_id):
        try:
            return Order.objects.prefetch_related("items").get(order_id=order_id)
        except Order.DoesNotExist:
            return None

    def get(self, request, order_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        order = self.get_object(order_id)
        if not order:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Customers can only see their own orders
        if payload.get("role") == "customer" and order.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(OrderDetailSerializer(order).data)


class CancelOrderView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, order_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Customers can only cancel their own orders
        if payload.get("role") == "customer" and order.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only pending or confirmed orders can be cancelled
        if order.status not in ("pending", "confirmed"):
            return Response(
                {"error": f"Cannot cancel order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CancelOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = "cancelled"
        order.save()

        # Publish stock release event
        publish_event("inventory.stock_release", {
            "order_id": order.order_id,
            "items": [
                {
                    "product_id": item.product_id,
                    "variant_id": item.variant_id,
                    "quantity": item.quantity,
                }
                for item in order.items.all()
            ],
        })

        return Response(OrderDetailSerializer(order).data)


class AdminOrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        qs = Order.objects.all()
        status_filter = request.query_params.get("status")
        customer_id = request.query_params.get("customer_id")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        serializer = OrderListSerializer(qs, many=True)
        return Response(serializer.data)
        
from rest_framework import serializers
from .models import Payment, Refund


# ─── Payment ──────────────────────────────────────────────────────────

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "payment_id", "order_id", "customer_id",
            "amount", "currency_code", "payment_method",
            "status", "transaction_id", "phone_number",
            "created_at", "updated_at",
        ]


class InitiatePaymentSerializer(serializers.Serializer):
    """Used when a customer initiates a payment."""
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency_code = serializers.CharField(max_length=3, default="XAF")
    payment_method = serializers.ChoiceField(choices=["mtn_momo", "orange_money", "card"])
    phone_number = serializers.CharField(max_length=20, required=False, default="")


class PaymentWebhookSerializer(serializers.Serializer):
    """Used for CamPay webhook callbacks."""
    reference = serializers.CharField()
    status = serializers.CharField()
    amount = serializers.CharField(required=False)
    operator = serializers.CharField(required=False)


# ─── Refund ───────────────────────────────────────────────────────────

class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = [
            "refund_id", "payment", "amount",
            "reason", "status", "processed_by",
            "created_at", "updated_at",
        ]


class RequestRefundSerializer(serializers.Serializer):
    """Used when a customer requests a refund."""
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    reason = serializers.CharField(required=False, default="")


class ProcessRefundSerializer(serializers.Serializer):
    """Used when admin approves or rejects a refund."""
    action = serializers.ChoiceField(choices=["approve", "reject"])from django.urls import path
from .views import (
    PaymentListView,
    InitiatePaymentView,
    PaymentDetailView,
    PaymentWebhookView,
    RequestRefundView,
    ProcessRefundView,
)

urlpatterns = [
    # Payments
    path("", PaymentListView.as_view(), name="payment-list"),
    path("initiate/", InitiatePaymentView.as_view(), name="initiate-payment"),
    path("<int:payment_id>/", PaymentDetailView.as_view(), name="payment-detail"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),

    # Refunds
    path("<int:payment_id>/refund/", RequestRefundView.as_view(), name="request-refund"),
    path("refunds/<int:refund_id>/process/", ProcessRefundView.as_view(), name="process-refund"),
]import uuid
import requests
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Payment, Refund
from .serializers import (
    PaymentSerializer,
    InitiatePaymentSerializer,
    PaymentWebhookSerializer,
    RefundSerializer,
    RequestRefundSerializer,
    ProcessRefundSerializer,
)
from .permissions import IsAdmin, IsCustomer, IsCustomerOrAdmin
from .events import publish_event


# ─── Helper ───────────────────────────────────────────────────────────

def get_token_payload(request):
    try:
        authenticator = JWTAuthentication()
        result = authenticator.authenticate(request)
        if result is None:
            return None
        _, token = result
        return token.payload
    except (InvalidToken, TokenError):
        return None


def get_campay_token():
    """Get CamPay access token."""
    try:
        response = requests.post(
            f"{settings.CAMPAY_BASE_URL}/token/",
            json={
                "username": settings.CAMPAY_USERNAME,
                "password": settings.CAMPAY_PASSWORD,
            },
            timeout=10,
        )
        if response.status_code == 200:
            return response.json().get("token")
        return None
    except Exception:
        return None


# ─── Payments ─────────────────────────────────────────────────────────

class PaymentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get("role") == "admin":
            qs = Payment.objects.all()
        else:
            qs = Payment.objects.filter(customer_id=payload.get("user_id"))

        serializer = PaymentSerializer(qs, many=True)
        return Response(serializer.data)


class InitiatePaymentView(APIView):
    """
    POST /api/payments/initiate/
    Customer initiates a payment for an order.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = InitiatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data["order_id"]
        amount = serializer.validated_data["amount"]
        currency_code = serializer.validated_data["currency_code"]
        payment_method = serializer.validated_data["payment_method"]
        phone_number = serializer.validated_data["phone_number"]

        # Idempotency check — prevent duplicate payments
        idempotency_key = f"order_{order_id}_customer_{payload.get('user_id')}"
        existing = Payment.objects.filter(idempotency_key=idempotency_key).first()
        if existing:
            return Response(PaymentSerializer(existing).data)

        # Create payment record
        payment = Payment.objects.create(
            order_id=order_id,
            customer_id=payload.get("user_id"),
            amount=amount,
            currency_code=currency_code,
            payment_method=payment_method,
            phone_number=phone_number,
            status="pending",
            idempotency_key=idempotency_key,
        )

        # Initiate MoMo payment via CamPay
        if payment_method in ("mtn_momo", "orange_money"):
            try:
                token = get_campay_token()
                if token:
                    response = requests.post(
                        f"{settings.CAMPAY_BASE_URL}/collect/",
                        headers={"Authorization": f"Token {token}"},
                        json={
                            "amount": str(amount),
                            "from": phone_number,
                            "description": f"GlobalMart Order #{order_id}",
                            "external_reference": str(payment.payment_id),
                        },
                        timeout=30,
                    )
                    if response.status_code == 200:
                        data = response.json()
                        payment.transaction_id = data.get("reference", "")
                        payment.gateway_response = data
                        payment.save()
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"CamPay initiation failed: {e}")

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, payment_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payment = Payment.objects.get(payment_id=payment_id)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "customer" and payment.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)


class PaymentWebhookView(APIView):
    """
    POST /api/payments/webhook/
    CamPay calls this endpoint when payment status changes.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PaymentWebhookSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        reference = serializer.validated_data["reference"]
        gateway_status = serializer.validated_data["status"]

        try:
            payment = Payment.objects.get(transaction_id=reference)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Idempotent — skip if already processed
        if payment.status in ("success", "failed"):
            return Response({"message": "Already processed."})

        if gateway_status == "SUCCESSFUL":
            payment.status = "success"
            payment.save()
            publish_event("payment.completed", {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "customer_id": payment.customer_id,
                "amount": str(payment.amount),
                "currency_code": payment.currency_code,
            })
        else:
            payment.status = "failed"
            payment.save()
            publish_event("payment.failed", {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "customer_id": payment.customer_id,
            })

        return Response({"message": "Webhook processed."})


# ─── Refunds ──────────────────────────────────────────────────────────

class RequestRefundView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, payment_id):
        payload = get_token_payload(request)
        if not payload:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payment = Payment.objects.get(payment_id=payment_id)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        if payload.get("role") == "customer" and payment.customer_id != payload.get("user_id"):
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if payment.status != "success":
            return Response(
                {"error": "Only successful payments can be refunded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RequestRefundSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        refund = Refund.objects.create(
            payment=payment,
            amount=serializer.validated_data["amount"],
            reason=serializer.validated_data["reason"],
            status="pending",
        )

        return Response(RefundSerializer(refund).data, status=status.HTTP_201_CREATED)


class ProcessRefundView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, refund_id):
        payload = get_token_payload(request)
        if not payload or payload.get("role") != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            refund = Refund.objects.select_related("payment").get(refund_id=refund_id)
        except Refund.DoesNotExist:
            return Response({"error": "Refund not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProcessRefundSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        action = serializer.validated_data["action"]

        if action == "approve":
            refund.status = "approved"
            refund.processed_by = payload.get("user_id")
            refund.save()

            refund.payment.status = "refunded"
            refund.payment.save()

            publish_event("payment.refunded", {
                "refund_id": refund.refund_id,
                "payment_id": refund.payment.payment_id,
                "order_id": refund.payment.order_id,
                "customer_id": refund.payment.customer_id,
                "amount": str(refund.amount),
            })
        else:
            refund.status = "rejected"
            refund.processed_by = payload.get("user_id")
            refund.save()

        return Response(RefundSerializer(refund).data)from django.urls import path
from .views import (
    PaymentListView,
    InitiatePaymentView,
    PaymentDetailView,
    PaymentWebhookView,
    RequestRefundView,
    ProcessRefundView,
)

urlpatterns = [
    # Payments
    path("", PaymentListView.as_view(), name="payment-list"),
    path("initiate/", InitiatePaymentView.as_view(), name="initiate-payment"),
    path("<int:payment_id>/", PaymentDetailView.as_view(), name="payment-detail"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),

    # Refunds
    path("<int:payment_id>/refund/", RequestRefundView.as_view(), name="request-refund"),
    path("refunds/<int:refund_id>/process/", ProcessRefundView.as_view(), name="process-refund"),
]

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
        return ProductImage.objects.create(product=product, **validated_data)from rest_framework import status
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

        return Response(ProductImageSerializer(image).data, status=status.HTTP_201_CREATED)from django.urls import path
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