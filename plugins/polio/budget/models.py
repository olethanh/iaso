from django.contrib.postgres.fields import ArrayField, CITextField
from django.db import models


class BudgetStep(models.Model):
    campaign = models.ForeignKey("Campaign", on_delete=models.PROTECT, related_name="budget_steps")
    transition_key = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey("auth.User", on_delete=models.PROTECT)
    updated_at = models.DateTimeField(auto_now=True)
    # Keep trace of the Team the user was acting on behalf of in case they get remove from it.
    created_by_team = models.ForeignKey("iaso.Team", on_delete=models.PROTECT)
    # file via Foreign keys
    comment = models.TextField()
    links = ArrayField(CITextField(max_length=255, blank=True), size=100, null=True, blank=True)
    amount = models.DecimalField(blank=True, null=True, decimal_places=2, max_digits=14)
    is_email_sent = models.BooleanField(default=False)

    def __repr__(self):
        return f"{self.campaign}, {self.transition_key}"


class BudgetStepFiles(models.Model):
    step = models.ForeignKey(BudgetStep, on_delete=models.PROTECT, related_name="files")
    file = models.FileField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Budget Step File"
        verbose_name_plural = "Budget Step Files"

    def __repr__(self):
        return f"{self.step}, {self.file.name}"
