from rest_framework import serializers
from .models import Conversation, Message
from apps.accounts.serializers import UserProfileSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    sender_handle = serializers.CharField(source='sender.handle', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar_url', read_only=True)
    is_maya = serializers.SerializerMethodField()
    is_self = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    reply_to_text = serializers.SerializerMethodField()
    reply_to_sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_handle', 'sender_avatar',
            'is_maya', 'is_self', 'is_read', 'text', 'attachment_url', 'attachment_name', 'attachment_type',
            'is_edited', 'quick_reactions', 'reply_to', 'reply_to_text', 'reply_to_sender',
            'is_excerpt_eligible', 'created_at'
        ]

    def get_is_read(self, obj):
        return obj.seen_at is not None

    def get_reply_to_text(self, obj):
        if obj.reply_to:
            return obj.reply_to.text[:100]
        return None

    def get_reply_to_sender(self, obj):
        if obj.reply_to and obj.reply_to.sender:
            return obj.reply_to.sender.display_name
        return None

    def get_is_self(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            try:
                return obj.sender == request.user.profile
            except Exception:
                pass
        return False

    def get_is_maya(self, obj):
        # Backwards compatible alias for frontend rendering of current user's bubbles
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return self.get_is_self(obj)
        return obj.sender.handle == '@mayamaybe'


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserProfileSerializer(many=True, read_only=True)
    preview = serializers.CharField(read_only=True)
    is_published = serializers.SerializerMethodField()
    published_by_me = serializers.SerializerMethodField()
    partner_is_anonymous = serializers.SerializerMethodField()
    participants_summary = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'initials', 'participants', 'participants_summary', 'tag', 'preview', 'is_published', 'published_by_me', 'partner_is_anonymous', 'created_at', 'updated_at']

    def get_is_published(self, obj):
        return obj.excerpts.filter(is_active=True).exists()

    def get_published_by_me(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        excerpt = obj.excerpts.filter(is_active=True).first()
        if not excerpt:
            return False
        try:
            return excerpt.publishers.filter(id=request.user.profile.id).exists()
        except Exception:
            return False

    def get_partner_is_anonymous(self, obj):
        excerpt = obj.excerpts.filter(is_active=True).first()
        if not excerpt:
            return False
        participants = obj.participants.all()
        publishers = excerpt.publishers.all()
        # If any participant is not in publishers, their identity is anonymous
        return len(publishers) < len(participants)

    def get_participants_summary(self, obj):
        names = [p.display_name for p in obj.participants.all()]
        if len(names) <= 2:
            return f"{' & '.join(names)} · just the two of you"
        return f"{', '.join(names[:2])} and {len(names) - 2} more"


class ConversationDetailSerializer(ConversationSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    active_excerpt = serializers.SerializerMethodField()

    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ['messages', 'active_excerpt']

    def get_active_excerpt(self, obj):
        excerpt = obj.excerpts.filter(is_active=True).first()
        if not excerpt:
            return None
        request = self.context.get('request')
        published_by_me = False
        if request and request.user and request.user.is_authenticated:
            try:
                published_by_me = excerpt.publishers.filter(id=request.user.profile.id).exists()
            except Exception:
                pass

        sections_data = []
        for s in excerpt.sections.all():
            sections_data.append({
                'id': s.id,
                'header': s.header,
                'topic_tag': s.topic_tag,
                'order': s.order,
                'message_ids': list(s.messages.values_list('id', flat=True)),
            })

        return {
            'id': excerpt.id,
            'title': excerpt.title,
            'topic': excerpt.topic.tag if excerpt.topic else '#roommatelore',
            'reads_count': excerpt.reads_count,
            'messages_count': excerpt.messages.count(),
            'published_by_me': published_by_me,
            'publishers_count': excerpt.publishers.count(),
            'sections': sections_data,
        }

