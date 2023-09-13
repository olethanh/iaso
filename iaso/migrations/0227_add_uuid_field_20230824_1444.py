# Generated by Django 3.2.15 on 2023-08-24 14:44

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ("iaso", "0226_merge_20230724_1245"),
    ]

    operations = [
        migrations.AddField(
            model_name="workflow",
            name="uuid",
            field=models.UUIDField(default=uuid.uuid4, null=True),
        ),
        migrations.AddField(
            model_name="workflowversion",
            name="uuid",
            field=models.UUIDField(default=uuid.uuid4, null=True),
        ),
    ]