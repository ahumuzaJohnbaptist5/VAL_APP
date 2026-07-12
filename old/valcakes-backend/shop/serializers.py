from rest_framework import serializers
from .models import ShopCategory, ShopItem

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
    
    def to_representation(self, instance):
        """Customize the output to include full image URL"""
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        if instance.image and request:
            representation['image'] = request.build_absolute_uri(instance.image.url)
        else:
            representation['image'] = None
            
        return representation