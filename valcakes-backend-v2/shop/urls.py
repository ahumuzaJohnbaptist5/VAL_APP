from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopCategoryViewSet, ShopItemViewSet

router = DefaultRouter()
router.register(r'categories', ShopCategoryViewSet)
router.register(r'items', ShopItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]