
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import os

User = get_user_model()


def validate_document_file(file):
    allowed_extensions = {".pdf", ".dwg", ".docx"}
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(allowed_extensions))}")
    if file.size > 50 * 1024 * 1024:
        raise ValidationError("File size must not exceed 50 MB.")


def document_upload_path(instance, filename):
    """Generate file path for document uploads."""
    return os.path.join(
        f"projects/{instance.document.project.id}",
        f"documents/{instance.document.id}",
        filename
    )


# =========================
# COMPANY
# =========================
class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# =========================
# PROJECT
# =========================
class Project(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("ON_HOLD", "On Hold"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
        ("CLOSED", "Closed"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name="projects",
    )
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("company", "code")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} – {self.name}"


# =========================
# DOCUMENT
# =========================
class Document(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("REVIEW", "In Review"),
        ("IFC", "Issued For Construction"),
        ("SUPERSEDED", "Superseded"),
        ("CANCELLED", "Cancelled"),
    ]
    DISCIPLINE_CHOICES = [
        ("STRUCTURAL", "Structural"),
        ("CIVIL", "Civil"),
        ("ARCHITECTURAL", "Architectural"),
        ("MECHANICAL", "Mechanical"),
        ("ELECTRICAL", "Electrical"),
        ("GEOTECHNICAL", "Geotechnical"),
        ("SURVEY", "Survey"),
        ("ENVIRONMENTAL", "Environmental"),
    ]
    DOC_TYPE_CHOICES = [
        ("DRAWING", "Drawing"),
        ("SPECIFICATION", "Specification"),
        ("REPORT", "Report"),
        ("CALCULATION", "Calculation"),
        ("METHOD_STATEMENT", "Method Statement"),
        ("INSPECTION", "Inspection"),
        ("TRANSMITTAL", "Transmittal"),
        ("CORRESPONDENCE", "Correspondence"),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_number = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    discipline = models.CharField(max_length=20, choices=DISCIPLINE_CHOICES)
    doc_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="DRAFT",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="created_documents",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "document_number")
        ordering = ["document_number"]

    def __str__(self):
        return f"{self.document_number} ({self.status})"


# =========================
# DOCUMENT VERSION
# =========================
class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.PROTECT, related_name="versions")
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to=document_upload_path, validators=[validate_document_file])
    change_note = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="uploaded_versions")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("document", "version_number")
        ordering = ["-version_number"]

    def __str__(self):
        return f"{self.document.document_number} v{self.version_number}"



# =========================
# AUDIT LOG
# =========================
class AuditLog(models.Model):
    ENTITY_CHOICES = [
        ("COMPANY", "Company"),
        ("PROJECT", "Project"),
        ("DOCUMENT", "Document"),
        ("VERSION", "DocumentVersion"),
    ]

    ACTION_CHOICES = [
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("ISSUE", "Issue"),
        ("CANCEL", "Cancel"),
        ("DELETE", "Delete"),
    ]

    entity_type = models.CharField(max_length=20, choices=ENTITY_CHOICES)
    entity_id = models.PositiveIntegerField()
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    performed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="audit_logs",
    )
    performed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-performed_at"]

    def __str__(self):
        return f"{self.entity_type} {self.action} ({self.entity_id})"
