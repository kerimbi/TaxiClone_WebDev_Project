from django.contrib import admin
from .models import Trip, TripMessage

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display  = ["id", "rider", "driver", "status", "fare_estimate", "requested_at"]
    list_filter   = ["status"]
    search_fields = ["rider__username", "pickup_address", "dropoff_address"]

admin.site.register(TripMessage)
