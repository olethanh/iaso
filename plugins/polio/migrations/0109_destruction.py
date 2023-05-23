# Generated by Django 3.2.15 on 2022-11-04 15:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("polio", "0108_shipment_comment"),
    ]

    operations = [
        migrations.CreateModel(
            name="Destruction",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("vials_destroyed", models.IntegerField(blank=True, null=True)),
                ("date_report_received", models.DateField(blank=True, null=True)),
                ("date_report", models.DateField(blank=True, null=True)),
                ("comment", models.TextField(blank=True, null=True)),
                (
                    "round",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="destruction",
                        to="polio.round",
                    ),
                ),
            ],
        ),
    ]
