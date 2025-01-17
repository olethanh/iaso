"""Permissions list

These permissions are used and not the django built in one on each model.
They are used for API access but also to see which page a user has access
in the frontend.

To add a new permission:
1. Add a constant to hold its label
2. Add it to the CustomPermissionSupport.Meta.permissions tuple bellow
3. Generate a migration via makemigrations (and run the migration locally)
4. Add it in hat/assets/js/apps/Iaso/domains/users/messages.js
5. add it to en.json and fr.json

If you don't follow these steps you will break the frontend!

The frontend is getting the list of existing permission from the
`/api/permissions/` endpoint
"""
from django.conf import LazySettings
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import PermissionDenied

_ASSIGNMENTS = "iaso_assignments"
_COMPLETENESS = "iaso_completeness"
_COMPLETENESS_STATS = "iaso_completeness_stats"
_DATASTORE_READ = "iaso_datastore_read"
_DATASTORE_WRITE = "iaso_datastore_write"
_DATA_TASKS = "iaso_data_tasks"
_ENTITIES = "iaso_entities"
_ENTITY_TYPE_WRITE = "iaso_entity_type_write"
_ENTITIES_DUPLICATE_READ = "iaso_entity_duplicates_read"
_ENTITIES_DUPLICATE_WRITE = "iaso_entity_duplicates_write"
_FORMS = "iaso_forms"
_LINKS = "iaso_links"
_MAPPINGS = "iaso_mappings"
_MODULES = "iaso_modules"
_ORG_UNITS = "iaso_org_units"
_ORG_UNITS_TYPES = "iaso_org_unit_types"
_ORG_UNITS_GROUPS = "iaso_org_unit_groups"
_ORG_UNITS_CHANGE_REQUEST = "iaso_org_unit_change_request"
_ORG_UNITS_CHANGE_REQUEST_APPROVE = "iaso_org_unit_change_request_approve"
_PAGES = "iaso_pages"
_PAGE_WRITE = "iaso_page_write"
_PLANNING = "iaso_planning"
_POLIO = "iaso_polio"
_POLIO_BUDGET = "iaso_polio_budget"
_POLIO_BUDGET_ADMIN = "iaso_polio_budget_admin"
_POLIO_CONFIG = "iaso_polio_config"
_PROJECTS = "iaso_projects"
_REGISTRY = "iaso_registry"
_REPORTS = "iaso_reports"
_SOURCE_WRITE = "iaso_write_sources"
_SOURCES = "iaso_sources"
_STORAGE = "iaso_storages"
_SUBMISSIONS = "iaso_submissions"
_SUBMISSIONS_UPDATE = "iaso_update_submission"
_TEAMS = "iaso_teams"
_USERS_ADMIN = "iaso_users"
_USERS_MANAGED = "iaso_users_managed"
_USERS_ROLES = "iaso_user_roles"
_WORKFLOW = "iaso_workflows"
_POLIO_VACCINE_AUTHORIZATIONS_ADMIN = "iaso_polio_vaccine_authorizations_admin"
_POLIO_VACCINE_AUTHORIZATIONS_READ_ONLY = "iaso_polio_vaccine_authorizations_read_only"


_PREFIX = "menupermissions."
ASSIGNMENTS = _PREFIX + _ASSIGNMENTS
COMPLETENESS = _PREFIX + _COMPLETENESS
COMPLETENESS_STATS = _PREFIX + _COMPLETENESS_STATS
DATASTORE_READ = _PREFIX + _DATASTORE_READ
DATASTORE_WRITE = _PREFIX + _DATASTORE_WRITE
DATA_TASKS = _PREFIX + _DATA_TASKS
ENTITIES = _PREFIX + _ENTITIES
ENTITY_TYPE_WRITE = _PREFIX + _ENTITY_TYPE_WRITE
ENTITIES_DUPLICATE_READ = _PREFIX + _ENTITIES_DUPLICATE_READ
ENTITIES_DUPLICATE_WRITE = _PREFIX + _ENTITIES_DUPLICATE_WRITE
FORMS = _PREFIX + _FORMS
LINKS = _PREFIX + _LINKS
MAPPINGS = _PREFIX + _MAPPINGS
MODULES = _PREFIX + _MODULES
ORG_UNITS = _PREFIX + _ORG_UNITS
ORG_UNITS_TYPES = _PREFIX + _ORG_UNITS_TYPES
ORG_UNITS_GROUPS = _PREFIX + _ORG_UNITS_GROUPS
ORG_UNITS_CHANGE_REQUEST = _PREFIX + _ORG_UNITS_CHANGE_REQUEST
ORG_UNITS_CHANGE_REQUEST_APPROVE = _PREFIX + _ORG_UNITS_CHANGE_REQUEST_APPROVE
PAGES = _PREFIX + _PAGES
PAGE_WRITE = _PREFIX + _PAGE_WRITE
PLANNING = _PREFIX + _PLANNING
POLIO = _PREFIX + _POLIO
POLIO_BUDGET = _PREFIX + _POLIO_BUDGET
POLIO_BUDGET_ADMIN = _PREFIX + _POLIO_BUDGET_ADMIN
POLIO_CONFIG = _PREFIX + _POLIO_CONFIG
POLIO_VACCINE_AUTHORIZATIONS_ADMIN = _PREFIX + _POLIO_VACCINE_AUTHORIZATIONS_ADMIN
POLIO_VACCINE_AUTHORIZATIONS_READ_ONLY = _PREFIX + _POLIO_VACCINE_AUTHORIZATIONS_READ_ONLY
PROJECTS = _PREFIX + _PROJECTS
REGISTRY = _PREFIX + _REGISTRY
REPORTS = _PREFIX + _REPORTS
SOURCE_WRITE = _PREFIX + _SOURCE_WRITE
SOURCES = _PREFIX + _SOURCES
STORAGE = _PREFIX + _STORAGE
SUBMISSIONS = _PREFIX + _SUBMISSIONS
SUBMISSIONS_UPDATE = _PREFIX + _SUBMISSIONS_UPDATE
TEAMS = _PREFIX + _TEAMS
USERS_ADMIN = _PREFIX + _USERS_ADMIN
USERS_MANAGED = _PREFIX + _USERS_MANAGED
USERS_ROLES = _PREFIX + _USERS_ROLES
WORKFLOW = _PREFIX + _WORKFLOW


class CustomPermissionSupport(models.Model):
    """Model used to hold our custom permission."""

    @staticmethod
    def get_full_permission_list():
        return [couple[0] for couple in CustomPermissionSupport._meta.permissions]

    # Used in setup_account api
    DEFAULT_PERMISSIONS_FOR_NEW_ACCOUNT_USER = [
        _FORMS,
        _SUBMISSIONS,
        _MAPPINGS,
        _COMPLETENESS,
        _ORG_UNITS,
        _LINKS,
        _USERS_ADMIN,
        _PROJECTS,
        _SOURCES,
        _DATA_TASKS,
        _REPORTS,
    ]

    class Meta:
        managed = False  # No database table creation or deletion operations \
        # will be performed for this model.

        permissions = (
            (_FORMS, _("Formulaires")),
            (_MAPPINGS, _("Correspondances avec DHIS2")),
            (_MODULES, _("modules")),
            (_COMPLETENESS, _("Complétude des données")),
            (_ORG_UNITS, _("Unités d'organisations")),
            (_REGISTRY, _("Registre")),
            (_LINKS, _("Correspondances sources")),
            (_USERS_ADMIN, _("Users")),
            (_USERS_MANAGED, _("Users managed")),
            (_PAGES, _("Pages")),
            (_PROJECTS, _("Projets")),
            (_SOURCES, _("Sources")),
            (_DATA_TASKS, _("Tâches")),
            (_POLIO, _("Polio")),
            (_POLIO_CONFIG, _("Polio config")),
            (_SUBMISSIONS, _("Soumissions")),
            (_SUBMISSIONS_UPDATE, _("Editer soumissions")),
            (_PLANNING, _("Planning")),
            (_REPORTS, _("Reports")),
            (_TEAMS, _("Equipes")),
            (_ASSIGNMENTS, _("Attributions")),
            (_POLIO_BUDGET, _("Budget Polio")),
            (_ENTITIES, _("Entities")),
            (_ENTITY_TYPE_WRITE, _("Write entity type")),
            (_STORAGE, _("Storages")),
            (_COMPLETENESS_STATS, _("Completeness stats")),
            (_WORKFLOW, _("Workflows")),
            (_POLIO_BUDGET_ADMIN, _("Budget Polio Admin")),
            (_ENTITIES_DUPLICATE_READ, _("Read Entity duplicates")),
            (_ENTITIES_DUPLICATE_WRITE, _("Write Entity duplicates")),
            (_USERS_ROLES, _("Manage user roles")),
            (_DATASTORE_READ, _("Read data store")),
            (_DATASTORE_WRITE, _("Write data store")),
            (_ORG_UNITS_TYPES, _("Org unit types")),
            (_ORG_UNITS_GROUPS, _("Org unit groups")),
            (_ORG_UNITS_CHANGE_REQUEST, _("Org unit change request")),
            (_ORG_UNITS_CHANGE_REQUEST_APPROVE, _("Org unit change request approve")),
            (_SOURCE_WRITE, _("Write data source")),
            (_PAGE_WRITE, _("Write page")),
            (_POLIO_VACCINE_AUTHORIZATIONS_READ_ONLY, _("Polio Vaccine Authorizations Read Only")),
            (_POLIO_VACCINE_AUTHORIZATIONS_ADMIN, _("Polio Vaccine Authorizations Admin")),
        )

    @staticmethod
    def filter_permissions(permissions, modules_permissions, settings: LazySettings):
        content_type = ContentType.objects.get_for_model(CustomPermissionSupport)
        permissions = (
            permissions.filter(content_type=content_type)
            .filter(codename__startswith="iaso_")
            .filter(codename__in=modules_permissions)
            .exclude(codename__contains="datastore")
            .exclude(codename__contains="iaso_beneficiaries")
            # Wait for the web UI to be ready before displaying `org_unit_change_request` perms.
            .exclude(codename__contains="org_unit_change_request")
            .order_by("id")
        )
        #  in future filter this on a feature flags, so we can disable it by account
        if "polio" not in settings.PLUGINS:
            permissions = permissions.exclude(codename__startswith="iaso_polio")

        return permissions

    @staticmethod
    def assert_right_to_assign(user, permission_codename: str):
        if not user.has_perm(USERS_ADMIN) and permission_codename == _USERS_ADMIN:
            raise PermissionDenied(f"Only users with {USERS_ADMIN} permission can grant {USERS_ADMIN} permission")
