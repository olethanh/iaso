# Generated by Django 3.1.14 on 2022-01-10 09:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("iaso", "0111_auto_20220106_1725"),
    ]

    operations = [
        migrations.RenameField(
            model_name="instance",
            old_name="user",
            new_name="created_by",
        ),
        migrations.AlterField(
            model_name="task",
            name="name",
            field=models.TextField(),
        ),
    ]
