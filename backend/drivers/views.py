from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from .models import DriverProfile
from .serializers import DriverProfileSerializer, DriverLocationUpdateSerializer


class DriverProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = DriverProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = DriverProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_location(request):
    """Driver reports their live GPS coordinates."""
    serializer = DriverLocationUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    profile, _ = DriverProfile.objects.get_or_create(user=request.user)
    profile.location = Point(data["longitude"], data["latitude"], srid=4326)
    if "status" in data:
        profile.status = data["status"]
    profile.save(update_fields=["location", "status", "updated_at"])
    return Response({"detail": "Location updated."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def nearby_drivers(request):
    """
    PostGIS spatial query: find available drivers within radius_km of a point.
    Query params: lat, lng, radius (km, default 5)
    """
    try:
        lat    = float(request.query_params["lat"])
        lng    = float(request.query_params["lng"])
        radius = float(request.query_params.get("radius", 5))
    except (KeyError, ValueError):
        return Response({"detail": "lat and lng are required."}, status=status.HTTP_400_BAD_REQUEST)

    user_location = Point(lng, lat, srid=4326)

    drivers = (
        DriverProfile.objects
        .filter(status=DriverProfile.Status.AVAILABLE, location__isnull=False)
        .filter(location__distance_lte=(user_location, D(km=radius)))
        .annotate(distance=Distance("location", user_location))
        .order_by("distance")[:20]
    )

    serializer = DriverProfileSerializer(drivers, many=True)
    return Response(serializer.data)
