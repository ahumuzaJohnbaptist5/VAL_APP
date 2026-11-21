from rest_framework import serializers
from django.db import transaction

from .models import CakeOrder, CakeOrderItem, ShopCategory, ShopItem


class ShopCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopCategory
        fields = '__all__'


class ShopItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = ShopItem
        fields = ['id', 'name', 'description', 'price', 'category', 'category_name', 'image', 'in_stock', 'stock_quantity']


class CakeOrderItemSerializer(serializers.ModelSerializer):
    cake = serializers.PrimaryKeyRelatedField(
        queryset=ShopItem.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = CakeOrderItem
        fields = ['id', 'cake', 'cake_name', 'quantity', 'base_price', 'custom_edits']
        read_only_fields = ['id', 'cake_name', 'base_price']

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value


class CakeOrderSerializer(serializers.ModelSerializer):
    items = CakeOrderItemSerializer(many=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_display_name = serializers.SerializerMethodField()

    class Meta:
        model = CakeOrder
        fields = [
            'id',
            'customer',
            'customer_display_name',
            'customer_name',
            'customer_phone',
            'customer_email',
            'delivery_address',
            'payment_method',
            'status',
            'status_display',
            'quoted_price',
            'quote_message',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'customer', 'status', 'quoted_price', 'quote_message', 'created_at', 'updated_at']

    def get_customer_display_name(self, obj):
        if obj.customer_id:
            return obj.customer.full_name
        return obj.customer_name

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('At least one cake/item is required.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['customer'] = request.user
            if not validated_data.get('customer_name'):
                validated_data['customer_name'] = getattr(request.user, 'full_name', '')
            if not validated_data.get('customer_phone'):
                validated_data['customer_phone'] = getattr(request.user, 'phone_number', '')
            if not validated_data.get('customer_email'):
                validated_data['customer_email'] = getattr(request.user, 'email', '') or ''

        order = CakeOrder.objects.create(**validated_data)
        for item_data in items_data:
            cake = item_data.get('cake')
            CakeOrderItem.objects.create(
                order=order,
                cake=cake,
                cake_name=cake.name if cake else item_data.get('cake_name', 'Custom cake'),
                quantity=item_data.get('quantity', 1),
                base_price=cake.price if cake else item_data.get('base_price'),
                custom_edits=item_data.get('custom_edits', ''),
            )
        return order


class CakeOrderQuoteSerializer(serializers.Serializer):
    quoted_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quote_message = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_quoted_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Quoted price must be greater than 0.')
        return value


class CakeOrderStatusSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])