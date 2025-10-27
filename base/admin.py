from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
from .models import User, person, healthStatus, alertImage

# admin.site.register(User)
# admin.site.register(EmergencyContact)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'gender', 'phone', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('gender', 'phone', 'admin')}),
    )

@admin.register(person)
class Person(admin.ModelAdmin):
    list_display = ['person']

@admin.register(alertImage)
class AlertImage(admin.ModelAdmin):
    list_display = ['name', 'uploaded']

@admin.register(healthStatus)
class HealthStatusAdmin(admin.ModelAdmin):
    list_display = ['created', 'person', 'dark_circles', 'lip_type', 'skin_condition']
