from django.db import models
from users.models import CustomUser
from trips.models import Trip


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING   = "pending",   "Pending"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED    = "failed",    "Failed"
        REFUNDED  = "refunded",  "Refunded"

    trip                = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name="payment")
    rider               = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    amount              = models.DecimalField(max_digits=10, decimal_places=2)
    currency            = models.CharField(max_length=3, default="kzt")
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True)
    stripe_client_secret     = models.CharField(max_length=200, blank=True)
    status              = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment #{self.pk} | Trip #{self.trip_id} | {self.status} | {self.amount} KZT"
