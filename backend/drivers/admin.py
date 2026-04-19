from django.contrib import admin
from .models import DriverProfile, DriverDocument

@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display  = ["user", "car_model", "car_plate", "status", "total_trips"]
    list_filter   = ["status"]

admin.site.register(DriverDocument)
