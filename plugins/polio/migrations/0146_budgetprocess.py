# Generated by Django 3.2.15 on 2023-09-25 14:19

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("iaso", "0231_merge_20230904_2154"),
        ("polio", "0145_alter_vaccineauthorization_expiration_date"),
    ]

    operations = [
        migrations.CreateModel(
            name="BudgetProcess",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("deleted_at", models.DateTimeField(blank=True, default=None, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
                ),
                (
                    "created_by_team",
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to="iaso.team"
                    ),
                ),
                ("rounds", models.ManyToManyField(related_name="budget_process_rounds", to="polio.Round")),
                ("teams", models.ManyToManyField(related_name="budget_process_teams", to="iaso.Team")),
            ],
            options={
                "verbose_name_plural": "Budget Processes",
                "ordering": ["-updated_at"],
            },
        ),
    ]