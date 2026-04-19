from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["id", "trip", "rider", "amount", "status", "created_at"]
    list_filter  = ["status", "currency"]
