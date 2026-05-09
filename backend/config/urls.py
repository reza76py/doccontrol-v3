from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenRefreshView
from core.views import VerifiedEmailTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT – login blocked until email is verified
    path("token/", VerifiedEmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API + auth routes (all under /api/ prefix to match frontend baseURL)
    path("api/", include("core.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
