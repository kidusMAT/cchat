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
        attachment_url = request.data.get('attachment_url', '')
        attachment_name = request.data.get('attachment_name', '')
        attachment_type = request.data.get('attachment_type', '')

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

        if initial_text or attachment_url:
            Message.objects.create(
                conversation=conversation,
                sender=current_profile,
                text=initial_text or f"Shared attachment: {attachment_name or 'file'}",
                attachment_url=attachment_url,
                attachment_name=attachment_name,
                attachment_type=attachment_type,
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
        attachment_url = request.data.get('attachment_url', '')
        attachment_name = request.data.get('attachment_name', '')
        attachment_type = request.data.get('attachment_type', '')

        if not text and not attachment_url:
            return Response({'detail': 'Text or attachment is required'}, status=status.HTTP_400_BAD_REQUEST)

        if len(text) > 2000:
            return Response({'detail': 'Message too long (max 2000 chars)'}, status=status.HTTP_400_BAD_REQUEST)

        reply_to_id = request.data.get('reply_to')
        reply_to = None
        if reply_to_id:
            reply_to = conversation.messages.filter(id=reply_to_id).first()

        message = Message.objects.create(
            conversation=conversation,
            sender=current_profile,
            text=text or f"Shared attachment: {attachment_name or 'file'}",
            attachment_url=attachment_url,
            attachment_name=attachment_name,
            attachment_type=attachment_type,
            reply_to=reply_to,
            is_excerpt_eligible=False  # New private messages stay private by default
        )
        conversation.save()  # update updated_at timestamp

        return Response(MessageSerializer(message, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch', 'put'], url_path='messages/(?P<message_id>[0-9]+)')
    def edit_message(self, request, pk=None, message_id=None):
        conversation = self.get_object()
        current_profile = request.user.profile
        try:
            message = conversation.messages.get(id=message_id)
        except Message.DoesNotExist:
            return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

        if message.sender != current_profile:
            raise PermissionDenied("You can only edit your own messages.")

        new_text = request.data.get('text', '').strip()
        if not new_text and not message.attachment_url:
            return Response({'detail': 'Message text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_text) > 2000:
            return Response({'detail': 'Message too long (max 2000 chars)'}, status=status.HTTP_400_BAD_REQUEST)

        message.text = new_text
        message.is_edited = True
        message.save()
        conversation.save()
        return Response(MessageSerializer(message, context=self.get_serializer_context()).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['delete', 'post'], url_path='messages/(?P<message_id>[0-9]+)/delete')
    def delete_message(self, request, pk=None, message_id=None):
        conversation = self.get_object()
        current_profile = request.user.profile
        try:
            message = conversation.messages.get(id=message_id)
        except Message.DoesNotExist:
            return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

        if message.sender != current_profile and not request.user.is_staff:
            raise PermissionDenied("You can only delete your own messages.")

        message_id_int = message.id
        message.delete()
        conversation.save()
        return Response({'detail': 'Message deleted', 'deleted_id': message_id_int}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='messages/(?P<message_id>[0-9]+)/react')
    def react_message(self, request, pk=None, message_id=None):
        conversation = self.get_object()
        current_profile = request.user.profile
        try:
            message = conversation.messages.get(id=message_id)
        except Message.DoesNotExist:
            return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

        emoji = request.data.get('emoji', '').strip()
        if not emoji:
            return Response({'detail': 'Emoji is required'}, status=status.HTTP_400_BAD_REQUEST)

        reactions = message.quick_reactions or {}
        user_handle = current_profile.handle

        user_current_reaction = None
        for em, users in list(reactions.items()):
            if user_handle in users:
                user_current_reaction = em
                users.remove(user_handle)
                if not users:
                    del reactions[em]

        if user_current_reaction != emoji:
            if emoji not in reactions:
                reactions[emoji] = []
            reactions[emoji].append(user_handle)

        message.quick_reactions = reactions
        message.save(update_fields=['quick_reactions'])
        return Response(MessageSerializer(message, context=self.get_serializer_context()).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='messages/(?P<message_id>[0-9]+)/pin')
    def pin_message(self, request, pk=None, message_id=None):
        conversation = self.get_object()
        try:
            message = conversation.messages.get(id=message_id)
        except Message.DoesNotExist:
            return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

        if conversation.pinned_message_id == message.id:
            conversation.pinned_message = None
            is_pinned = False
        else:
            conversation.pinned_message = message
            is_pinned = True
        conversation.save(update_fields=['pinned_message'])
        return Response({
            'detail': 'Pinned updated',
            'is_pinned': is_pinned,
            'pinned_message_id': conversation.pinned_message_id
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        conversation = self.get_object()
        current_profile = request.user.profile

        if not conversation.participants.filter(id=current_profile.id).exists():
            raise PermissionDenied("You are not a participant in this conversation.")

        title = request.data.get('title', conversation.title).strip() or conversation.title
        topic_tag = request.data.get('topic', '#roommatelore').strip()

        topic, created = Topic.objects.get_or_create(
            tag=topic_tag,
            defaults={'name': topic_tag.replace('#', '').replace('-', ' ').title(), 'chats_count': 1}
        )

        excerpt, is_new = PublicExcerpt.objects.get_or_create(
            conversation=conversation,
            is_active=True,
            defaults={'title': title, 'topic': topic}
        )
        excerpt.title = title
        excerpt.topic = topic
        excerpt.publishers.add(current_profile)

        # Attach all eligible messages (no arbitrary cap)
        if not excerpt.messages.exists():
            eligible_msgs = conversation.messages.filter(is_excerpt_eligible=True)
            if not eligible_msgs.exists():
                eligible_msgs = conversation.messages.all()
            excerpt.messages.set(eligible_msgs)

        excerpt.save()
        conversation.tag = 'PUBLISHED'
        conversation.save()

        # Increment topic chat count only on first publication of this conversation
        if is_new:
            topic.chats_count += 1
            topic.save(update_fields=['chats_count'])

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
