from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
import math

from .models import Trip
from .serializers import TripSerializer, CreateTripSerializer
from drivers.models import DriverProfile


def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return 2 * R * math.asin(math.sqrt(a))


def calculate_fare(distance_km):
    return round(300 + distance_km * 120, 2)


class TripListView(generics.ListAPIView):
    serializer_class   = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driver_profile'):
            return Trip.objects.filter(driver=user.driver_profile)
        return Trip.objects.filter(rider=user)


class TripDetailView(generics.RetrieveAPIView):
    queryset           = Trip.objects.all()
    serializer_class   = TripSerializer
    permission_classes = [IsAuthenticated]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def available_trips(request):
    trips = Trip.objects.filter(status=Trip.Status.REQUESTED)
    return Response(TripSerializer(trips, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_trip(request):
    serializer = CreateTripSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    d = serializer.validated_data

    distance_km = haversine_km(d["pickup_lat"], d["pickup_lng"], d["dropoff_lat"], d["dropoff_lng"])
    fare = calculate_fare(distance_km)

    trip = Trip.objects.create(
        rider           = request.user,
        pickup_lat      = d["pickup_lat"],
        pickup_lng      = d["pickup_lng"],
        dropoff_lat     = d["dropoff_lat"],
        dropoff_lng     = d["dropoff_lng"],
        pickup_address  = d["pickup_address"],
        dropoff_address = d["dropoff_address"],
        distance_km     = round(distance_km, 2),
        fare_estimate   = fare,
    )
    return Response(TripSerializer(trip).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_trip(request, pk):
    try:
        trip = Trip.objects.get(pk=pk, status=Trip.Status.REQUESTED)
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found or already taken."}, status=404)

    driver_profile = getattr(request.user, "driver_profile", None)
    if not driver_profile:
        return Response({"detail": "Only drivers can accept trips."}, status=403)

    trip.driver      = driver_profile
    trip.status      = Trip.Status.ACCEPTED
    trip.accepted_at = timezone.now()
    trip.save()

    driver_profile.status = DriverProfile.Status.ON_TRIP
    driver_profile.save(update_fields=["status"])

    return Response(TripSerializer(trip).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_trip(request, pk):
    try:
        trip = Trip.objects.get(pk=pk, status__in=[Trip.Status.ACCEPTED, Trip.Status.IN_TRANSIT])
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found."}, status=404)

    trip.status       = Trip.Status.COMPLETED
    trip.completed_at = timezone.now()
    trip.fare_final   = trip.fare_estimate
    trip.save()

    if trip.driver:
        trip.driver.status      = DriverProfile.Status.AVAILABLE
        trip.driver.total_trips += 1
        trip.driver.save(update_fields=["status", "total_trips"])

    from payments.models import Payment
    import uuid
    Payment.objects.get_or_create(
        trip=trip,
        defaults={
            'rider':                    trip.rider,
            'amount':                   trip.fare_estimate,
            'currency':                 'kzt',
            'stripe_payment_intent_id': f'cash_{uuid.uuid4().hex[:16]}',
            'status':                   'succeeded',
        }
    )

    return Response(TripSerializer(trip).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_trip(request, pk):
    try:
        trip = Trip.objects.get(pk=pk)
    except Trip.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)

    if trip.status in [Trip.Status.COMPLETED, Trip.Status.CANCELLED]:
        return Response({"detail": "Cannot cancel."}, status=400)

    trip.status = Trip.Status.CANCELLED
    trip.save()
    return Response(TripSerializer(trip).data)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_trip(request, pk):
    try:
        trip = Trip.objects.get(pk=pk, rider=request.user)
    except Trip.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)
    serializer = TripSerializer(trip, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_trip(request, pk):
    try:
        trip = Trip.objects.get(pk=pk, rider=request.user)
    except Trip.DoesNotExist:
        return Response({"detail": "Not found."}, status=404)
    trip.delete()
    return Response({"detail": "Deleted."}, status=204)