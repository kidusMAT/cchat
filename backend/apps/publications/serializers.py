from rest_framework import serializers
from .models import Topic, PublicExcerpt, MessageReaction, SavedExcerpt, ExcerptSection, PlatformBroadcast
from apps.conversations.models import Message
from apps.accounts.models import UserProfile

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'tag', 'name', 'chats_count']


class ExcerptSectionSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    message_ids = serializers.PrimaryKeyRelatedField(many=True, read_only=True, source='messages')

    class Meta:
        model = ExcerptSection
        fields = ['id', 'header', 'topic_tag', 'order', 'messages', 'message_ids', 'created_at']

    def get_messages(self, obj):
        current_user = self.context.get('current_user_profile')
        serializer = ExcerptMessageSerializer(
            obj.messages.all(),
            many=True,
            context={'excerpt': obj.excerpt, 'current_user_profile': current_user}
        )
        return serializer.data


class ExcerptMessageSerializer(serializers.ModelSerializer):
    sender_display = serializers.SerializerMethodField()
    sender_handle = serializers.SerializerMethodField()
    sender_avatar = serializers.SerializerMethodField()
    is_anonymous = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'text', 'sender_display', 'sender_handle', 'sender_avatar', 'is_anonymous', 'reactions', 'created_at']

    def get_sender_display(self, obj):
        excerpt = self.context.get('excerpt')
        if excerpt and obj.sender not in excerpt.publishers.all():
            return "Anonymous"
        return obj.sender.display_name

    def get_sender_handle(self, obj):
        excerpt = self.context.get('excerpt')
        if excerpt and obj.sender not in excerpt.publishers.all():
            return None
        return obj.sender.handle

    def get_sender_avatar(self, obj):
        excerpt = self.context.get('excerpt')
        if excerpt and obj.sender not in excerpt.publishers.all():
            return None
        return obj.sender.avatar_url

    def get_is_anonymous(self, obj):
        excerpt = self.context.get('excerpt')
        if excerpt and obj.sender not in excerpt.publishers.all():
            return True
        return False

    def get_reactions(self, obj):
        reactions = obj.reactions.all()
        current_user_profile = self.context.get('current_user_profile')

        user_reaction = None
        if current_user_profile:
            ur = reactions.filter(user=current_user_profile).first()
            if ur:
                user_reaction = ur.reaction_type

        counts = {
            'heart': reactions.filter(reaction_type='heart').count(),
            'cap': reactions.filter(reaction_type='cap').count(),
            'skull': reactions.filter(reaction_type='skull').count(),
            'fire': reactions.filter(reaction_type='fire').count(),
        }

        # Leading dominant reaction
        dominant = max(counts, key=counts.get) if any(counts.values()) else 'heart'

        return {
            'heart': counts['heart'],
            'cap': counts['cap'],
            'skull': counts['skull'],
            'fire': counts['fire'],
            'user_reacted': user_reaction,
            'dominant': dominant,
        }


class PublicExcerptSerializer(serializers.ModelSerializer):
    topic = TopicSerializer(read_only=True)
    messages = serializers.SerializerMethodField()
    authors_summary = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    fyp_score = serializers.SerializerMethodField()
    conversation_id = serializers.IntegerField(source='conversation.id', read_only=True)

    class Meta:
        model = PublicExcerpt
        fields = ['id', 'conversation_id', 'title', 'topic', 'reads_count', 'authors_summary', 'is_saved', 'messages', 'sections', 'created_at', 'fyp_score']

    def get_fyp_score(self, obj):
        return getattr(obj, 'fyp_score', None)

    def get_title(self, obj):
        title = obj.title or ''
        publishers = obj.publishers.all()
        participants = obj.conversation.participants.all()
        anonymous_participants = [p for p in participants if p not in publishers]
        if anonymous_participants:
            for anon in anonymous_participants:
                if anon.display_name and anon.display_name.lower() in title.lower():
                    if anon.display_name.lower() == title.strip().lower():
                        topic_tag = obj.topic.tag if obj.topic else '#chat'
                        return f"{topic_tag} dialogue"
                    title = title.replace(anon.display_name, 'Anonymous')
                if anon.handle and anon.handle.lower() in title.lower():
                    title = title.replace(anon.handle, '@anonymous')
        return title or (f"{obj.topic.tag} dialogue" if obj.topic else 'Public Chat')

    def get_sections(self, obj):
        current_user = self.context.get('current_user_profile')
        sections_qs = obj.sections.all()
        if sections_qs.exists():
            data = ExcerptSectionSerializer(
                sections_qs,
                many=True,
                context={'excerpt': obj, 'current_user_profile': current_user}
            ).data

            # Mask anonymous partner personal name from section headers
            publishers = obj.publishers.all()
            participants = obj.conversation.participants.all()
            anonymous_participants = [p for p in participants if p not in publishers]
            if anonymous_participants:
                for sec in data:
                    header = sec.get('header', '')
                    for anon in anonymous_participants:
                        if anon.display_name and anon.display_name.lower() in header.lower():
                            if anon.display_name.lower() == header.strip().lower():
                                sec['header'] = f"Part {sec.get('order', 0) + 1}"
                            else:
                                sec['header'] = header.replace(anon.display_name, 'Anonymous')
                        if anon.handle and anon.handle.lower() in header.lower():
                            sec['header'] = sec['header'].replace(anon.handle, '@anonymous')
            return data
        return []

    def get_messages(self, obj):

        current_user = self.context.get('current_user_profile')
        serializer = ExcerptMessageSerializer(
            obj.messages.all(),
            many=True,
            context={'excerpt': obj, 'current_user_profile': current_user}
        )
        return serializer.data

    def get_authors_summary(self, obj):
        publishers = obj.publishers.all()
        participants = obj.conversation.participants.all()

        if len(publishers) == len(participants):
            names = [p.display_name for p in publishers]
            return " & ".join(names)
        elif len(publishers) == 1:
            publisher = publishers.first()
            return f"{publisher.handle} × Anonymous"
        return "Anonymous"

    def get_is_saved(self, obj):
        current_user = self.context.get('current_user_profile')
        if current_user:
            return obj.saved_by.filter(user=current_user).exists()
        return False


class SavedExcerptSerializer(serializers.ModelSerializer):
    excerpt = PublicExcerptSerializer(read_only=True)

    class Meta:
        model = SavedExcerpt
        fields = ['id', 'excerpt', 'collection_name', 'created_at']


class PlatformBroadcastSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformBroadcast
        fields = [
            'id', 'is_active', 'badge_text', 'message',
            'style_variant', 'action_label', 'action_url', 'updated_at'
        ]

