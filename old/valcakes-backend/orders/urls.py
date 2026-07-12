# orders/urls.py
from django.urls import path
from .views import CreateOrderView, AgentOrderListView, VerifyPaymentView

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='create-order'),
    path('agent/list/', AgentOrderListView.as_view(), name='agent-order-list'),
    path('payments/<int:payment_id>/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
]