from django.shortcuts import get_object_or_404

# Create your views here.
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from core.permissions import IsAdmin
from site_settings.models import FeatureSettings
from .serializers import (
    LoginSerializer,
    ProfilePictureSerializer,
    RegisterSerializer,
    StaffUserSerializer,
    StaffUserUpdateSerializer,
    UserSerializer,
)
from .models import User


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['session_id'] = refresh['jti']
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class RegisterView(generics.CreateAPIView):
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'
    serializer_class = RegisterSerializer
    permission_classes = [] # Allow anyone to register

    def create(self, request, *args, **kwargs):
        if not FeatureSettings.load().allow_customer_registration:
            return Response(
                {'detail': 'Registration is currently closed. Please try again later.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if user.role == 'customer':
            tokens = get_tokens_for_user(user)
            return Response({'user': UserSerializer(user).data, 'tokens': tokens}, status=status.HTTP_201_CREATED)

        return Response({'message': 'Account created. Pending approval.'}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'
    permission_classes = [] # Allow anyone to login

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, 'tokens': tokens}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        serializer = ProfilePictureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.profile_picture = serializer.validated_data['profile_picture']
        request.user.save(update_fields=['profile_picture'])
        return Response(UserSerializer(request.user, context={'request': request}).data)


class PendingAdminsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        pending = User.objects.filter(role__in=['admin', 'agent'], is_approved=False)
        return Response(UserSerializer(pending, many=True).data)


class ApproveAdminView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id, role__in=['admin', 'agent'])
        user.is_approved = True
        user.is_active = True
        user.save(update_fields=['is_approved', 'is_active'])
        return Response({'message': 'Approved!'})


class RejectAdminView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        pending = get_object_or_404(
            User, id=user_id, role__in=['admin', 'agent'], is_approved=False
        )
        pending.delete()
        return Response({'message': 'Request rejected and the account was removed.'})


class StaffUsersView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        staff = User.objects.filter(role__in=['admin', 'agent']).order_by('is_approved', 'date_joined')
        return Response(StaffUserSerializer(staff, many=True).data)


class StaffUserDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        target = get_object_or_404(User, id=user_id, role__in=['admin', 'agent'])
        serializer = StaffUserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updates = serializer.validated_data

        if target.pk == request.user.pk and updates.get('is_active') is False:
            return Response(
                {'detail': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for field, value in updates.items():
            setattr(target, field, value)
        if updates:
            target.save(update_fields=list(updates.keys()))

        return Response(StaffUserSerializer(target).data)
