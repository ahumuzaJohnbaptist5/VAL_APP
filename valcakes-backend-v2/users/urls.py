from django.urls import path
from .session import SessionRefreshView, SessionLogoutView
from .password_recovery import PasswordResetRequestView, PasswordResetConfirmView
from .views import (
    ApproveAdminView,
    LoginView,
    ProfileView,
    PendingAdminsView,
    RegisterView,
    RejectAdminView,
    StaffUserDetailView,
    StaffUsersView,
)

urlpatterns = [
    path('me/', ProfileView.as_view(), name='my-profile'),
    path('token/refresh/', SessionRefreshView.as_view(), name='session-refresh'),
    path('logout/', SessionLogoutView.as_view(), name='session-logout'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('pending-admins/', PendingAdminsView.as_view(), name='pending-admins'),
    path('staff/', StaffUsersView.as_view(), name='staff-users'),
    path('admins/<int:user_id>/approve/', ApproveAdminView.as_view(), name='approve-admin'),
    path('admins/<int:user_id>/reject/', RejectAdminView.as_view(), name='reject-admin'),
    path('admins/<int:user_id>/', StaffUserDetailView.as_view(), name='staff-user-detail'),
]
