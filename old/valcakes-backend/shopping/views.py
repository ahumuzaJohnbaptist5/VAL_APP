# shopping/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated # 👈 Add this import
from .models import ShopCategory, ShopItem
from .serializers import ShopCategorySerializer, ShopItemSerializer

class ShopCategoryViewSet(viewsets.ModelViewSet):
    queryset = ShopCategory.objects.all()
    serializer_class = ShopCategorySerializer
    permission_classes = [IsAuthenticated] # 👈 Add this line to allow logged-in users

class ShopItemViewSet(viewsets.ModelViewSet):
    queryset = ShopItem.objects.all()
    serializer_class = ShopItemSerializer
    permission_classes = [IsAuthenticated] # 👈 Add this here too

    def get_queryset(self):
        queryset = ShopItem.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset