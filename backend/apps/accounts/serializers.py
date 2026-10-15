from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'handle', 'display_name', 'avatar_url', 'bio', 'created_at']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False, default='')
    handle = serializers.CharField(max_length=50)
    display_name = serializers.CharField(max_length=100)
    bio = serializers.CharField(required=False, allow_blank=True, default='')
    avatar_url = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_handle(self, value):
        handle = value if value.startswith('@') else f"@{value}"
        if UserProfile.objects.filter(handle__iexact=handle).exists():
            raise serializers.ValidationError("A user with this handle already exists.")
        return handle

    def create(self, validated_data):
        username = validated_data['username']
        password = validated_data['password']
        email = validated_data.get('email', '')
        handle = validated_data['handle']
        display_name = validated_data['display_name']
        bio = validated_data.get('bio', '')
        avatar_url = validated_data.get('avatar_url', '')

        user = User.objects.create_user(username=username, password=password, email=email)
        profile = UserProfile.objects.create(
            user=user,
            handle=handle,
            display_name=display_name,
            bio=bio,
            avatar_url=avatar_url
        )
        return profile


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
