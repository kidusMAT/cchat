from rest_framework import serializers
from .models import Conversation, Message
from apps.accounts.serializers import UserProfileSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    sender_handle = serializers.CharField(source='sender.handle', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar_url', read_only=True)
    is_maya = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'sender_handle', 'sender_avatar', 'is_maya', 'text', 'is_excerpt_eligible', 'created_at']

    def get_is_maya(self, obj):
        return obj.sender.handle == '@mayamaybe'


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserProfileSerializer(many=True, read_only=True)
    preview = serializers.CharField(read_only=True)
    is_published = serializers.SerializerMethodField()
    participants_summary = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'initials', 'participants', 'participants_summary', 'tag', 'preview', 'is_published', 'created_at', 'updated_at']

    def get_is_published(self, obj):
        return obj.excerpts.filter(is_active=True).exists()

    def get_participants_summary(self, obj):
        names = [p.display_name for p in obj.participants.all()]
        return f"{' & '.join(names)} · just the two of you"


class ConversationDetailSerializer(ConversationSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    active_excerpt = serializers.SerializerMethodField()

    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ['messages', 'active_excerpt']

    def get_active_excerpt(self, obj):
        excerpt = obj.excerpts.filter(is_active=True).first()
        if not excerpt:
            return None
        return {
            'id': excerpt.id,
            'title': excerpt.title,
            'topic': excerpt.topic.tag if excerpt.topic else '#roommatelore',
            'reads_count': excerpt.reads_count,
            'messages_count': excerpt.messages.count(),
        }
