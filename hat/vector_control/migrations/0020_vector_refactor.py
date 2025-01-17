# Generated by Django 2.0 on 2019-02-26 16:37

from django.conf import settings
import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("vector_control", "0019_auto_20190225_1007"),
    ]

    operations = [
        migrations.RunSQL(sql="delete from vector_control_catch"),
        migrations.RunSQL(sql="delete from vector_control_site"),
        migrations.RunSQL(sql="drop table if exists vector_catch"),
        migrations.RunSQL(sql="drop table if exists vector_site"),
        migrations.RunSQL(sql="drop table if exists vector_target"),
        migrations.RunSQL(sql="drop table if exists vector_gpswaypoint"),
        migrations.RunSQL(sql="drop table if exists vector_gpsimport"),
        migrations.CreateModel(
            name="Trap",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=50, null=True)),
                (
                    "accuracy",
                    models.DecimalField(decimal_places=2, max_digits=7, null=True),
                ),
                (
                    "habitat",
                    models.TextField(
                        blank=True,
                        choices=[
                            ("bush", "Buisson"),
                            ("fish_pond", "Etang à poissons"),
                            ("farm", "Ferme"),
                            ("forest", "Forêt"),
                            ("unknown", "Inconnu"),
                            ("lake", "Lac"),
                            ("river", "Rivière"),
                            ("road", "Route"),
                            ("stream", "Ruisseau"),
                        ],
                        max_length=255,
                        null=True,
                    ),
                ),
                ("description", models.CharField(max_length=255, null=True)),
                ("created_at", models.DateTimeField(null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("total", models.IntegerField(default=0)),
                ("uuid", models.TextField(default=uuid.uuid4, unique=True)),
                (
                    "source",
                    models.TextField(
                        choices=[("excel", "Excel"), ("API", "API")],
                        default="excel",
                        null=True,
                    ),
                ),
                ("is_reference", models.BooleanField(default=False)),
                (
                    "location",
                    django.contrib.gis.db.models.fields.PointField(dim=3, null=True, srid=4326),
                ),
                ("ignore", models.BooleanField(default=False)),
            ],
        ),
        migrations.RemoveField(model_name="catch", name="site"),
        migrations.RemoveField(model_name="site", name="description"),
        migrations.RemoveField(model_name="site", name="habitat"),
        migrations.RemoveField(model_name="site", name="is_reference"),
        migrations.RemoveField(model_name="site", name="source"),
        migrations.RemoveField(model_name="site", name="total"),
        migrations.RemoveField(model_name="site", name="user"),
        migrations.AddField(
            model_name="site",
            name="responsible",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="apiimport",
            name="import_type",
            field=models.TextField(
                blank=True,
                choices=[
                    ("trap", "Trap"),
                    ("site", "Site"),
                    ("catch", "Catch"),
                    ("target", "Target"),
                ],
                max_length=25,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="site",
            name="api_import",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="vector_control.APIImport",
            ),
        ),
        migrations.AlterField(
            model_name="site",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name="site",
            name="name",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="site",
            name="uuid",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="trap",
            name="api_import",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="vector_control.APIImport",
            ),
        ),
        migrations.AddField(
            model_name="trap",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="catch",
            name="trap",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to="vector_control.Trap",
            ),
            preserve_default=False,
        ),
    ]
