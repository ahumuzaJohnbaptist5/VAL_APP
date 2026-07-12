# shop/admin.py
from django.contrib import admin
from .models import ShopCategory, ShopItem

@admin.register(ShopCategory)
class ShopCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(ShopItem)
class ShopItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'in_stock', 'stock_quantity', 'created_at']
    list_filter = ['category', 'in_stock', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['price', 'in_stock', 'stock_quantity']