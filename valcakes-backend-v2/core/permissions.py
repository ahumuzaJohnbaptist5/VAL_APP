from rest_framework.permissions import BasePermission


def is_admin_user(user):
    """Superusers and approved admins can manage dashboard settings and staff."""
    return bool(
        user
        and user.is_authenticated
        and user.is_active
        and (
            user.is_superuser
            or (
                getattr(user, 'role', None) == 'admin'
                and getattr(user, 'is_approved', False)
            )
        )
    )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)
