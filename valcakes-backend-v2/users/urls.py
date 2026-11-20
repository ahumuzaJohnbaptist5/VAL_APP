from django.urls import path
from .views import (
    ApproveAdminView,
    LoginView,
    PendingAdminsView,
    RegisterView,
    RejectAdminView,
    StaffUserDetailView,
    StaffUsersView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('pending-admins/', PendingAdminsView.as_view(), name='pending-admins'),
    path('staff/', StaffUsersView.as_view(), name='staff-users'),
    path('admins/<int:user_id>/approve/', ApproveAdminView.as_view(), name='approve-admin'),
    path('admins/<int:user_id>/reject/', RejectAdminView.as_view(), name='reject-admin'),
    path('admins/<int:user_id>/', StaffUserDetailView.as_view(), name='staff-user-detail'),
]
