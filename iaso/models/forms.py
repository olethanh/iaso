import pathlib
import typing
from django.contrib.auth.models import AnonymousUser, User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import models, transaction
from django.contrib.postgres.fields import JSONField
from django.utils.translation import ugettext_lazy as _
from django.contrib.postgres.fields import ArrayField, CITextField

from .project import Project
from ..dhis2.form_mapping import copy_mappings_from_previous_version
from ..odk import parsing
from ..utils import slugify_underscore
from .. import periods
from uuid import uuid4

from ..utils.models.soft_deletable import DefaultSoftDeletableManager, SoftDeletableModel, \
    IncludeDeletedSoftDeletableManager, OnlyDeletedSoftDeletableManager


class FormQuerySet(models.QuerySet):
    def exists_with_same_version_id_within_projects(self, form: "Form", form_id: str):
        """Checks whether the provided form_id is already in a form that is:

        - different from the provided form
        - linked to a project from the same accounts as the provided form
        """

        all_accounts = set(project.account for project in form.projects.all())  # TODO: discuss - smells weird
        for account in all_accounts:
            if self.filter(projects__account=account, form_id=form_id).exclude(pk=form.id).exists():
                return True

        return False

    def filter_for_user_and_app_id(self, user: typing.Union[User, AnonymousUser], app_id: str):
        if user.is_anonymous and app_id is None:
            return self.none()

        queryset = self.all()

        if user.is_authenticated:
            queryset = queryset.filter(projects__account=user.iaso_profile.account)

        if app_id is not None:  # mobile app
            try:
                project = Project.objects.get_for_user_and_app_id(user, app_id)
                queryset = queryset.filter(projects__in=[project])
                queryset = queryset.exclude(derived=True)  # do not include derived instances for the mobile app
            except Project.DoesNotExist:
                return self.none()

        return queryset

class Form(SoftDeletableModel):
    PERIOD_TYPE_CHOICES = (
        (periods.PERIOD_TYPE_MONTH, _("Month")),
        (periods.PERIOD_TYPE_QUARTER, _("Quarter")),
        (periods.PERIOD_TYPE_SIX_MONTH, _("Six-month")),
        (periods.PERIOD_TYPE_YEAR, _("Year")),
    )

    org_unit_types = models.ManyToManyField("OrgUnitType", blank=True)
    form_id = models.TextField(null=True, blank=True)  # extracted from version xls file
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.TextField()
    device_field = models.TextField(null=True, blank=True)
    location_field = models.TextField(null=True, blank=True)
    correlation_field = models.TextField(null=True, blank=True)
    correlatable = models.BooleanField(default=False)
    # Accumulated list of all the fields that were present at some point in a version of the form. This is used to
    # build a table view of the form answers without having to parse the xml files
    fields = JSONField(null=True, blank=True)
    period_type = models.TextField(null=True, blank=True, choices=PERIOD_TYPE_CHOICES)
    single_per_period = models.BooleanField(default=False)
    # The following two fields control the allowed period span (instances can be provided for the period corresponding
    # to [current_period - periods_before_allowed, current_period + periods_after_allowed]
    periods_before_allowed = models.IntegerField(default=0)
    periods_after_allowed = models.IntegerField(default=0)
    # True if the data is generated by iaso or  False via data entry in mobile
    derived = models.BooleanField(default=False)
    uuid = models.UUIDField(default=uuid4, unique=True)
    label_keys = ArrayField(CITextField(max_length=255, blank=True), size=100, null=True, blank=True)

    objects = DefaultSoftDeletableManager.from_queryset(FormQuerySet)()

    objects_only_deleted = OnlyDeletedSoftDeletableManager.from_queryset(FormQuerySet)()

    objects_include_deleted = IncludeDeletedSoftDeletableManager.from_queryset(FormQuerySet)()

    @property
    def latest_version(self):
        return self.form_versions.order_by("-created_at").first()

    def __str__(self):
        return "%s %s " % (self.name, self.form_id)

    def as_dict(self, additional_fields=None, show_version=True):
        res = {
            "form_id": self.form_id,
            "name": self.name,
            "id": self.id,
            "org_unit_types": [t.as_dict() for t in self.org_unit_types.all()],
            "created_at": self.created_at.timestamp() if self.created_at else None,
            "updated_at": self.updated_at.timestamp() if self.updated_at else None,
            "period_type": self.period_type,
            "single_per_period": self.single_per_period,
            "label_keys": self.label_keys
        }

        if show_version:
            res["latest_form_version"] = self.latest_version.as_dict() if self.latest_version is not None else None
        if additional_fields:
            for field in additional_fields:
                if hasattr(self, field):
                    res[field] = getattr(self, field)

        return res

def _form_version_upload_to(instance: "FormVersion", filename: str) -> str:
    path = pathlib.Path(filename)
    underscored_form_name = slugify_underscore(instance.form.name)

    return f"forms/{underscored_form_name}_{instance.version_id}{path.suffix}"


class FormVersionQuerySet(models.QuerySet):
    def latest_version(self, form: Form):
        try:
            return self.filter(form=form).latest("created_at")
        except FormVersion.DoesNotExist:
            return None


class FormVersionManager(models.Manager):
    def create_for_form_and_survey(self, *, form: "Form", survey: parsing.Survey, **kwargs):
        with transaction.atomic():
            latest_version = self.latest_version(form)

            form_version = super().create(
                **kwargs,
                form=form,
                file=SimpleUploadedFile(survey.generate_file_name("xml"), survey.to_xml(), content_type="text/xml"),
                version_id=survey.version,
                form_descriptor=survey.to_json(),
            )
            form.form_id = survey.form_id
            form.save()

            if latest_version is not None:
                copy_mappings_from_previous_version(form_version, latest_version)

        return form_version


class FormVersion(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="form_versions")
    # xml file representation
    file = models.FileField(upload_to=_form_version_upload_to)
    xls_file = models.FileField(upload_to=_form_version_upload_to, null=True, blank=True)
    form_descriptor = JSONField(null=True, blank=True)
    version_id = models.TextField()  # extracted from xls
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = FormVersionManager.from_queryset(FormVersionQuerySet)()

    def get_or_save_form_descriptor(self,):  # TODO: remove me - shoud be populated on create
        if self.form_descriptor:
            json_survey = self.form_descriptor
        elif self.xls_file:
            json_survey = parsing.to_json_dict(self)
            self.form_descriptor = json_survey
            self.save()
        else:
            json_survey = {}
        return json_survey

    def questions_by_name(self):
        return parsing.to_questions_by_name(self.get_or_save_form_descriptor())

    def repeat_groups(self):
        questions = self.questions_by_name()
        repeats = []
        for key, value in questions.items():
            if value["type"] == "repeat":
                repeats.append(value)

        return repeats

    def as_dict(self):
        return {
            "id": self.id,
            "version_id": self.version_id,
            "file": self.file.url,
            "xls_file": self.xls_file.url if self.xls_file else None,
            "created_at": self.created_at.timestamp() if self.created_at else None,
            "updated_at": self.updated_at.timestamp() if self.updated_at else None,
        }

    def __str__(self):
        return "%s - %s - %s" % (self.form.name, self.version_id, self.created_at)
