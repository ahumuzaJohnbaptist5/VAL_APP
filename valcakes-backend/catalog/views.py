# catalog/views.py
from rest_framework import generics, permissions
from .models import Category, Cake
from .serializers import CategorySerializer, CakeSerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny] # Anyone can see categories

class CakeListView(generics.ListAPIView):
    serializer_class = CakeSerializer
    permission_classes = [permissions.AllowAny] # Anyone can see cakes

    def get_queryset(self):
        # Only show available cakes
        queryset = Cake.objects.filter(is_available=True).order_by('-created_at')
        
        # Allow filtering by category (e.g., /api/cakes/?category=1)
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        return queryset