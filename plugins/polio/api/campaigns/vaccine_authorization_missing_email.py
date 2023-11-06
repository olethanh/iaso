from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail

from hat import settings
from iaso.models import Team
from plugins.polio.settings import NOPV2_VACCINE_TEAM_NAME


def missing_vaccine_authorization_for_campaign_email_alert(obr_name, org_unit):
    try:
        users = [user for user in Team.objects.get(name=NOPV2_VACCINE_TEAM_NAME).users.all()]
        recipient_list = [user.email for user in users]
        subject = f"Vaccine Authorization missing for campaign OBR Name {obr_name}"
        from_email = (settings.DEFAULT_FROM_EMAIL,)
        message = f"""
        Dear team,

        Please note that the campaign {obr_name} for {org_unit} has been created into the poliooutbreaks platform. 

        Be aware that {org_unit} does not have any nOPV2 authorization recorded into the platform yet.

        To add one, please follow this link: https://www.poliooutbreaks.com/dashboard/polio/vaccinemodule/nopv2authorisation/accountId/1/order/-current_expiration_date/pageSize/20/page/1

        This is an automated message from the poliooutbreaks platform.
            """

        send_mail(subject, message, from_email, recipient_list)
    except ObjectDoesNotExist:
        pass