# Generated by Django 2.1.11 on 2020-06-03 11:28

from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("contenttypes", "0002_remove_content_type_name"),
        ("iaso", "0049_remove_groupset_projects"),
    ]

    operations = [
        migrations.CreateModel(
            name="BulkOperation",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("operation_type", models.CharField(choices=[("UPDATE", "Update")], max_length=100)),
                ("operation_count", models.PositiveIntegerField()),
                ("json_body", django.contrib.postgres.fields.jsonb.JSONField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "content_type",
                    models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to="contenttypes.ContentType"),
                ),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "iaso_operation_bulkupdate"},
        )
    ]
