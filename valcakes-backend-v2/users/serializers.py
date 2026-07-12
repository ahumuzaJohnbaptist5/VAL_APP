from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.CharField(required=False, default='customer')

    class Meta:
        model = User
        fields = ['full_name', 'phone_number', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'customer')
        is_approved = True if role == 'customer' else False
        
        user = User.objects.create(
            full_name=validated_data['full_name'],
            phone_number=validated_data['phone_number'],
            email=validated_data.get('email', ''),
            role=role,
            is_approved=is_approved
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(phone_number=data['phone_number'], password=data['password'])
        if user:
            if user.role in ['admin', 'agent'] and not user.is_approved:
                raise serializers.ValidationError("Account pending approval.")
            if not user.is_active:
                raise serializers.ValidationError("User is deactivated.")
            data['user'] = user
        else:
            raise serializers.ValidationError("Invalid credentials.")
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone_number', 'email', 'role', 'is_approved', 'date_joined']