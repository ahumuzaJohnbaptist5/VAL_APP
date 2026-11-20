from django.contrib import admin

from .models import FeatureSettings, NotificationSettings, StoreSettings


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'contact_email', 'currency', 'updated_at')
    readonly_fields = ('updated_at',)


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ('staff_email', 'send_new_order_emails', 'send_quote_emails', 'updated_at')
    readonly_fields = ('updated_at',)


@admin.register(FeatureSettings)
class FeatureSettingsAdmin(admin.ModelAdmin):
    list_display = (
        'cake_orders_enabled',
        'quotes_enabled',
        'wholesale_shop_enabled',
        'allow_customer_registration',
        'maintenance_mode',
        'updated_at',
    )
    readonly_fields = ('updated_at',)
