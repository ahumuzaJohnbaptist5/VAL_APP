# payments/models.py
from django.db import models

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('mtn_momo', 'MTN Mobile Money'),
        ('airtel_money', 'Airtel Money'),
        ('cash', 'Cash on Delivery'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('failed', 'Failed/Rejected'),
        ('refunded', 'Refunded'),
    )

    # We use a string 'orders.Order' to prevent circular import errors
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    sender_phone = models.CharField(max_length=20)
    transaction_id = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} - {self.status}"