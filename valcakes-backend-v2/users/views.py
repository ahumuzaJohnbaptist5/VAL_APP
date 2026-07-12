from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [] # Allow anyone to register

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        if user.role == 'customer':
            tokens = get_tokens_for_user(user)
            return Response({'user': UserSerializer(user).data, 'tokens': tokens}, status=status.HTTP_201_CREATED)
        
        return Response({'message': 'Account created. Pending approval.'}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [] # Allow anyone to login

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, 'tokens': tokens}, status=status.HTTP_200_OK)

class PendingAdminsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        pending = User.objects.filter(role__in=['admin', 'agent'], is_approved=False)
        return Response(UserSerializer(pending, many=True).data)

class ApproveAdminView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, user_id):
        user = User.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        return Response({"message": "Approved!"})