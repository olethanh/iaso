# Generated by Django 3.2.13 on 2022-06-14 15:37

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("polio", "0062_alter_budgetevent_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="budgetevent",
            name="links",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="budgetevent",
            name="status",
            field=models.CharField(
                choices=[("validation_ongoing", "Validation Ongoing"), ("validated", "Validated")],
                max_length=200,
                null=True,
            ),
        ),
    ]
