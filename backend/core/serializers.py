
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Company, Project, Document, DocumentVersion, AuditLog

User = get_user_model()


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


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
        url = obj.file.url  # should be /media/documents/....
        return request.build_absolute_uri(url) if request else url


class DocumentSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    latest_version = serializers.SerializerMethodField()
    versions_count = serializers.IntegerField(read_only=True)  # ✅ REQUIRED

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
        # you can add file type checks here later (pdf/dwg/etc)
        return attrs
