from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.throttling import ScopedRateThrottle
from .models import Conversation, Message
from .serializers import ConversationSerializer, ConversationDetailSerializer, MessageSerializer
from apps.accounts.models import UserProfile
from apps.publications.models import PublicExcerpt, Topic

class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_throttles(self):
        if self.action == 'send_message':
            self.throttle_scope = 'messages'
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Conversation.objects.none()
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Conversation.objects.none()
        return Conversation.objects.filter(participants=profile).prefetch_related('participants', 'messages', 'excerpts')

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create']:
            return ConversationDetailSerializer
        return ConversationSerializer

    def create(self, request, *args, **kwargs):
        current_profile = request.user.profile
        recipient_id = request.data.get('recipient_id')
        recipient_handle = request.data.get('recipient_handle')
        title = request.data.get('title', '').strip()
        initial_text = request.data.get('text', '').strip()

        recipient = None
        if recipient_id:
            recipient = UserProfile.objects.filter(id=recipient_id).first()
        elif recipient_handle:
            recipient = UserProfile.objects.filter(handle__iexact=recipient_handle).first()

        if not recipient:
            recipient = UserProfile.objects.exclude(id=current_profile.id).first()

        if not title:
            title = recipient.display_name if recipient else 'New Chat'

        initials = ''.join([part[0].upper() for part in title.split()[:2]]) or 'CC'

        conversation = Conversation.objects.create(
            title=title,
            initials=initials,
            tag='PRIVATE'
        )
        conversation.participants.add(current_profile)
        if recipient and recipient != current_profile:
            conversation.participants.add(recipient)

        if initial_text:
            Message.objects.create(
                conversation=conversation,
                sender=current_profile,
                text=initial_text,
                is_excerpt_eligible=False
            )

        serializer = ConversationDetailSerializer(conversation, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        current_profile = request.user.profile

        if not conversation.participants.filter(id=current_profile.id).exists():
            raise PermissionDenied("You are not a participant in this conversation.")

        text = request.data.get('text', '').strip()
        if not text:
            return Response({'detail': 'Text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        if len(text) > 2000:
            return Response({'detail': 'Message too long (max 2000 chars)'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=current_profile,
            text=text,
            is_excerpt_eligible=False  # New private messages stay private by default
        )
        conversation.save()  # update updated_at timestamp

        return Response(MessageSerializer(message, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        conversation = self.get_object()
        current_profile = request.user.profile

        if not conversation.participants.filter(id=current_profile.id).exists():
            raise PermissionDenied("You are not a participant in this conversation.")

        title = request.data.get('title', conversation.title).strip() or conversation.title
        topic_tag = request.data.get('topic', '#roommatelore').strip()

        topic, _ = Topic.objects.get_or_create(
            tag=topic_tag,
            defaults={'name': topic_tag.replace('#', '').replace('-', ' ').title(), 'chats_count': 1}
        )

        excerpt, _ = PublicExcerpt.objects.get_or_create(
            conversation=conversation,
            is_active=True,
            defaults={'title': title, 'topic': topic}
        )
        excerpt.title = title
        excerpt.topic = topic
        excerpt.publishers.add(current_profile)

        # Select first 6 messages if not already attached
        if not excerpt.messages.exists():
            first_msgs = conversation.messages.filter(is_excerpt_eligible=True)[:6]
            if not first_msgs.exists():
                first_msgs = conversation.messages.all()[:6]
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
        current_profile = request.user.profile

        if not conversation.participants.filter(id=current_profile.id).exists():
            raise PermissionDenied("You are not a participant in this conversation.")

        excerpts = conversation.excerpts.filter(is_active=True)
        excerpts.update(is_active=False)
        conversation.tag = 'PRIVATE'
        conversation.save()
        return Response({'detail': 'Publication removed'}, status=status.HTTP_200_OK)
