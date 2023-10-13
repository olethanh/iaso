from rest_framework import viewsets, permissions, serializers
from rest_framework.mixins import ListModelMixin
from rest_framework.viewsets import GenericViewSet

from iaso.api.serializers import AppIdSerializer
from iaso.api_filters.org_unit_change_requests import MobileOrgUnitChangeRequestListFilter
from iaso.models import OrgUnitChangeRequest


class MobileOrgUnitChangeRequestListSerializer(serializers.ModelSerializer):
    org_unit_id = serializers.IntegerField(source="org_unit.id")
    org_unit_uuid = serializers.UUIDField(source="org_unit.uuid")

    class Meta:
        model = OrgUnitChangeRequest
        fields = [
            "id",
            "org_unit_id",
            "org_unit_uuid",
            "status",
            "approved_fields",
            "rejection_comment",
            "created_at",
            "updated_at",
            "new_parent_id",
            "new_name",
            "new_org_unit_type_id",
            "new_groups",
            "new_location",
            "new_accuracy",
            "new_reference_instances",
        ]


class MobileOrgUnitChangeRequestViewSet(ListModelMixin, GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = MobileOrgUnitChangeRequestListFilter
    serializer_class = MobileOrgUnitChangeRequestListSerializer

    def get_queryset(self):
        app_id_serializer = AppIdSerializer(data=self.request.query_params)
        app_id_serializer.is_valid(raise_exception=True)

        return (
            OrgUnitChangeRequest.objects.all()
            .select_related("org_unit")
            .prefetch_related(
                "new_groups",
                "new_reference_instances",
            )
        )
