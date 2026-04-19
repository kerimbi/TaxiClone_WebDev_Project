from django.urls import path
from .views import (TripListView, TripDetailView,
                    request_trip, accept_trip, complete_trip, cancel_trip, available_trips)

urlpatterns = [
    path("",                TripListView.as_view(),  name="trip-list"),
    path("<int:pk>/",       TripDetailView.as_view(), name="trip-detail"),
    path("request/",        request_trip,            name="trip-request"),
    path("<int:pk>/accept/",   accept_trip,           name="trip-accept"),
    path("<int:pk>/complete/", complete_trip,         name="trip-complete"),
    path("<int:pk>/cancel/",   cancel_trip,           name="trip-cancel"),
    path("available/", available_trips, name="trip-available"),
]
