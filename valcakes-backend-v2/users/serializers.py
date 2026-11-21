from rest_framework import serializers
from uuid import uuid4
from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError
from django.core.files.base import ContentFile
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['customer', 'agent', 'admin'], required=False, default='customer')

    class Meta:
        model = User
        fields = ['full_name', 'phone_number', 'email', 'password', 'role']

    def validate(self, attrs):
        try:
            validate_password(attrs['password'], User(full_name=attrs['full_name'], phone_number=attrs['phone_number'], email=attrs.get('email')))
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages})
        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role', 'customer')
        is_approved = True if role == 'customer' else False
        
        user = User.objects.create_user(password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone_number=validated_data['phone_number'],
            email=validated_data.get('email', ''),
            role=role,
            is_approved=is_approved
        )
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
        fields = ['id', 'full_name', 'phone_number', 'email', 'role', 'is_approved', 'date_joined', 'profile_picture']
        read_only_fields = fields


class ProfilePictureSerializer(serializers.Serializer):
    profile_picture = serializers.ImageField()

    def validate_profile_picture(self, value):
        if value.size > 8 * 1024 * 1024:
            raise serializers.ValidationError('Choose an image no larger than 8 MB.')
        try:
            value.seek(0)
            with Image.open(value) as image:
                if image.format not in ('JPEG', 'PNG', 'WEBP'):
                    raise serializers.ValidationError('Choose a JPG, PNG or WebP image.')
                if image.width * image.height > 25_000_000:
                    raise serializers.ValidationError('Image dimensions exceed 25 megapixels.')
                picture = ImageOps.exif_transpose(image)
                picture.thumbnail((1024, 1024))
                picture = picture.convert('RGB')
                output = BytesIO()
                picture.save(output, format='JPEG', quality=88)
        except (OSError, ValueError, UnidentifiedImageError, Image.DecompressionBombError):
            raise serializers.ValidationError('Unable to read this image.')
        return ContentFile(output.getvalue(), name=f'{uuid4().hex}.jpg')


class StaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'phone_number', 'email', 'role',
            'is_approved', 'is_active', 'date_joined',
        ]


class StaffUserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=[('admin', 'Admin'), ('agent', 'Agent'), ('customer', 'Customer')],
        required=False,
    )
    is_approved = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
