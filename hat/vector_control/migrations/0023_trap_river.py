# Generated by Django 2.0 on 2019-03-27 15:27

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("vector_control", "0022_site_creator")]

    operations = [
        migrations.AddField(
            model_name="trap",
            name="river",
            field=models.TextField(blank=True, null=True),
        )
    ]
