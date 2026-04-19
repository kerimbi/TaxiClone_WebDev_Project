import stripe
import json
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from trips.models import Trip
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentIntentSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Creates a Stripe PaymentIntent for the given trip.
    Returns client_secret so the Angular front-end can confirm the payment.
    """
    serializer = CreatePaymentIntentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    trip_id = serializer.validated_data["trip_id"]

    try:
        trip = Trip.objects.get(pk=trip_id, rider=request.user)
    except Trip.DoesNotExist:
        return Response({"detail": "Trip not found."}, status=404)

    if not trip.fare_estimate:
        return Response({"detail": "Fare not yet estimated."}, status=400)

    # Stripe amounts are in smallest currency unit (tiyn for KZT = same as KZT, no sub-unit)
    amount_tiyn = int(trip.fare_estimate * 100)

    intent = stripe.PaymentIntent.create(
        amount      = amount_tiyn,
        currency    = "kzt",
        description = f"TaxiApp Trip #{trip.pk}",
        metadata    = {"trip_id": trip.pk, "rider_id": request.user.pk},
    )

    payment, _ = Payment.objects.update_or_create(
        trip  = trip,
        defaults={
            "rider":                    request.user,
            "amount":                   trip.fare_estimate,
            "stripe_payment_intent_id": intent["id"],
            "stripe_client_secret":     intent["client_secret"],
        }
    )

    return Response({
        "client_secret": intent["client_secret"],
        "amount":        trip.fare_estimate,
        "payment_id":    payment.pk,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_history(request):
    payments = Payment.objects.filter(rider=request.user).select_related("trip")
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Stripe webhook endpoint — updates payment status on confirmed events.
    In production, verify the Stripe-Signature header.
    """
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return Response({"detail": "Invalid signature."}, status=400)

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        Payment.objects.filter(stripe_payment_intent_id=intent["id"]).update(
            status=Payment.Status.SUCCEEDED
        )

    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        Payment.objects.filter(stripe_payment_intent_id=intent["id"]).update(
            status=Payment.Status.FAILED
        )

    return Response({"received": True})
