# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem
from payments.models import Payment

# ==========================================
# 1. SERIALIZERS FOR CUSTOMER CHECKOUT
# ==========================================

class OrderItemInputSerializer(serializers.Serializer):
    cake_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True)
    payment_method = serializers.CharField(write_only=True)
    sender_phone = serializers.CharField(write_only=True)
    transaction_id = serializers.CharField(write_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)

    class Meta:
        model = Order
        fields = [
            'items', 'delivery_address', 'delivery_date', 'delivery_time_slot', 
            'customer_notes', 'payment_method', 'sender_phone', 'transaction_id', 'total_amount'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        payment_data = {
            'payment_method': validated_data.pop('payment_method'),
            'sender_phone': validated_data.pop('sender_phone'),
            'transaction_id': validated_data.pop('transaction_id'),
            'amount': validated_data.pop('total_amount'),
        }

        # Create the base order
        order = Order.objects.create(**validated_data, status='awaiting_payment')
        
        subtotal = 0
        # Create order items and calculate total
        for item_data in items_data:
            cake_id = item_data['cake_id']
            from catalog.models import Cake
            cake = Cake.objects.get(id=cake_id)
            
            subtotal += float(cake.base_price) * item_data['quantity']
            
            OrderItem.objects.create(
                order=order,
                cake=cake,
                quantity=item_data['quantity'],
                unit_price=cake.base_price
            )

        # Save final totals
        order.subtotal = subtotal
        order.total_amount = subtotal 
        order.save()

        # Create the pending payment record
        Payment.objects.create(order=order, **payment_data)
        return order


# ==========================================
# 2. SERIALIZERS FOR AGENT DASHBOARD
# ==========================================

class OrderItemOutputSerializer(serializers.ModelSerializer):
    # Get the cake name so the agent knows what was ordered
    cake_name = serializers.CharField(source='cake.name', read_only=True, default="Custom Cake")

    class Meta:
        model = OrderItem
        fields = ['id', 'cake', 'cake_name', 'quantity', 'unit_price', 'custom_details']

class PaymentOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'sender_phone', 'transaction_id', 'status', 'submitted_at']

class AgentOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    payments = PaymentOutputSerializer(many=True, read_only=True)
    items = OrderItemOutputSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_phone', 'order_type', 'status', 
            'subtotal', 'delivery_fee', 'total_amount', 'delivery_address', 
            'delivery_date', 'delivery_time_slot', 'customer_notes', 
            'created_at', 'payments', 'items'
        ]