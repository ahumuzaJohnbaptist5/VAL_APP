from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import ShopCategory, ShopItem
from .serializers import ShopCategorySerializer, ShopItemSerializer

class ShopCategoryViewSet(viewsets.ModelViewSet):
    queryset = ShopCategory.objects.all()
    serializer_class = ShopCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ShopItemViewSet(viewsets.ModelViewSet):
    queryset = ShopItem.objects.all()
    serializer_class = ShopItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        """Handle file uploads with detailed logging"""
        print("\n" + "="*50)
        print("📥 RECEIVED REQUEST DATA:")
        print(f"Content-Type: {request.content_type}")
        print(f"Data keys: {list(request.data.keys())}")
        
        if 'image' in request.FILES:
            print(f"✅ Image file received: {request.FILES['image'].name}")
            print(f"   Size: {request.FILES['image'].size} bytes")
        else:
            print("⚠️ No image file in request.FILES")
            print(f"   request.FILES: {request.FILES}")
        
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            print("✅ Serializer is valid")
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            print(f"✅ Item created successfully")
            print("="*50 + "\n")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            print("❌ Serializer errors:")
            print(serializer.errors)
            print("="*50 + "\n")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)