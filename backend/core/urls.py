from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyViewSet,
    ProjectViewSet,
    DocumentViewSet,
    DocumentVersionViewSet,
    AuditLogViewSet,
    RegisterView,
    VerifyEmailView,
    ProfileView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

router = DefaultRouter()
router.register(r"companies", CompanyViewSet)
router.register(r"projects", ProjectViewSet)
router.register(r"documents", DocumentViewSet)
router.register(r"document-versions", DocumentVersionViewSet)
router.register(r"audit-logs", AuditLogViewSet)

urlpatterns = router.urls + [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/verify-email/<str:uidb64>/<str:token>/", VerifyEmailView.as_view(), name="auth-verify-email"),
    path("auth/profile/", ProfileView.as_view(), name="auth-profile"),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path("auth/password-reset-confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
]
