# Generated by Django 2.0 on 2019-02-21 18:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("vector_control", "0017_catch_problem")]

    operations = [
        migrations.AddField(
            model_name="target",
            name="api_import",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="vector_control.APIImport",
            ),
        ),
        migrations.AddField(
            model_name="target",
            name="external_index",
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(model_name="target", name="uuid", field=models.TextField(null=True)),
        migrations.AddField(model_name="target", name="village", field=models.TextField(null=True)),
    ]
