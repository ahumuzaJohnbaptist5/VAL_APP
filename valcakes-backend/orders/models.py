# orders/models.py
from django.db import models
from users.models import User
# ❌ REMOVED: from catalog.models import Cake
import json

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending_review', 'Pending Review'), ('quoted', 'Quoted'), 
        ('awaiting_payment', 'Awaiting Payment'), ('deposit_paid', 'Deposit Paid'),
        ('confirmed', 'Confirmed'), ('in_production', 'In Production'),
        ('decorating', 'Decorating'), ('ready', 'Ready'),
        ('out_for_delivery', 'Out for Delivery'), ('delivered', 'Delivered'),
        ('completed', 'Completed'), ('cancelled', 'Cancelled')
    )
    ORDER_TYPE_CHOICES = (
        ('existing', 'Existing Cake'), ('custom', 'Custom Cake')
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_review')
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    delivery_address = models.TextField()
    delivery_date = models.DateField()
    delivery_time_slot = models.CharField(max_length=50, blank=True)
    customer_notes = models.TextField(blank=True)
    agent_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.full_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
    # ✅ CHANGED THIS LINE: Used a string 'catalog.Cake' instead of the imported Cake class
    cake = models.ForeignKey('catalog.Cake', on_delete=models.SET_NULL, null=True, blank=True)
    
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # Stores custom details like {"size": "8 inch", "flavor": "Vanilla", "message": "Happy Birthday"}
    custom_details = models.JSONField(default=dict, blank=True) 

class CustomCakeRequest(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='custom_request')
    reference_image = models.ImageField(upload_to='custom_requests/', blank=True, null=True)
    description = models.TextField()
    size = models.CharField(max_length=50, blank=True)
    flavor = models.CharField(max_length=50, blank=True)