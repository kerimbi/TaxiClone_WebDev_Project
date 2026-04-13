from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display  = ["username", "email", "role", "rating", "is_active"]
    list_filter   = ["role", "is_active"]
    fieldsets     = UserAdmin.fieldsets + (
        ("Taxi App", {"fields": ("role", "phone", "rating", "profile_pic")}),
    )
