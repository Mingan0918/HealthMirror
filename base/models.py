from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    admin = models.BooleanField(default=False)
    email = models.EmailField(unique=True, null=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female')], blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True)

    def __str__(self):
        return self.username
    
class person(models.Model):
    person = models.CharField(max_length=50, null=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.person
    
class alertImage(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='alertImage/')
    uploaded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class healthStatus(models.Model):
    person = models.ForeignKey(person, on_delete=models.CASCADE, related_name='person_name')
    # 黑眼圈檢測結果
    dark_circles = models.CharField(max_length=20, choices=[
        ('none', 'No Dark Circles'),
        ('mild', 'Mild Dark Circles'),
        ('moderate', 'Moderate Dark Circles'),
        ('severe', 'Severe Dark Circles')
    ], default='none')
    # 唇型檢測結果
    lip_type = models.CharField(max_length=20, choices=[
        ('normal', 'Normal Lips'),
        ('dry', 'Dry Lips'),
        ('chapped', 'Chapped Lips'),
        ('pale', 'Pale Lips')
    ], default='normal')
    # 皮膚檢測結果
    skin_condition = models.CharField(max_length=20, choices=[
        ('healthy', 'Healthy Skin'),
        ('acne', 'Acne'),
        ('dry', 'Dry Skin'),
        ('oily', 'Oily Skin'),
        ('sensitive', 'Sensitive Skin')
    ], default='healthy')
    created = models.DateTimeField(auto_now_add=True)
    image = models.ForeignKey(alertImage, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Dark Circles: {self.dark_circles}, Lip Type: {self.lip_type}, Skin: {self.skin_condition}"

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    hospital = models.CharField(max_length=200)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    ], default='pending')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.hospital} on {self.appointment_date}"

    class Meta:
        ordering = ['-created']
    



