from django.db import models
from users.models import CustomUser


class DriverProfile(models.Model):
    """Extended driver info with real-time PostGIS location."""

    class Status(models.TextChoices):
        OFFLINE   = "offline",   "Offline"
        AVAILABLE = "available", "Available"
        ON_TRIP   = "on_trip",   "On Trip"

    user           = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="driver_profile")
    license_number = models.CharField(max_length=50, unique=True)
    car_model      = models.CharField(max_length=100)
    car_plate      = models.CharField(max_length=20)
    car_color      = models.CharField(max_length=30, default="White")
    status         = models.CharField(max_length=12, choices=Status.choices, default=Status.OFFLINE)
    latitude       = models.FloatField(null=True, blank=True)
    longitude      = models.FloatField(null=True, blank=True)
    total_trips    = models.PositiveIntegerField(default=0)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} — {self.car_model} [{self.status}]"


class DriverDocument(models.Model):
    """Uploaded documents for verification."""
    driver    = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name="documents")
    doc_type  = models.CharField(max_length=50)
    file      = models.FileField(upload_to="driver_docs/")
    verified  = models.BooleanField(default=False)
    uploaded  = models.DateTimeField(auto_now_add=True)
