# orders/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Order
from .serializers import OrderCreateSerializer, AgentOrderSerializer
from payments.models import Payment
from users.permissions import IsAgent

class CreateOrderView(generics.CreateAPIView):
    """Allows a logged-in customer to create an order"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(customer=request.user)
        
        return Response({
            "message": "Order created successfully. Awaiting payment verification.",
            "order_id": order.id,
            "status": order.status
        }, status=status.HTTP_201_CREATED)

class AgentOrderListView(generics.ListAPIView):
    """Allows an Agent to see all orders"""
    serializer_class = AgentOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAgent]

    def get_queryset(self):
        # Show all orders, newest first
        return Order.objects.all().order_by('-created_at')

class VerifyPaymentView(APIView):
    """Allows an Agent to verify a pending payment"""
    permission_classes = [permissions.IsAuthenticated, IsAgent]

    def post(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id)
        
        if payment.status == 'verified':
            return Response({"error": "Payment already verified."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update Payment Status
        payment.status = 'verified'
        payment.save()

        # 2. Update Order Status to Confirmed
        order = payment.order
        order.status = 'confirmed'
        order.save()

        return Response({
            "message": "Payment verified successfully. Order confirmed!",
            "order_status": order.status
        }, status=status.HTTP_200_OK)