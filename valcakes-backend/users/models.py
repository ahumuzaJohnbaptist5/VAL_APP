# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom user model handling both Customers and Agents"""
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('agent', 'Agent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone_number = models.CharField(max_length=20, unique=True)
    business_name = models.CharField(max_length=100, blank=True, null=True)
    momo_receiving_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Retention Hook: Loyalty Points
    loyalty_points = models.IntegerField(default=0) 

    USERNAME_FIELD = 'phone_number' # We will use Phone Number to login
    REQUIRED_FIELDS = ['username', 'email']

    def __str__(self):
        return f"{self.full_name} ({self.role})"