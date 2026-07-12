# users/views.py
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # If it's a customer, log them in immediately. If admin/agent, just return success.
        if user.role == 'customer':
            tokens = get_tokens_for_user(user)
            return Response({
                'user': {'id': user.id, 'full_name': user.full_name, 'role': user.role},
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Account created. Pending approval for admin/agent role.',
            'user': {'id': user.id, 'full_name': user.full_name, 'role': user.role}
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user'] 

        # THE APPROVAL CHECK
        if user.role in ['admin', 'agent'] and not user.is_approved:
            raise ValidationError("Your account is pending approval. Please contact the developer.")

        # GENERATE TOKENS AND RETURN
        tokens = get_tokens_for_user(user)
        
        return Response({
            'user': {
                'id': user.id, 
                'full_name': user.full_name, 
                'role': user.role,
                'is_approved': user.is_approved
            },
            'tokens': tokens
        }, status=status.HTTP_200_OK)


# --- ADMIN APPROVAL VIEWS (For the Developer Dashboard) ---

class PendingAdminsView(APIView):
    permission_classes = [IsAdminUser] # Only YOU (the developer/superuser) can see this

    def get(self, request):
        # Get all admins/agents who are NOT approved
        pending_users = User.objects.filter(role__in=['admin', 'agent'], is_approved=False)
        serializer = UserSerializer(pending_users, many=True)
        return Response(serializer.data)


class ApproveAdminView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_approved = True
            user.save()
            return Response({"message": f"{user.full_name} has been approved!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class RejectAdminView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete() 
            return Response({"message": "User rejected and removed."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)