import logging
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle

from .models import User

logger = logging.getLogger(__name__)
GENERIC_MESSAGE = 'If the details match an active account, a password reset link will be sent.'


class ResetRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    email = serializers.EmailField(max_length=254)


class ResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(max_length=128)
    token = serializers.CharField(max_length=128)
    password = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)


class PasswordResetRequestView(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = ResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            phone_number=serializer.validated_data['phone_number'],
            email__iexact=serializer.validated_data['email'],
            is_active=True, is_approved=True, role='customer',
        ).first()
        if user and user.has_usable_password():
            params = urlencode({
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            link = settings.PASSWORD_RESET_FRONTEND_URL + '#' + params
            try:
                send_mail(
                    'Reset your VAL Cakes password',
                    f'Use this link to reset your password within 30 minutes:\n{link}\n\n'
                    'If you did not request this, ignore this message.',
                    settings.DEFAULT_FROM_EMAIL, [user.email],
                )
            except Exception:
                logger.warning('Password reset email delivery failed.')
        return Response({'detail': GENERIC_MESSAGE})


class PasswordResetConfirmView(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset_confirm'

    @transaction.atomic
    def post(self, request):
        serializer = ResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            pk = int(urlsafe_base64_decode(data['uid']))
            if not 0 < pk < 2**63:
                raise ValueError
            user = User.objects.select_for_update().get(
                pk=pk, is_active=True, is_approved=True, role='customer'
            )
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            user = None
        if not user or not default_token_generator.check_token(user, data['token']):
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(data['password'], user)
        except ValidationError as exc:
            return Response({'password': exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(data['password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Password updated. You can now log in.'})
