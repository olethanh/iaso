import datetime
from datetime import date

from django.contrib.auth.models import User, Permission
from django.contrib.sites.models import Site
from django.core import mail
from django.utils.timezone import now
from rest_framework.test import APIClient

from hat import settings
from hat.audit.models import Modification
from iaso import models as m
from iaso.models import Account, OrgUnitType, OrgUnit, Group, Team
from iaso.test import APITestCase
from plugins.polio.api import vaccine_authorizations_60_days_expiration_email_alert
from plugins.polio.models import VaccineAuthorization


class VaccineAuthorizationAPITestCase(APITestCase):
    data_source: m.DataSource
    source_version_1: m.SourceVersion
    account: Account

    @classmethod
    def setUpTestData(cls):
        cls.data_source = m.DataSource.objects.create(name="Default source")
        cls.now = now()

        cls.source_version_1 = m.SourceVersion.objects.create(data_source=cls.data_source, number=1)
        cls.account = Account.objects.create(name="polio", default_version=cls.source_version_1)
        cls.default_project = m.Project.objects.create(name="Default project", app_id="default", account=cls.account)
        cls.data_source.projects.set([cls.default_project])

        cls.account_2 = Account.objects.create(name="second_account", default_version=cls.source_version_1)
        cls.user_1 = cls.create_user_with_profile(
            username="user_1",
            account=cls.account,
            permissions=["iaso_polio_vaccine_authorizations_admin", "iaso_polio_vaccine_authorizations_read_only"],
            email="XlfeeekfdpppZ@somemailzz.io",
        )
        cls.user_2 = cls.create_user_with_profile(
            username="user_2", account=cls.account, permissions=["iaso_polio_vaccine_authorizations_read_only"]
        )
        cls.user_3 = cls.create_user_with_profile(username="user_3", account=cls.account, permissions=["iaso_forms"])

        cls.project = m.Project.objects.create(
            name="Polio",
            app_id="polio.projects",
            account=cls.account,
        )

        cls.project_2 = m.Project.objects.create(
            name="Project_2",
            app_id="pro.jects",
            account=cls.account_2,
        )

        cls.org_unit_type_country = OrgUnitType.objects.create(name="COUNTRY", category="COUNTRY")

        cls.org_unit_type_country.projects.set([cls.project, cls.project_2])
        cls.org_unit_type_country.save()

        cls.org_unit_DRC = m.OrgUnit.objects.create(
            org_unit_type=cls.org_unit_type_country,
            version=cls.source_version_1,
            name="Democratic Republic of Congo",
            validation_status=m.OrgUnit.VALIDATION_VALID,
            source_ref="PvtAI4RUMkr",
        )

        cls.org_unit_ALGERIA = m.OrgUnit.objects.create(
            org_unit_type=cls.org_unit_type_country,
            version=cls.source_version_1,
            name="ALGERIA",
            validation_status=m.OrgUnit.VALIDATION_VALID,
            source_ref="PvtAI4RUMkr",
        )

        cls.org_unit_SOMALIA = m.OrgUnit.objects.create(
            org_unit_type=cls.org_unit_type_country,
            version=cls.source_version_1,
            name="SOMALIA",
            validation_status=m.OrgUnit.VALIDATION_VALID,
            source_ref="PvtAI4RUMkr",
        )

    def setUp(self):
        self.client = APIClient()

    def test_user_can_post(self):
        self.client.force_authenticate(self.user_1)
        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.id])

        response = self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "ONGOING",
                "comment": "waiting for approval.",
                "expiration_date": "2024-02-01",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["country"]["name"], "Democratic Republic of Congo")
        self.assertEqual(response.data["expiration_date"], "2024-02-01"),
        self.assertEqual(response.data["status"], "ONGOING")
        self.assertEqual(response.data["comment"], "waiting for approval.")
        self.assertEqual(response.data["quantity"], 12346)

    def test_get_vacc_auth_by_id(self):
        self.client.force_authenticate(self.user_1)

        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.id])

        vaccine_auth = VaccineAuthorization.objects.create(
            account=self.user_1.iaso_profile.account,
            country=self.org_unit_DRC,
            quantity=123456,
            status="ongoing",
            comment="waiting for approval",
            expiration_date="2024-02-01",
        )

        response = self.client.get(f"/api/polio/vaccineauthorizations/{vaccine_auth.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["country"]["id"], self.org_unit_DRC.id)
        self.assertEqual(response.data["country"]["name"], "Democratic Republic of Congo")
        self.assertEqual(response.data["quantity"], 123456)
        self.assertEqual(response.data["status"], "ongoing")
        self.assertEqual(response.data["comment"], "waiting for approval")

    def test_can_access_list(self):
        self.client.force_authenticate(self.user_1)
        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.id])

        VaccineAuthorization.objects.create(
            country=self.org_unit_DRC,
            account=self.user_1.iaso_profile.account,
            quantity=1000000,
            status="signature",
            comment="validated",
            expiration_date="2024-02-01",
        )

        response = self.client.get("/api/polio/vaccineauthorizations/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_without_perm_cant_read(self):
        self.client.force_authenticate(self.user_3)
        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.id])

        VaccineAuthorization.objects.create(
            country=self.org_unit_DRC,
            account=self.user_1.iaso_profile.account,
            quantity=1000000,
            status="signature",
            comment="validated",
            expiration_date="2024-02-01",
        )

        response = self.client.get("/api/polio/vaccineauthorizations/")
        self.assertEqual(response.status_code, 403)

    def test_user_need_admin_perm_for_write_operations(self):
        self.client.force_authenticate(self.user_2)

        response = self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "ongoing",
                "comment": "waiting for approval.",
                "expiration_date": "2024-02-01",
            },
        )

        self.assertEqual(403, response.status_code)

    def test_user_without_read_only_cant_access_api(self):
        self.client.force_authenticate(self.user_3)

        response = self.client.get("/api/polio/vaccineauthorizations/")

        self.assertEqual(response.status_code, 403)

    def test_get_most_recent_authorizations(self):
        self.client.force_authenticate(self.user_1)
        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.pk])

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "EXPIRED",
                "comment": "waiting for approval.",
                "expiration_date": "2024-02-01",
            },
        )

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "VALIDATED",
                "comment": "validated auth",
                "expiration_date": "2024-03-01",
            },
        )

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "ONGOING",
                "comment": "next validation date",
                "expiration_date": "2024-04-01",
            },
        )

        response = self.client.get("/api/polio/vaccineauthorizations/get_most_recent_authorizations/")

        print(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["comment"], "next validation date")
        self.assertEqual(response.data[0]["status"], "ONGOING")
        self.assertEqual(response.data[0]["current_expiration_date"], datetime.date(2024, 3, 1))
        self.assertEqual(response.data[0]["next_expiration_date"], datetime.date(2024, 4, 1))

    def test_filters(self):
        self.client.force_authenticate(self.user_1)

        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.pk, self.org_unit_ALGERIA, self.org_unit_SOMALIA])

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "ONGOING",
                "comment": "waiting for approval.",
                "expiration_date": "2024-02-01",
            },
        )

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "ONGOING",
                "comment": "new update",
                "expiration_date": "2024-03-01",
            },
        )

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_ALGERIA.pk,
                "quantity": 12346,
                "status": "VALIDATED",
                "comment": "Approved.",
                "expiration_date": "2024-04-01",
            },
        )

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_SOMALIA.pk,
                "quantity": 12346,
                "status": "VALIDATED",
                "comment": "Approved.",
                "expiration_date": "2024-04-01",
            },
        )

        # search by partial name

        response = self.client.get("/api/polio/vaccineauthorizations/?search=congo")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        # retrieve by status
        response = self.client.get("/api/polio/vaccineauthorizations/?auth_status=VALIDATED")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        # retrieve only non deleted entries

        self.client.delete(f"/api/polio/vaccineauthorizations/{VaccineAuthorization.objects.last().pk}/")

        response = self.client.get("/api/polio/vaccineauthorizations/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

        # retrieve only deleted

        response = self.client.get("/api/polio/vaccineauthorizations/?deletion_status=deleted")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        # all

        response = self.client.get("/api/polio/vaccineauthorizations/?deletion_status=all")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 4)

        # only actives

        response = self.client.get("/api/polio/vaccineauthorizations/?deletion_status=active")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

    def test_block_countries(self):
        self.client.force_authenticate(self.user_1)

        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.pk, self.org_unit_ALGERIA, self.org_unit_SOMALIA])

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "ONGOING",
                "comment": "waiting for approval.",
                "expiration_date": "2024-02-01",
            },
        )

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_ALGERIA.pk,
                "quantity": 12346,
                "status": "ONGOING",
                "comment": "new update",
                "expiration_date": "2024-03-01",
            },
        )

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_SOMALIA.pk,
                "quantity": 12346,
                "status": "VALIDATED",
                "comment": "Approved.",
                "expiration_date": "2024-04-01",
            },
        )

        group = Group.objects.create(
            name="Sub-Saharian-Countries",
        )

        group.org_units.set([self.org_unit_DRC.pk, self.org_unit_SOMALIA.pk])

        response = self.client.get(f"/api/polio/vaccineauthorizations/?block_country={group.pk}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_get_recent_without_expired_or_validated_data_must_return_ongoing_or_signature(self):
        def test_get_most_recent_authorizations(self):
            self.client.force_authenticate(self.user_1)
            self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.pk])

            self.client.post(
                "/api/polio/vaccineauthorizations/",
                data={
                    "country": self.org_unit_DRC.pk,
                    "quantity": 12346,
                    "status": "ONGOING",
                    "comment": "waiting for approval.",
                    "expiration_date": "2024-02-01",
                },
            )

            response = self.client.get("/api/polio/vaccineauthorizations/get_most_recent_authorizations/")

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data[0]["comment"], "waiting for approval.")
            self.assertEqual(response.data[0]["status"], "ongoing")
            self.assertEqual(response.data[0]["current_expiration_date"], None)
            self.assertEqual(response.data[0]["next_expiration_date"], datetime.date(2024, 2, 1))

    def test_can_edit_authorizations(self):
        self.client.force_authenticate(self.user_1)
        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.pk])

        self.client.post(
            "/api/polio/vaccineauthorizations/",
            data={
                "country": self.org_unit_DRC.pk,
                "quantity": 12346,
                "status": "ONGOING",
                "comment": "waiting for approval.",
                "expiration_date": "2024-02-01",
            },
        )

        response = self.client.get("/api/polio/vaccineauthorizations/")

        self.assertEqual(response.data[0]["comment"], "waiting for approval.")

        last_entry = VaccineAuthorization.objects.last()

        data = {
            "country": self.org_unit_DRC.pk,
            "comment": "Approved",
            "status": "VALIDATED",
            "expiration_date": last_entry.expiration_date,
        }

        post_rep = self.client.put(f"/api/polio/vaccineauthorizations/{last_entry.pk}/", data=data)
        print(post_rep.data)

        response = self.client.get("/api/polio/vaccineauthorizations/")

        self.assertEqual(response.data[0]["comment"], "Approved")
        self.assertEqual(response.data[0]["status"], "VALIDATED")

    def test_vaccine_authorizations_60_days_expiration_email_alert(self):
        self.client.force_authenticate(self.user_1)
        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.pk])

        team = Team.objects.create(name="nOPV2 vaccine authorization alerts", project=self.project, manager=self.user_1)
        team.users.set([self.user_1])

        sixty_days_date = datetime.date.today() + datetime.timedelta(days=60)

        sixty_days_expiration_auth = VaccineAuthorization.objects.create(
            account=self.user_1.iaso_profile.account,
            country=self.org_unit_DRC,
            status="VALIDATED",
            quantity=1000000,
            comment="Validated for 1M",
            expiration_date=sixty_days_date,
        )

        VaccineAuthorization.objects.create(
            account=self.user_1.iaso_profile.account,
            country=self.org_unit_DRC,
            status="ONGOING",
            quantity=1000000,
            comment="Validated for 1M",
            expiration_date=datetime.date.today() + datetime.timedelta(days=100),
        )

        from_email = settings.DEFAULT_FROM_EMAIL

        response = vaccine_authorizations_60_days_expiration_email_alert()

        self.assertEqual(response, {"vacc_auth_mail_sent_to": ["XlfeeekfdpppZ@somemailzz.io"]})

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(
            mail.outbox[0].subject,
            f"ALERT: Vaccine Authorization {sixty_days_expiration_auth} arrives to expiration date in 2 months",
        )
        self.assertEqual(mail.outbox[0].from_email, from_email)
        self.assertEqual(mail.outbox[0].to, ["XlfeeekfdpppZ@somemailzz.io"])

    def test_expired_vaccine_authorizations_email_alert(self):
        self.client.force_authenticate(self.user_1)
        self.user_1.iaso_profile.org_units.set([self.org_unit_DRC.pk])

        team = Team.objects.create(name="nOPV2 vaccine authorization alerts", project=self.project, manager=self.user_1)
        team.users.set([self.user_1])

        past_date = datetime.date.today() - datetime.timedelta(days=1)

        past_vacc_auth = VaccineAuthorization.objects.create(
            account=self.user_1.iaso_profile.account,
            country=self.org_unit_DRC,
            status="VALIDATED",
            quantity=1000000,
            comment="Validated for 1M",
            expiration_date=past_date,
        )

        VaccineAuthorization.objects.create(
            account=self.user_1.iaso_profile.account,
            country=self.org_unit_DRC,
            status="ONGOING",
            quantity=1000000,
            comment="Validated for 1M",
            expiration_date=datetime.date.today() + datetime.timedelta(days=100),
        )

        from_email = settings.DEFAULT_FROM_EMAIL

        response = vaccine_authorizations_60_days_expiration_email_alert()

        self.assertEqual(response, {"vacc_auth_mail_sent_to": ["XlfeeekfdpppZ@somemailzz.io"]})

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, f"ALERT: Vaccine Authorization {past_vacc_auth} has expired.")
        self.assertEqual(mail.outbox[0].from_email, from_email)
        self.assertEqual(mail.outbox[0].to, ["XlfeeekfdpppZ@somemailzz.io"])
