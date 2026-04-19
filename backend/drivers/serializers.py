from rest_framework import serializers
from .models import DriverProfile
from users.serializers import UserSerializer


class DriverProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = DriverProfile
        fields = ["id", "user", "license_number", "car_model", "car_plate",
                  "car_color", "status", "latitude", "longitude", "total_trips"]


class DriverLocationUpdateSerializer(serializers.Serializer):
    latitude  = serializers.FloatField()
    longitude = serializers.FloatField()
    status    = serializers.ChoiceField(choices=DriverProfile.Status.choices, required=False)