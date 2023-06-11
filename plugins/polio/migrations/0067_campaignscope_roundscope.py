# Generated by Django 3.2.14 on 2022-07-18 14:03

from django.db import migrations, models
import django.db.models.deletion
import plugins.polio.models


class Migration(migrations.Migration):
    dependencies = [
        ("iaso", "0151_auto_20220718_1359"),
        ("polio", "0066_auto_20220620_0902"),
    ]

    operations = [
        migrations.CreateModel(
            name="RoundScope",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "vaccine",
                    models.CharField(
                        blank=True,
                        choices=[("mOPV2", "mOPV2"), ("nOPV2", "nOPV2"), ("bOPV", "bOPV")],
                        max_length=5,
                        null=True,
                    ),
                ),
                (
                    "group",
                    models.OneToOneField(
                        default=plugins.polio.models.make_group_round_scope,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="roundScope",
                        to="iaso.group",
                    ),
                ),
                (
                    "round",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="scopes", to="polio.round"
                    ),
                ),
            ],
            options={
                "ordering": ["round", "vaccine"],
                "unique_together": {("round", "vaccine")},
            },
        ),
        migrations.CreateModel(
            name="CampaignScope",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "vaccine",
                    models.CharField(
                        blank=True,
                        choices=[("mOPV2", "mOPV2"), ("nOPV2", "nOPV2"), ("bOPV", "bOPV")],
                        max_length=5,
                        null=True,
                    ),
                ),
                (
                    "campaign",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="scopes", to="polio.campaign"
                    ),
                ),
                (
                    "group",
                    models.OneToOneField(
                        default=plugins.polio.models.make_group_campaign_scope,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="campaignScope",
                        to="iaso.group",
                    ),
                ),
            ],
            options={
                "ordering": ["campaign", "vaccine"],
                "unique_together": {("campaign", "vaccine")},
            },
        ),
    ]
