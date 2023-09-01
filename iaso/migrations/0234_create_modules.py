# Generated by Django 3.2.15 on 2023-09-01 12:30

from django.db import migrations
from iaso.models import Module

MODULES_NAMES = [
    "Data collection - Forms",
    "Default",
    "DHIS2 mapping",
    "Embedded links",
    "Entities",
    "External storage",
    "Planning",
    "Polio project",
    "Registry",
]


def create_modules(apps, schema_editor):
    for module in MODULES_NAMES:
        Module.objects.get_or_create(name=module)


def reverse_create_modules(apps, schema_editor):
    Module.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("iaso", "0233_create_module_permission_for_each_permission"),
    ]

    operations = [
        migrations.RunPython(create_modules, reverse_create_modules),
    ]
