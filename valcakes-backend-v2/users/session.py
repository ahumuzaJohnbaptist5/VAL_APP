from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from .session_auth import SessionAuthentication


class RefreshInput(serializers.Serializer):
    refresh = serializers.CharField(max_length=4096, trim_whitespace=False)


class SessionRefreshView(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'session_refresh'

    def post(self, request):
        serializer = RefreshInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data['refresh'])
            SessionAuthentication().get_user(token)
        except (TokenError, AuthenticationFailed):
            return Response({'detail': 'Session expired. Please log in again.'}, status=status.HTTP_401_UNAUTHORIZED)
        access = token.access_token
        access['exp'] = min(access['exp'], token['exp'])
        return Response({'access': str(access)})


class SessionLogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RefreshInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data['refresh'])
            token.blacklist()
        except TokenError:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)
