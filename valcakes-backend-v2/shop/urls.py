from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CakeOrderViewSet, ShopCategoryViewSet, ShopItemViewSet

router = DefaultRouter()
router.register(r'categories', ShopCategoryViewSet)
router.register(r'items', ShopItemViewSet)
router.register(r'orders', CakeOrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
]