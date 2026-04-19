from django.urls import path
from .views import DriverProfileView, update_location, nearby_drivers

urlpatterns = [
    path("profile/",         DriverProfileView.as_view(), name="driver-profile"),
    path("location/update/", update_location,             name="driver-location-update"),
    path("nearby/",          nearby_drivers,              name="nearby-drivers"),
]
