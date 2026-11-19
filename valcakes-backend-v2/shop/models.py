from django.conf import settings
from django.db import models


class ShopCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class ShopItem(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(ShopCategory, on_delete=models.SET_NULL, null=True, related_name='items')
    image = models.ImageField(upload_to='shop_items/', blank=True, null=True)
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class CakeOrder(models.Model):
    STATUS_PENDING_QUOTE = 'pending_quote'
    STATUS_QUOTED = 'quoted'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING_QUOTE, 'Pending Quote'),
        (STATUS_QUOTED, 'Quoted'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cake_orders',
    )
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True)
    delivery_address = models.CharField(max_length=500, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING_QUOTE)
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quote_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.pk} - {self.customer_name}"


class CakeOrderItem(models.Model):
    order = models.ForeignKey(CakeOrder, on_delete=models.CASCADE, related_name='items')
    cake = models.ForeignKey(ShopItem, on_delete=models.SET_NULL, null=True, blank=True)
    cake_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    custom_edits = models.TextField(blank=True)

    def __str__(self):
        return f"{self.quantity} x {self.cake_name}"