import pathlib
import typing

from django.contrib.auth.models import AnonymousUser, User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import models, transaction
from django.utils.html import strip_tags
from django.utils.translation import ugettext_lazy as _
from django.contrib.postgres.fields import ArrayField, CITextField

from .project import Project
from ..dhis2.form_mapping import copy_mappings_from_previous_version
from ..odk import parsing
from ..utils import slugify_underscore
from .. import periods
from uuid import uuid4

from pprint import pformat
from typing import Any

from pygments import highlight
from pygments.formatters import Terminal256Formatter
from pygments.lexers import PythonLexer

from ..utils.models.soft_deletable import (
    DefaultSoftDeletableManager,
    SoftDeletableModel,
    IncludeDeletedSoftDeletableManager,
    OnlyDeletedSoftDeletableManager,
)


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

    def filter_for_user_and_app_id(self, user: typing.Union[User, AnonymousUser], app_id: typing.Optional[str] = None):
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
    """Metadata about a form

    Forms are versioned, see the FormVersion model
    """

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
    # see update_possible_fields
    possible_fields = models.JSONField(
        null=True,
        blank=True,
        help_text="Questions present in all versions of the form, as a flat list."
        "Automatically updated on new versions.",
    )
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
            "label_keys": self.label_keys,
        }

        if show_version:
            res["latest_form_version"] = self.latest_version.as_dict() if self.latest_version is not None else None
        if additional_fields:
            for field in additional_fields:
                if hasattr(self, field):
                    res[field] = getattr(self, field)

        return res

    def as_dict_for_completeness_stats(self):
        return {
            "name": self.name,
            "id": self.id,
        }

    def update_possible_fields(self: "Form"):
        """Keep accumulated list of all the flat fields that were present at some point in a version of the form.
        This is used to build a table view of the form answers without having to parse the xml files

        This need to be called when a new form version is added
        """
        # proceed from the oldest to the newest so we take newest labels
        all_questions = {}
        for form_version in self.form_versions.order_by("created_at"):
            # proceed from the oldest to the newest so we take newest labels
            questions = form_version.questions_by_name()
            if isinstance(questions, dict):
                all_questions.update(questions)
            else:
                print(f"Invalid questions on version {form_version}: {str(questions)[:50]}")
        self.possible_fields = _reformat_questions(all_questions)


def _form_version_upload_to(instance: "FormVersion", filename: str) -> str:
    path = pathlib.Path(filename)
    underscored_form_name = slugify_underscore(instance.form.name)

    return f"forms/{underscored_form_name}_{instance.version_id}{path.suffix}"


class FormVersionQuerySet(models.QuerySet):
    def latest_version(self, form: Form) -> "typing.Optional[FormVersion]":
        try:
            return self.filter(form=form).latest("created_at")
        except FormVersion.DoesNotExist:
            return None


def pprint_color(obj: Any) -> None:
    """Pretty-print in color."""
    print(highlight(pformat(obj), PythonLexer(), Terminal256Formatter()), end="")


def get_subtype(question):
    q_type = question["type"]

    if q_type == "select one" or q_type == "select all that apply" or q_type == "rank":
        if "media" in question and "image" in question["media"]:
            return "image"

        for c in question["children"]:
            if "media" in c and "image" in c["media"]:
                return "image"
        return "text"

    else:
        return None


def process_type(question):
    sub_type = get_subtype(question)

    return {"type": question["type"], "subtype": sub_type, "name": question["name"]}


def _reformat_questions(questions):
    """Return all questions as a list instead of dict
    remove fields of type 'note'
    keep only fields : name, label, type.
    label can contain html, to prevent injection and make them presentable in list we strip the tags
    """
    r = []

    for question in questions.values():

        if question["type"] == "note":
            continue

        q_type = process_type(question)

        if q_type["subtype"] is None:
            print(q_type["type"])
        else:
            print(q_type["type"] + " : " + q_type["subtype"])

        n = {
            "name": question["name"],
            "label": strip_tags(question["label"]) if "label" in question else "",
            "type": question["type"],
        }
        r.append(n)
    return r


# TODO: check if we really need a manager and a queryset for this model - some simplification would be good
class FormVersionManager(models.Manager):
    def create_for_form_and_survey(self, *, form: "Form", survey: parsing.Survey, **kwargs):
        with transaction.atomic():
            latest_version = self.latest_version(form)  # type: ignore

            survey_json = survey.to_json()

            print("survey_json", survey_json)
            print("survey_xml", survey.to_xml())

            form_version = super().create(
                **kwargs,
                form=form,
                file=SimpleUploadedFile(survey.generate_file_name("xml"), survey.to_xml(), content_type="text/xml"),
                version_id=survey.version,
                form_descriptor=survey_json,
            )
            form.form_id = survey.form_id
            form.update_possible_fields()
            form.save()

            if latest_version is not None:
                copy_mappings_from_previous_version(form_version, latest_version)

        return form_version


class FormVersion(models.Model):
    """A version of a Form

    The actual form definition (list of questions and their presentation) are kept in files (file/xls_file attribute)
    """

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="form_versions")
    # xml file representation
    file = models.FileField(upload_to=_form_version_upload_to)
    xls_file = models.FileField(upload_to=_form_version_upload_to, null=True, blank=True)
    form_descriptor = models.JSONField(null=True, blank=True)
    version_id = models.TextField()  # extracted from xls
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_period = models.TextField(blank=True, null=True)
    end_period = models.TextField(blank=True, null=True)

    objects = FormVersionManager.from_queryset(FormVersionQuerySet)()

    def get_or_save_form_descriptor(self):  # TODO: remove me - should be populated on create
        print("get_or_save_form_descriptor")
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

    def questions_by_path(self):
        return parsing.to_questions_by_path(self.get_or_save_form_descriptor())

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
