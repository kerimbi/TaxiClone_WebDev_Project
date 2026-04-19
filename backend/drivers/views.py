from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from math import radians, sin, cos, sqrt, asin
from .models import DriverProfile
from .serializers import DriverProfileSerializer, DriverLocationUpdateSerializer


def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlam = radians(lng2 - lng1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlam/2)**2
    return 2 * R * asin(sqrt(a))


class DriverProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = DriverProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = DriverProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_location(request):
    serializer = DriverLocationUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    profile, _ = DriverProfile.objects.get_or_create(user=request.user)
    profile.latitude  = data["latitude"]
    profile.longitude = data["longitude"]
    if "status" in data:
        profile.status = data["status"]
    profile.save()
    return Response({"detail": "Location updated."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def nearby_drivers(request):
    try:
        lat    = float(request.query_params["lat"])
        lng    = float(request.query_params["lng"])
        radius = float(request.query_params.get("radius", 5))
    except (KeyError, ValueError):
        return Response({"detail": "lat and lng required."}, status=400)

    drivers = DriverProfile.objects.filter(
        status=DriverProfile.Status.AVAILABLE,
        latitude__isnull=False,
        longitude__isnull=False
    )
    nearby = []
    for d in drivers:
        dist = haversine(lat, lng, d.latitude, d.longitude)
        if dist <= radius:
            nearby.append(d)

    return Response(DriverProfileSerializer(nearby, many=True).data)