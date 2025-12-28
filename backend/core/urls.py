from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet,
    ProjectViewSet,
    DocumentViewSet,
    DocumentVersionViewSet,
    AuditLogViewSet,
)

router = DefaultRouter()
router.register(r"companies", CompanyViewSet)
router.register(r"projects", ProjectViewSet)
router.register(r"documents", DocumentViewSet)
router.register(r"document-versions", DocumentVersionViewSet)
router.register(r"audit-logs", AuditLogViewSet)

urlpatterns = router.urls
