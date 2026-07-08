# catalog/serializers.py
from rest_framework import serializers
from .models import Category, Cake

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class CakeSerializer(serializers.ModelSerializer):
    # We include the category name so the frontend doesn't have to make a second API call
    category_name = serializers.CharField(source='category.name', read_only=True)
    # This gives the full URL for the image (e.g., http://localhost:8000/media/cakes/choc.jpg)
    image = serializers.ImageField(use_url=True) 

    class Meta:
        model = Cake
        fields = ['id', 'name', 'description', 'base_price', 'image', 'category', 'category_name', 'is_available', 'created_at']