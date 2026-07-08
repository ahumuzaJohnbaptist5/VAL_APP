# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['full_name', 'phone_number', 'password', 'role']

    def create(self, validated_data):
        # Automatically creates the username from the phone number to satisfy Django
        validated_data['username'] = validated_data['phone_number']
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Authenticate using the custom phone_number field
        user = authenticate(phone_number=data['phone_number'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid phone number or password.")
        
        # Return user and their role so frontend knows which dashboard to show
        return {
            'user': user,
            'role': user.role
        }