# Generated by Django 3.2.13 on 2022-07-07 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("iaso", "0149_merge_20220614_1706"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="home_page",
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]
