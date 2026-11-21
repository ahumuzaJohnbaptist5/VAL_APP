from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

class SessionAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        session_id = validated_token.get('session_id')
        if (not session_id or
                BlacklistedToken.objects.filter(token__jti=session_id).exists()):
            raise AuthenticationFailed('Session revoked. Please log in again.')
        if not user.is_superuser and not user.is_approved:
            raise AuthenticationFailed('Account is not approved.')
        return user


