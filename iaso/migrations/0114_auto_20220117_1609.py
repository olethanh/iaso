# Generated by Django 3.1.14 on 2022-01-17 16:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("iaso", "0113_auto_20220117_1607"),
    ]

    operations = [
        migrations.AlterField(
            model_name="entity",
            name="name",
            field=models.CharField(default=" ", max_length=255),
            preserve_default=False,
        ),
    ]
