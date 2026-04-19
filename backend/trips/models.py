from django.db import models
from users.models import CustomUser
from drivers.models import DriverProfile


class TripManager(models.Manager):
    def for_user(self, user):
        if hasattr(user, 'driver_profile'):
            return self.filter(driver=user.driver_profile)
        return self.filter(rider=user)

    def active(self):
        return self.filter(status__in=['requested', 'accepted', 'in_transit'])

    def completed(self):
        return self.filter(status='completed')


class Trip(models.Model):
    objects = TripManager()

    class Status(models.TextChoices):
        REQUESTED  = "requested",  "Requested"
        ACCEPTED   = "accepted",   "Accepted"
        IN_TRANSIT = "in_transit", "In Transit"
        COMPLETED  = "completed",  "Completed"
        CANCELLED  = "cancelled",  "Cancelled"

    rider           = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="trips_as_rider")
    driver          = models.ForeignKey(DriverProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="trips")
    status          = models.CharField(max_length=12, choices=Status.choices, default=Status.REQUESTED)
    pickup_lat      = models.FloatField(default=0)
    pickup_lng      = models.FloatField(default=0)
    dropoff_lat     = models.FloatField(default=0)
    dropoff_lng     = models.FloatField(default=0)
    pickup_address  = models.CharField(max_length=255)
    dropoff_address = models.CharField(max_length=255)
    fare_estimate   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fare_final      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    distance_km     = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    stripe_payment_intent = models.CharField(max_length=100, blank=True)
    rider_rating    = models.PositiveSmallIntegerField(null=True, blank=True)
    driver_rating   = models.PositiveSmallIntegerField(null=True, blank=True)
    requested_at    = models.DateTimeField(auto_now_add=True)
    accepted_at     = models.DateTimeField(null=True, blank=True)
    completed_at    = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-requested_at"]

    def __str__(self):
        return f"Trip #{self.pk} [{self.status}]"


class TripMessage(models.Model):
    trip    = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="messages")
    sender  = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)