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
        })