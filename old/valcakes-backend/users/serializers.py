# users/serializers.py
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
        # Extract role and default to 'customer' if not provided
        role = validated_data.pop('role', 'customer')
        
        # Auto-approve customers. Admins/Agents must be approved by you.
        is_approved = True if role == 'customer' else False
        
        # Create the user
        user = User.objects.create(
            full_name=validated_data['full_name'],
            phone_number=validated_data['phone_number'],
            email=validated_data.get('email', ''),
            role=role,
            is_approved=is_approved
        )
        
        # IMPORTANT: Hash the password!
        user.set_password(validated_data['password'])
        user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        phone_number = data.get('phone_number')
        password = data.get('password')

        if phone_number and password:
            user = authenticate(phone_number=phone_number, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User is deactivated.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Invalid phone number or password.")
        else:
            raise serializers.ValidationError("Must include phone_number and password.")
        
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone_number', 'email', 'role', 'is_approved', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_approved']