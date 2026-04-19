from django.urls import path
from .views import create_payment_intent, payment_history, stripe_webhook

urlpatterns = [
    path("create-intent/", create_payment_intent, name="create-payment-intent"),
    path("history/",       payment_history,       name="payment-history"),
    path("webhook/",       stripe_webhook,        name="stripe-webhook"),
]
