from rest_framework import serializers
from .models import Trip, TripMessage
from users.serializers import UserSerializer
from drivers.serializers import DriverProfileSerializer


class TripSerializer(serializers.ModelSerializer):
    rider  = UserSerializer(read_only=True)
    driver = DriverProfileSerializer(read_only=True)

    class Meta:
        model  = Trip
        fields = "__all__"
        read_only_fields = ["rider", "driver", "status", "stripe_payment_intent",
                            "fare_final", "accepted_at", "completed_at"]


class CreateTripSerializer(serializers.Serializer):
    pickup_lat      = serializers.FloatField()
    pickup_lng      = serializers.FloatField()
    dropoff_lat     = serializers.FloatField()
    dropoff_lng     = serializers.FloatField()
    pickup_address  = serializers.CharField(max_length=255)
    dropoff_address = serializers.CharField(max_length=255)


class TripMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    class Meta:
        model  = TripMessage
        fields = ["id", "sender", "content", "sent_at"]
