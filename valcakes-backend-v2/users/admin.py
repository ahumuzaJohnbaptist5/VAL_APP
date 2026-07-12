# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    
    # What columns to show in the list view
    list_display = ('full_name', 'phone_number', 'email', 'role', 'is_approved', 'is_active')
    list_filter = ('role', 'is_approved', 'is_active')
    search_fields = ('full_name', 'phone_number', 'email')
    
    # 👇 THIS IS THE MAGIC FIX 👇
    ordering = ('phone_number',) 

    # How the edit form looks
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'email')}),
        ('Permissions', {'fields': ('role', 'is_approved', 'is_active', 'is_staff', 'is_superuser')}),
    )
    
    # How the "Add User" form looks
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'full_name', 'email', 'role', 'password1', 'password2'),
        }),
    )