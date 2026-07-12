from django.urls import path
from .views import RegisterView, LoginView, PendingAdminsView, ApproveAdminView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('pending-admins/', PendingAdminsView.as_view(), name='pending-admins'),
    path('admins/<int:user_id>/approve/', ApproveAdminView.as_view(), name='approve-admin'),
]