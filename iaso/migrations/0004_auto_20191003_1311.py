# Generated by Django 2.2.4 on 2019-10-03 13:11

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("iaso", "0003_auto_20191003_1301")]

    operations = [
        migrations.AlterField(
            model_name="link",
            name="validator",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        )
    ]
