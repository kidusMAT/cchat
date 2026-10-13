from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, ConversationDetailSerializer, MessageSerializer
from apps.accounts.models import UserProfile
from apps.publications.models import PublicExcerpt, Topic

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all().prefetch_related('participants', 'messages', 'excerpts')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'detail': 'Text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Default sender is Maya Chen (@mayamaybe) or first participant
        sender = UserProfile.objects.filter(handle='@mayamaybe').first() or conversation.participants.first()

        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            text=text,
            is_excerpt_eligible=False # New messages stay private by default
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        conversation = self.get_object()
        title = request.data.get('title', conversation.title)
        topic_tag = request.data.get('topic', '#roommatelore')

        topic, _ = Topic.objects.get_or_create(tag=topic_tag)
        maya = UserProfile.objects.filter(handle='@mayamaybe').first() or conversation.participants.first()

        # Find or create active excerpt
        excerpt, created = PublicExcerpt.objects.get_or_create(
            conversation=conversation,
            is_active=True,
            defaults={'title': title, 'topic': topic}
        )
        excerpt.title = title
        excerpt.topic = topic
        excerpt.publishers.add(maya)

        # Select first 6 messages if not already attached
        if not excerpt.messages.exists():
            first_msgs = conversation.messages.filter(is_excerpt_eligible=True)[:6]
            excerpt.messages.set(first_msgs)

        excerpt.save()
        conversation.tag = 'PUBLISHED'
        conversation.save()

        return Response({
            'detail': 'Excerpt published',
            'excerpt_id': excerpt.id,
            'title': excerpt.title,
            'topic': excerpt.topic.tag,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post', 'delete'])
    def remove_publication(self, request, pk=None):
        conversation = self.get_object()
        excerpts = conversation.excerpts.filter(is_active=True)
        excerpts.update(is_active=False)
        conversation.tag = 'PRIVATE'
        conversation.save()
        return Response({'detail': 'Publication removed'}, status=status.HTTP_200_OK)
