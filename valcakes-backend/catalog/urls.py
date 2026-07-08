# catalog/urls.py
from django.urls import path
from .views import CategoryListView, CakeListView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('cakes/', CakeListView.as_view(), name='cake-list'),
]