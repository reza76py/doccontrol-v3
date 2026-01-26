from django.contrib import admin
from django.forms.models import model_to_dict

from .models import Company, Project, Document, DocumentVersion, AuditLog


def snap_company(obj: Company):
    return {"name": obj.name}


def snap_project(obj: Project):
    return {
        "company_id": obj.company_id,
        "code": obj.code,
        "name": obj.name,
        "status": obj.status,
        "start_date": str(obj.start_date) if obj.start_date else None,
        "end_date": str(obj.end_date) if obj.end_date else None,
    }


def snap_document(obj: Document):
    return {
        "project_id": obj.project_id,
        "document_number": obj.document_number,
        "title": obj.title,
        "discipline": obj.discipline,
        "doc_type": obj.doc_type,
        "status": obj.status,
        "created_by_id": obj.created_by_id,
    }


def snap_version(obj: DocumentVersion):
    return {
        "document_id": obj.document_id,
        "version_number": obj.version_number,
        "file": obj.file.name if obj.file else None,
        "change_note": obj.change_note,
        "uploaded_by_id": obj.uploaded_by_id,
    }


class AuditAdminMixin:
    """
    Adds AuditLog rows for admin create/update/delete.
    You must set: audit_entity_type and snapshot_func
    """
    audit_entity_type = None
    snapshot_func = None

    def _log(self, *, request, obj_id, action, old_value=None, new_value=None):
        AuditLog.objects.create(
            entity_type=self.audit_entity_type,
            entity_id=obj_id,
            action=action,
            old_value=old_value,
            new_value=new_value,
            performed_by=request.user,
        )

    def save_model(self, request, obj, form, change):
        Model = obj.__class__
        old_full = None

        if change and obj.pk:
            old_obj = Model.objects.get(pk=obj.pk)
            old_full = self.snapshot_func(old_obj)

        super().save_model(request, obj, form, change)

        new_full = self.snapshot_func(obj)

        # CREATE -> store full snapshot
        if not change:
            self._log(
                request=request,
                obj_id=obj.pk,
                action="CREATE",
                old_value=None,
                new_value=new_full,
            )
            return

        # UPDATE -> store only diffs
        old_diff = {}
        new_diff = {}
        for k in (new_full or {}).keys():
            old_v = (old_full or {}).get(k)
            new_v = new_full.get(k)
            if old_v != new_v:
                old_diff[k] = old_v
                new_diff[k] = new_v

        # If nothing changed (rare), still log minimal update
        self._log(
            request=request,
            obj_id=obj.pk,
            action="UPDATE",
            old_value=old_diff or None,
            new_value=new_diff or None,
        )


    def delete_model(self, request, obj):
        old_value = self.snapshot_func(obj)
        obj_id = obj.pk
        super().delete_model(request, obj)
        self._log(request=request, obj_id=obj_id, action="DELETE", old_value=old_value, new_value=None)


class DocumentVersionInline(admin.TabularInline):
    model = DocumentVersion
    extra = 1
    fields = ("version_number", "file", "change_note")



@admin.register(Company)
class CompanyAdmin(AuditAdminMixin, admin.ModelAdmin):
    audit_entity_type = "COMPANY"
    snapshot_func = staticmethod(snap_company)

    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    readonly_fields = ("created_at",)




@admin.register(Project)
class ProjectAdmin(AuditAdminMixin, admin.ModelAdmin):
    audit_entity_type = "PROJECT"
    snapshot_func = staticmethod(snap_project)

    list_display = ("id", "code", "name", "company", "status", "created_at")
    list_filter = ("status", "company")
    search_fields = ("code", "name")
    readonly_fields = ("created_at",)

@admin.register(Document)
class DocumentAdmin(AuditAdminMixin, admin.ModelAdmin):
    audit_entity_type = "DOCUMENT"
    snapshot_func = staticmethod(snap_document)

    exclude = ("created_by",)
    readonly_fields = ("created_at",)

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    inlines = (DocumentVersionInline,)

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in instances:
            if isinstance(obj, DocumentVersion) and not obj.uploaded_by_id:
                obj.uploaded_by = request.user
            obj.save()
        formset.save_m2m()
        




@admin.register(DocumentVersion)
class DocumentVersionAdmin(AuditAdminMixin, admin.ModelAdmin):
    audit_entity_type = "VERSION"   # matches your AuditLog ENTITY_CHOICES
    snapshot_func = staticmethod(snap_version)

    list_display = ("id", "document", "version_number", "uploaded_by", "uploaded_at")
    search_fields = ("document__document_number",)
    exclude = ("uploaded_by",)
    readonly_fields = ("uploaded_at",)

    def save_model(self, request, obj, form, change):
        if not change and not obj.uploaded_by_id:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
  




@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "entity_type", "entity_id", "action", "performed_by", "performed_at")
    list_filter = ("entity_type", "action")
    search_fields = ("entity_type", "entity_id", "performed_by__username")
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
