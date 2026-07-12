# users/permissions.py
from rest_framework.permissions import BasePermission

class IsAgent(BasePermission):
    """
    Allows access only to users with the 'agent' role.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'agent'