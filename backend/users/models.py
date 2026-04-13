from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Extended user model supporting both riders and drivers."""

    class Role(models.TextChoices):
        RIDER  = "rider",  "Rider"
        DRIVER = "driver", "Driver"
        ADMIN  = "admin",  "Admin"

    role         = models.CharField(max_length=10, choices=Role.choices, default=Role.RIDER)
    phone        = models.CharField(max_length=20, blank=True)
    profile_pic  = models.ImageField(upload_to="profiles/", null=True, blank=True)
    rating       = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
