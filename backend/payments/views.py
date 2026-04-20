import uuid
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from trips.models import Trip
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentIntentSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Cash payment — automatically marks trip as paid."""
    serializer = CreatePaymentIntentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    trip_id = serializer.validated_data["trip_id"]

    try:
        trip = Trip.objects.get(pk=trip_id, rider=request.user)
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found."}, status=404)

    if not trip.fare_estimate:
        return Response({"detail": "Fare not yet estimated."}, status=400)

    payment, _ = Payment.objects.update_or_create(
        trip=trip,
        defaults={
            "rider":                    request.user,
            "amount":                   trip.fare_estimate,
            "stripe_payment_intent_id": f"cash_{uuid.uuid4().hex[:16]}",
            "status":                   "succeeded",
        }
    )

    return Response({
        "amount":     trip.fare_estimate,
        "payment_id": payment.pk,
        "status":     "succeeded",
        "method":     "cash",
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_history(request):
    payments = Payment.objects.filter(rider=request.user).select_related("trip")
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)
