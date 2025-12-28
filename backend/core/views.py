from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import (
    Company,
    Project,
    Document,
    DocumentVersion,
    AuditLog,
)
from .serializers import (
    CompanySerializer,
    ProjectSerializer,
    DocumentSerializer,
    DocumentVersionSerializer,
    DocumentVersionCreateSerializer,
    AuditLogSerializer,
)


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

    # =========================
    # CUSTOM ACTION: UPLOAD VERSION
    # =========================
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

        # Optional: auto-update document status
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
            DocumentVersionSerializer(version).data,
            status=status.HTTP_201_CREATED,
        )


# =========================
# DOCUMENT VERSION (READ-ONLY)
# =========================
class DocumentVersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        DocumentVersion.objects
        .select_related("document", "uploaded_by")
    )
    serializer_class = DocumentVersionSerializer
    permission_classes = [IsAuthenticated]


# =========================
# AUDIT LOG (READ-ONLY)
# =========================
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("performed_by")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
