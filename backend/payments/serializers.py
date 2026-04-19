from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = ["id", "trip", "rider", "amount", "currency",
                  "stripe_payment_intent_id", "status", "created_at"]
        read_only_fields = ["id", "rider", "status", "created_at"]


class CreatePaymentIntentSerializer(serializers.Serializer):
    trip_id = serializers.IntegerField()
