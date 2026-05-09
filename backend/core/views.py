import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator, PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Company, Project, Document, DocumentVersion, AuditLog
from .serializers import (
    CompanySerializer,
    ProjectSerializer,
    DocumentSerializer,
    DocumentVersionSerializer,
    DocumentVersionCreateSerializer,
    AuditLogSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()


# =========================
# AUTH: VERIFIED LOGIN
# =========================
class VerifiedEmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active:
            raise AuthenticationFailed("Please verify your email before logging in.")
        return data


class VerifiedEmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = VerifiedEmailTokenObtainPairSerializer


# =========================
# AUTH: REGISTER
# =========================
class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer


# =========================
# AUTH: VERIFY EMAIL
# =========================
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save(update_fields=["is_active"])
            return Response({"detail": "Email verified successfully."})

        return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)


# =========================
# AUTH: PROFILE
# =========================
class ProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def get_object(self):
        return self.request.user


# =========================
# AUTH: PASSWORD RESET REQUEST
# =========================
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    _GENERIC_RESPONSE = {"detail": "If that email is registered, a reset link has been sent."}

    def post(self, request):
        email = request.data.get("email", "").strip()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(self._GENERIC_RESPONSE)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_mail(
            subject="DocControl – Password Reset",
            message=f"Click the link to reset your password:\n\n{reset_url}\n\nIf you didn't request this, ignore this email.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        logger.info("Password reset email dispatched to %s", email)
        return Response(self._GENERIC_RESPONSE)


# =========================
# AUTH: PASSWORD RESET CONFIRM
# =========================
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid", "")
        token = request.data.get("token", "")
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if new_password != confirm_password:
            return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password reset successful."})


# =========================
# COMPANY
# =========================
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]


# =========================
# PROJECT
# =========================
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related("company")
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


# =========================
# DOCUMENT
# =========================
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = (
        Document.objects
        .select_related("project", "created_by")
        .annotate(versions_count=Count("versions", distinct=True))
        .prefetch_related("versions")
    )
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        document = serializer.save(created_by=self.request.user)

        AuditLog.objects.create(
            entity_type="DOCUMENT",
            entity_id=document.id,
            action="CREATE",
            performed_by=self.request.user,
            new_value={
                "document_number": document.document_number,
                "title": document.title,
                "status": document.status,
            },
        )

    def destroy(self, request, *args, **kwargs):
        document = self.get_object()

        if document.versions.exists():
            return Response({"detail": "Cannot delete a document that has versions."}, status=status.HTTP_409_CONFLICT)

        AuditLog.objects.create(
            entity_type="DOCUMENT",
            entity_id=document.id,
            action="DELETE",
            performed_by=request.user,
            old_value={
                "document_number": document.document_number,
                "title": document.title,
                "status": document.status,
                "project": document.project_id,
            },
        )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="upload-version")
    @transaction.atomic
    def upload_version(self, request, pk=None):
        document = self.get_object()
        serializer = DocumentVersionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        latest = document.versions.order_by("-version_number").first()
        next_version = 1 if not latest else latest.version_number + 1

        version = DocumentVersion.objects.create(
            document=document,
            version_number=next_version,
            file=serializer.validated_data["file"],
            change_note=serializer.validated_data.get("change_note", ""),
            uploaded_by=request.user,
        )

        if document.status == "DRAFT":
            old_status = document.status
            document.status = "REVIEW"
            document.save(update_fields=["status"])

            AuditLog.objects.create(
                entity_type="DOCUMENT",
                entity_id=document.id,
                action="UPDATE",
                old_value={"status": old_status},
                new_value={"status": document.status},
                performed_by=request.user,
            )

        AuditLog.objects.create(
            entity_type="VERSION",
            entity_id=version.id,
            action="CREATE",
            performed_by=request.user,
            new_value={
                "document": document.document_number,
                "version_number": version.version_number,
            },
        )

        return Response(
            DocumentVersionSerializer(version, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


# =========================
# DOCUMENT VERSION (READ-ONLY)
# =========================
class DocumentVersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentVersion.objects.select_related("document", "uploaded_by")
    serializer_class = DocumentVersionSerializer
    permission_classes = [IsAuthenticated]


# =========================
# AUDIT LOG (READ-ONLY)
# =========================
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("performed_by")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
