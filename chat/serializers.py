from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Follow, Conversation, Message, MessageReaction,
    ConversationReaction, ChatVisibility, AnonymousProfile, Post, MessageComment,
    MessagePoll, PollVote, SponsorshipRequest
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


class MessageCommentSerializer(serializers.ModelSerializer):
    """Serializer for MessageComment model"""
    username = serializers.CharField(source='user.username', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = MessageComment
        fields = ['id', 'user', 'username', 'text', 'created_at', 'parent', 'replies']
        read_only_fields = ['id', 'created_at', 'user']

    def get_replies(self, obj):
        if obj.replies.exists():
            return MessageCommentSerializer(obj.replies.all(), many=True).data
        return []


class MessagePollSerializer(serializers.ModelSerializer):
    """Serializer for MessagePoll model"""
    user_vote = serializers.SerializerMethodField()
    voters_a = serializers.SerializerMethodField()
    voters_b = serializers.SerializerMethodField()

    class Meta:
        model = MessagePoll
        fields = ['id', 'question', 'option_a', 'option_b', 'votes_a', 'votes_b', 'is_system_generated', 'user_vote', 'voters_a', 'voters_b']
        read_only_fields = ['id', 'votes_a', 'votes_b', 'is_system_generated']

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = PollVote.objects.get(poll=obj, user=request.user)
                return vote.selected_option
            except PollVote.DoesNotExist:
                return None
        return None

    def get_voters_a(self, obj):
        return list(obj.votes.filter(selected_option='A').values_list('user__username', flat=True))

    def get_voters_b(self, obj):
        return list(obj.votes.filter(selected_option='B').values_list('user__username', flat=True))


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    comments = serializers.SerializerMethodField()
    dominant_reaction = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()
    poll_data = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username', 'text', 'message_type', 'attachment',
            'is_read', 'timestamp', 'likes', 'dislikes', 'caps', 'smiles', 'views',
            'dominant_reaction', 'user_reaction', 'comments', 'poll_data'
        ]
        read_only_fields = ['id', 'sender', 'timestamp', 'likes', 'dislikes', 'caps', 'smiles', 'views']

    def get_poll_data(self, obj):
        if obj.message_type == 'poll' and hasattr(obj, 'poll_data'):
            return MessagePollSerializer(obj.poll_data, context=self.context).data
        return None

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

    def get_comments(self, obj):
        """Get only top-level comments"""
        top_level_comments = obj.comments.filter(parent__isnull=True)
        return MessageCommentSerializer(top_level_comments, many=True).data


class SponsorshipRequestSerializer(serializers.ModelSerializer):
    """Serializer for SponsorshipRequest model"""
    class Meta:
        model = SponsorshipRequest
        fields = ['id', 'conversation', 'sponsor_name', 'sponsor_text', 'user1', 'user2', 'user1_accepted', 'user2_accepted', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for Conversation model"""
    last_message = MessageSerializer(source='get_last_message', read_only=True)
    is_public = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    user_reactions = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    sponsorships = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'last_message', 'is_public', 
            'other_participant', 'likes', 'dislikes', 'caps', 
            'smiles', 'views', 'user_reactions', 'created_at', 'updated_at',
            'status', 'sponsorships'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_sponsorships(self, obj):
        return SponsorshipRequestSerializer(obj.sponsorships.all(), many=True).data

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
        """Get current user's reactions that were made AFTER the last message"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            last_msg = obj.messages.order_by('-timestamp').first()
            if last_msg:
                # Only return reactions made since the latest message
                reactions = ConversationReaction.objects.filter(
                    conversation=obj, 
                    user=request.user,
                    created_at__gte=last_msg.timestamp
                )
            else:
                reactions = ConversationReaction.objects.filter(conversation=obj, user=request.user)
            return [r.reaction_type for r in reactions]
        return []

    def get_status(self, obj):
        """Return the conversation status relative to other chats"""
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count, Q, Max, Avg
        
        now = timezone.now()
        ten_mins_ago = now - timedelta(minutes=10)
        
        # Velocity of current chat
        current_v = obj.conversation_reactions.filter(created_at__gte=ten_mins_ago).count()
        
        # Get global stats for comparison
        stats = Conversation.objects.annotate(
            velocity=Count('conversation_reactions', filter=Q(conversation_reactions__created_at__gte=ten_mins_ago))
        ).aggregate(max_v=Max('velocity'), avg_v=Avg('velocity'))
        
        max_v = stats['max_v'] or 0
        avg_v = stats['avg_v'] or 0
        
        if current_v > 0:
            if current_v >= max_v and current_v > 5:
                return 'LEGENDARY'
            if current_v >= avg_v * 2:
                return 'ON FIRE'
            if current_v > avg_v:
                return 'HEATING UP'
            return 'ACTIVE'
            
        # Fallback to total if it's a slow but massive thread
        total = (obj.likes or 0) + (obj.dislikes or 0) + (obj.caps or 0) + (obj.smiles or 0)
        if total > 500: return 'LEGENDARY'
        if total > 200: return 'ON FIRE'
        if total > 100: return 'HEATING UP'
        
        return 'CHILLING'


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
