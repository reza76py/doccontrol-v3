
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


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

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_number = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    discipline = models.CharField(max_length=50)
    doc_type = models.CharField(max_length=50)
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
    document = models.ForeignKey(
        Document,
        on_delete=models.PROTECT,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to="documents/")
    change_note = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="uploaded_versions",
    )
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
