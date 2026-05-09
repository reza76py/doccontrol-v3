from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework import serializers

from .models import Company, Project, Document, DocumentVersion, AuditLog, UserProfile

User = get_user_model()


# =========================
# COMPANY
# =========================
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


# =========================
# PROJECT
# =========================
class ProjectSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "company",
            "company_name",
            "code",
            "name",
            "description",
            "status",
            "start_date",
            "end_date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "company_name"]


# =========================
# DOCUMENT VERSION
# =========================
class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source="uploaded_by.username", read_only=True)
    file = serializers.SerializerMethodField()

    class Meta:
        model = DocumentVersion
        fields = [
            "id",
            "document",
            "version_number",
            "file",
            "change_note",
            "uploaded_by",
            "uploaded_by_username",
            "uploaded_at",
        ]
        read_only_fields = [
            "id",
            "version_number",
            "uploaded_by",
            "uploaded_by_username",
            "uploaded_at",
        ]

    def get_file(self, obj):
        if not obj.file:
            return None
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url


# =========================
# DOCUMENT
# =========================
class DocumentSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    latest_version = serializers.SerializerMethodField()
    versions_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "project",
            "document_number",
            "title",
            "discipline",
            "doc_type",
            "status",
            "created_by",
            "created_by_username",
            "created_at",
            "latest_version",
            "versions_count",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_by_username",
            "created_at",
            "latest_version",
            "versions_count",
        ]

    def get_latest_version(self, obj):
        v = obj.versions.order_by("-version_number").first()
        if not v:
            return None

        request = self.context.get("request")
        file_url = v.file.url if v.file else None
        if file_url and request:
            file_url = request.build_absolute_uri(file_url)

        return {
            "id": v.id,
            "version_number": v.version_number,
            "file": file_url,
            "uploaded_at": v.uploaded_at,
        }


# =========================
# AUDIT LOG
# =========================
class AuditLogSerializer(serializers.ModelSerializer):
    performed_by_username = serializers.CharField(source="performed_by.username", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "entity_type",
            "entity_id",
            "action",
            "old_value",
            "new_value",
            "performed_by",
            "performed_by_username",
            "performed_at",
        ]
        read_only_fields = fields


# =========================
# WRITE-ONLY: UPLOAD VERSION
# =========================
class DocumentVersionCreateSerializer(serializers.Serializer):
    file = serializers.FileField()
    change_note = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        return attrs


# =========================
# AUTH: USER REGISTRATION
# =========================
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=False,
        )

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"

        send_mail(
            subject="DocControl – Verify Your Email",
            message=(
                f"Hi {user.username},\n\n"
                f"Please verify your email by clicking the link below:\n\n"
                f"{verify_url}\n\n"
                f"If you didn't create this account, you can ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        return user


# =========================
# AUTH: USER PROFILE (READ)
# =========================
class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "name", "role"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_role(self, obj):
        try:
            return obj.profile.role
        except UserProfile.DoesNotExist:
            return "VIEWER"


# =========================
# AUTH: USER PROFILE (UPDATE)
# =========================
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email"]

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
