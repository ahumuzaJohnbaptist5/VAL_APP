from rest_framework import serializers

from .models import FeatureSettings, NotificationSettings, StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = [
            'store_name',
            'contact_email',
            'contact_phone',
            'address',
            'currency',
            'about_text',
            'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate_store_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Store name is required.')
        return value

    def validate_currency(self, value):
        value = value.strip().upper()
        if not value:
            raise serializers.ValidationError('Currency is required.')
        return value


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'staff_email',
            'send_new_order_emails',
            'send_quote_emails',
            'default_quote_message',
            'updated_at',
        ]
        read_only_fields = ['updated_at']


class FeatureSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureSettings
        fields = [
            'cake_orders_enabled',
            'quotes_enabled',
            'wholesale_shop_enabled',
            'allow_customer_registration',
            'maintenance_mode',
            'updated_at',
        ]
        read_only_fields = ['updated_at']
