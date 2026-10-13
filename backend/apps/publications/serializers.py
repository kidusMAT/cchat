from rest_framework import serializers
from .models import Topic, PublicExcerpt, MessageReaction, SavedExcerpt
from apps.conversations.models import Message
from apps.accounts.models import UserProfile

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'tag', 'name', 'chats_count']


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

    class Meta:
        model = PublicExcerpt
        fields = ['id', 'title', 'topic', 'reads_count', 'authors_summary', 'is_saved', 'messages', 'created_at']

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
