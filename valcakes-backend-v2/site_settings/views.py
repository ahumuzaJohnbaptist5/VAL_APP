from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdmin
from .models import FeatureSettings, NotificationSettings, StoreSettings
from .serializers import (
    FeatureSettingsSerializer,
    NotificationSettingsSerializer,
    StoreSettingsSerializer,
)


def settings_bundle():
    """Return every editable settings section in one payload."""
    return {
        'store': StoreSettingsSerializer(StoreSettings.load()).data,
        'notifications': NotificationSettingsSerializer(NotificationSettings.load()).data,
        'features': FeatureSettingsSerializer(FeatureSettings.load()).data,
    }


class SettingsView(APIView):
    """Admin-only entry point for reading and updating dashboard settings."""

    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(settings_bundle())

    def patch(self, request):
        if not isinstance(request.data, dict):
            return Response(
                {'detail': 'Expected an object containing settings sections.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_sections = {'store', 'notifications', 'features'}
        unknown = set(request.data.keys()) - allowed_sections
        if unknown:
            return Response(
                {'detail': f'Unknown settings section(s): {", ".join(sorted(unknown))}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.data:
            return Response(
                {'detail': 'No settings were provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        section_config = {
            'store': (StoreSettings, StoreSettingsSerializer),
            'notifications': (NotificationSettings, NotificationSettingsSerializer),
            'features': (FeatureSettings, FeatureSettingsSerializer),
        }

        for section, data in request.data.items():
            model, serializer_class = section_config[section]
            if not isinstance(data, dict):
                return Response(
                    {section: ['Expected an object.']},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = serializer_class(model.load(), data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(settings_bundle())


class PublicSettingsView(APIView):
    """Read-only settings the public storefront is allowed to know about."""

    permission_classes = []

    def get(self, request):
        store = StoreSettings.load()
        features = FeatureSettings.load()
        return Response({
            'store': {
                'store_name': store.store_name,
                'contact_email': store.contact_email,
                'contact_phone': store.contact_phone,
                'address': store.address,
                'currency': store.currency,
                'about_text': store.about_text,
            },
            'features': {
                'cake_orders_enabled': features.cake_orders_enabled,
                'quotes_enabled': features.quotes_enabled,
                'wholesale_shop_enabled': features.wholesale_shop_enabled,
                'allow_customer_registration': features.allow_customer_registration,
                'maintenance_mode': features.maintenance_mode,
            },
        })
