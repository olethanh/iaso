# Generated by Django 2.0 on 2019-01-10 09:05

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("menupermissions", "0006_auto_20181126_1045")]

    operations = [
        migrations.AlterModelOptions(
            name="custompermissionsupport",
            options={
                "managed": False,
                "permissions": (
                    ("x_datasets_datauploads", "Upload of cases files"),
                    ("x_datasets_villageuploads", "Upload of villages files"),
                    ("x_plannings_macroplanning", "Macroplanning"),
                    ("x_plannings_microplanning", "Microplanning"),
                    ("x_plannings_routes", "Routes"),
                    ("x_stats_graphs", "Graphs"),
                    ("x_stats_reports", "Reports"),
                    ("x_case_cases", "Cases"),
                    ("x_case_analysis", "Cases analysis"),
                    ("x_case_reconciliation", "Reconciliation"),
                    ("x_management_devices", "Devices"),
                    ("x_management_plannings", "Plannings"),
                    ("x_management_plannings_template", "Plannings template"),
                    ("x_management_coordinations", "Coordinations"),
                    ("x_management_workzones", "Work zones"),
                    ("x_management_teams", "Teams"),
                    ("x_management_users", "Users"),
                    ("x_management_villages", "Villages"),
                    ("x_locator", "Locator"),
                    ("x_vectorcontrol", "Vector control"),
                    ("x_vectorcontrolupload", "Vector control import Gpx"),
                    ("x_qualitycontrol", "Quality control"),
                    ("x_anonymous", "Anounymous view"),
                ),
            },
        )
    ]
