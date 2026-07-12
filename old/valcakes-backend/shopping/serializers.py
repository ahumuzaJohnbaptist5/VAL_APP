# shop/serializers.py
from rest_framework import serializers
from .models import ShopCategory, ShopItem

class ShopCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopCategory
        fields = ['id', 'name', 'description']


class ShopItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = ShopItem
        fields = ['id', 'name', 'description', 'price', 'category', 'category_name', 
                  'image', 'in_stock', 'stock_quantity', 'created_at']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None