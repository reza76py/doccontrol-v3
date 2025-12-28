from django.contrib import admin

from .models import (
    Company,
    Project,
    Document,
    DocumentVersion,
    AuditLog,
)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "company", "status", "created_at")
    list_filter = ("status", "company")
    search_fields = ("code", "name")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "document_number",
        "title",
        "project",
        "status",
        "created_by",
        "created_at",
    )
    list_filter = ("status", "discipline", "doc_type")
    search_fields = ("document_number", "title")


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "document",
        "version_number",
        "uploaded_by",
        "uploaded_at",
    )
    search_fields = ("document__document_number",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "entity_type",
        "entity_id",
        "action",
        "performed_by",
        "performed_at",
    )
    list_filter = ("entity_type", "action")
