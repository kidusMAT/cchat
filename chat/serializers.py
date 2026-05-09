from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Follow, Conversation, Message, MessageReaction,
    ConversationReaction, ChatVisibility, AnonymousProfile, Post
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model"""
    username = serializers.CharField(source='user.username', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'bio', 'avatar', 'avatar_url', 'rank',
            'followers_count', 'following_count', 'posts_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rank', 'followers_count', 'following_count', 'posts_count', 'created_at', 'updated_at']

    def get_avatar_url(self, obj):
        return obj.get_avatar_url()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class FollowSerializer(serializers.ModelSerializer):
    """Serializer for Follow model"""
    follower_username = serializers.CharField(source='follower.username', read_only=True)
    following_username = serializers.CharField(source='following.username', read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'follower_username', 'following', 'following_username', 'created_at']
        read_only_fields = ['id', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    dominant_reaction = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username', 'text', 'message_type', 'attachment',
            'is_read', 'timestamp', 'likes', 'dislikes', 'caps', 'views',
            'dominant_reaction', 'user_reaction'
        ]
        read_only_fields = ['id', 'sender', 'timestamp', 'likes', 'dislikes', 'caps', 'views']

    def get_user_reaction(self, obj):
        """Get current user's reaction to this message"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                reaction = MessageReaction.objects.get(message=obj, user=request.user)
                return reaction.reaction_type
            except MessageReaction.DoesNotExist:
                return None
        return None


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for Conversation model"""
    last_message = MessageSerializer(source='get_last_message', read_only=True)
    is_public = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    user_reactions = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'last_message', 'is_public', 
            'other_participant', 'likes', 'dislikes', 'caps', 
            'smiles', 'views', 'user_reactions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_public(self, obj):
        """Check if conversation is public for current user or anyone"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_public_for_user(request.user)
        # For anonymous users, return True if any part of it is public
        return ChatVisibility.objects.filter(conversation=obj, is_public=True).exists()

    def get_other_participant(self, obj):
        """Get the other participant's info"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.get_other_participant(request.user)
            if other:
                return UserSerializer(other).data
        return None

    def get_user_reactions(self, obj):
        """Get current user's reactions to this conversation"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reactions = ConversationReaction.objects.filter(conversation=obj, user=request.user)
            return [r.reaction_type for r in reactions]
        return []


class ChatVisibilitySerializer(serializers.ModelSerializer):
    """Serializer for ChatVisibility model"""
    class Meta:
        model = ChatVisibility
        fields = ['id', 'user', 'conversation', 'is_public', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AnonymousProfileSerializer(serializers.ModelSerializer):
    """Serializer for AnonymousProfile model"""
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = AnonymousProfile
        fields = ['id', 'fake_username', 'fake_avatar_seed', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_avatar_url(self, obj):
        return obj.get_avatar_url()


class ChatterProfileSerializer(serializers.Serializer):
    """Serializer for chatter profile display (handles both real and anonymous)"""
    username = serializers.CharField()
    avatar_url = serializers.CharField()
    bio = serializers.CharField(default='')
    rank = serializers.IntegerField(default=0)
    followers_count = serializers.IntegerField(default=0)
    following_count = serializers.IntegerField(default=0)
    posts_count = serializers.IntegerField(default=0)
    is_anonymous = serializers.BooleanField(default=False)
    can_follow = serializers.BooleanField(default=True)


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model"""
    author_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'user', 'author_username', 'title', 'content', 'likes', 'views', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'likes', 'views', 'created_at', 'updated_at']


class MessageReactionSerializer(serializers.ModelSerializer):
    """Serializer for MessageReaction model"""
    class Meta:
        model = MessageReaction
        fields = ['id', 'message', 'user', 'reaction_type', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
