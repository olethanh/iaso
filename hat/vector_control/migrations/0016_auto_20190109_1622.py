# Generated by Django 2.0 on 2019-01-09 16:22

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("vector_control", "0015_auto_20190104_1231")]

    operations = [
        migrations.AlterField(
            model_name="target",
            name="location",
            field=django.contrib.gis.db.models.fields.PointField(dim=3, null=True, srid=4326),
        )
    ]
