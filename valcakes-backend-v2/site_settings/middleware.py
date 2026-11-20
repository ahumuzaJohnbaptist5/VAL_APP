from django.db import OperationalError, ProgrammingError
from django.http import JsonResponse

from core.permissions import is_admin_user


class MaintenanceModeMiddleware:
    """Block customer write requests while maintenance mode is enabled.

    Reads and the Django admin stay available so staff can log in and turn
    maintenance mode back off from the dashboard.
    """

    SAFE_METHODS = {'GET', 'HEAD', 'OPTIONS'}
    ALLOWED_PATHS = ('/api/users/login/',)

    def __init__(self, get_response):
        self.get_response = get_response

    def _request_user(self, request):
        """Resolve the user for both session and JWT-authenticated requests.

        DRF authenticates JWTs after middleware runs, so a JWT needs to be
        checked here to let staff keep working while maintenance mode is on.
        """
        user = getattr(request, 'user', None)
        if user is not None and user.is_authenticated:
            return user

        try:
            from rest_framework_simplejwt.authentication import JWTAuthentication

            authenticated = JWTAuthentication().authenticate(request)
        except Exception:
            return None
        return authenticated[0] if authenticated else None

    def __call__(self, request):
        if (
            request.method not in self.SAFE_METHODS
            and request.path.startswith('/api/')
            and not request.path.startswith(self.ALLOWED_PATHS)
            and not is_admin_user(self._request_user(request))
        ):
            try:
                from .models import FeatureSettings

                maintenance_mode = FeatureSettings.load().maintenance_mode
            except (OperationalError, ProgrammingError):
                # Settings table may not exist yet during a first deploy.
                maintenance_mode = False

            if maintenance_mode:
                return JsonResponse(
                    {
                        'detail': (
                            'The shop is temporarily closed for maintenance. '
                            'Please try again shortly.'
                        )
                    },
                    status=503,
                )

        return self.get_response(request)
