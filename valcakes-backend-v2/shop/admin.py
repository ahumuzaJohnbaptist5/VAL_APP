from django.contrib import admin

from .models import CakeOrder, CakeOrderItem, ShopCategory, ShopItem


class CakeOrderItemInline(admin.TabularInline):
    model = CakeOrderItem
    extra = 0


@admin.register(CakeOrder)
class CakeOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'customer_phone', 'status', 'quoted_price', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'customer_phone', 'customer_email')
    inlines = [CakeOrderItemInline]


admin.site.register(ShopCategory)
admin.site.register(ShopItem)