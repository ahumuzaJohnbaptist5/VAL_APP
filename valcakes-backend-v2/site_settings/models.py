from django.db import models


class SingletonSettings(models.Model):
    """Base class for settings that should only ever have one database row."""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings


class StoreSettings(SingletonSettings):
    store_name = models.CharField(max_length=150, default='Val Cakes')
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    currency = models.CharField(max_length=10, default='UGX')
    about_text = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'Store settings'


class NotificationSettings(SingletonSettings):
    staff_email = models.EmailField(blank=True, help_text='Leave blank to use the server default.')
    send_new_order_emails = models.BooleanField(default=True)
    send_quote_emails = models.BooleanField(default=True)
    default_quote_message = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'Notification settings'


class FeatureSettings(SingletonSettings):
    cake_orders_enabled = models.BooleanField(default=True)
    quotes_enabled = models.BooleanField(default=True)
    wholesale_shop_enabled = models.BooleanField(default=True)
    allow_customer_registration = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'Feature settings'
