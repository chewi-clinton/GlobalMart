from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    TierListView,
    AdminUserListView,
    AdminTierOverrideView,
)

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Profile
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),

    # Tiers
    path("tiers/", TierListView.as_view(), name="tiers"),

    # Admin
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/tier/", AdminTierOverrideView.as_view(), name="admin-tier-override"),
]