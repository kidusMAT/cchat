from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.throttling import ScopedRateThrottle
from django.utils import timezone
from .models import Conversation, Message
from .serializers import ConversationSerializer, ConversationDetailSerializer, MessageSerializer
from apps.accounts.models import UserProfile
from apps.publications.models import PublicExcerpt, Topic, ExcerptSection

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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user and request.user.is_authenticated:
            try:
                profile = request.user.profile
                instance.messages.filter(seen_at__isnull=True).exclude(sender=profile).update(seen_at=timezone.now())
            except Exception:
                pass
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='mark_read')
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        current_profile = request.user.profile
        updated = conversation.messages.filter(seen_at__isnull=True).exclude(sender=current_profile).update(seen_at=timezone.now())
        return Response({'detail': f'Marked {updated} messages as read', 'unread_count': 0}, status=status.HTTP_200_OK)

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
            clean = str(recipient_handle).strip()
            with_at = clean if clean.startswith('@') else f"@{clean}"
            without_at = clean.lstrip('@')
            recipient = (
                UserProfile.objects.filter(handle__iexact=with_at).first()
                or UserProfile.objects.filter(handle__iexact=without_at).first()
                or UserProfile.objects.filter(user__username__iexact=without_at).first()
            )

        if not recipient:
            return Response(
                {'detail': 'Recipient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if recipient.id == current_profile.id:
            return Response(
                {'detail': 'You cannot start a chat with yourself.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enforce rule: You must follow someone to chat with them
        if not current_profile.following.filter(id=recipient.id).exists():
            return Response(
                {'detail': f"You must follow @{recipient.handle.lstrip('@')} to chat with them."},
                status=status.HTTP_403_FORBIDDEN
            )

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

        # Enforce rule: You must follow people to chat with them
        other_participants = conversation.participants.exclude(id=current_profile.id)
        for other in other_participants:
            if not current_profile.following.filter(id=other.id).exists():
                return Response(
                    {'detail': f"You must follow @{other.handle.lstrip('@')} to chat with them."},
                    status=status.HTTP_403_FORBIDDEN
                )

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

        active_excerpt = conversation.excerpts.filter(is_active=True).first()
        is_eligible = active_excerpt is not None

        message = Message.objects.create(
            conversation=conversation,
            sender=current_profile,
            text=text or f"Shared attachment: {attachment_name or 'file'}",
            attachment_url=attachment_url,
            attachment_name=attachment_name,
            attachment_type=attachment_type,
            reply_to=reply_to,
            is_excerpt_eligible=is_eligible
        )
        if active_excerpt:
            active_excerpt.messages.add(message)
            last_section = active_excerpt.sections.order_by('order').last()
            if last_section:
                last_section.messages.add(message)

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
        topic_tag = request.data.get('topic', '#dating').strip()
        if not topic_tag.startswith('#'):
            topic_tag = f'#{topic_tag}'

        topic, created = Topic.objects.get_or_create(
            tag=topic_tag,
            defaults={'name': topic_tag.replace('#', '').replace('-', ' ').title(), 'chats_count': 1}
        )

        partner = conversation.participants.exclude(id=current_profile.id).first()
        if partner:
            if partner.display_name and partner.display_name.lower() in title.lower():
                if partner.display_name.lower() == title.strip().lower():
                    title = f"{topic_tag} dialogue"
                else:
                    title = title.replace(partner.display_name, 'Anonymous')
            if partner.handle and partner.handle.lower() in title.lower():
                title = title.replace(partner.handle, '@anonymous')

        excerpt, is_new = PublicExcerpt.objects.get_or_create(
            conversation=conversation,
            is_active=True,
            defaults={'title': title, 'topic': topic}
        )
        excerpt.title = title
        excerpt.topic = topic
        excerpt.publishers.add(current_profile)

        # Every message between them is public
        conversation.messages.update(is_excerpt_eligible=True)
        excerpt.messages.set(conversation.messages.all())
        excerpt.save()

        # Handle message sections
        sections_data = request.data.get('sections', [])
        if sections_data and isinstance(sections_data, list):
            excerpt.sections.all().delete()
            all_msgs = list(conversation.messages.all())
            for idx, s_info in enumerate(sections_data):
                sec_header = (s_info.get('header') or f'Part {idx + 1}').strip()
                if partner:
                    if partner.display_name and partner.display_name.lower() in sec_header.lower():
                        if partner.display_name.lower() == sec_header.strip().lower():
                            sec_header = f"Part {idx + 1}"
                        else:
                            sec_header = sec_header.replace(partner.display_name, 'Anonymous')
                    if partner.handle and partner.handle.lower() in sec_header.lower():
                        sec_header = sec_header.replace(partner.handle, '@anonymous')

                sec_tag = (s_info.get('topic_tag') or topic_tag).strip()
                if not sec_tag.startswith('#'):
                    sec_tag = f'#{sec_tag}'
                sec = ExcerptSection.objects.create(
                    excerpt=excerpt,
                    header=sec_header,
                    topic_tag=sec_tag,
                    order=idx
                )
                msg_ids = s_info.get('message_ids', [])
                if msg_ids:
                    sec.messages.set(conversation.messages.filter(id__in=msg_ids))
                elif idx == 0 and len(sections_data) == 1:
                    sec.messages.set(all_msgs)
        elif not excerpt.sections.exists():
            default_header = title if not (partner and partner.display_name.lower() in title.lower()) else f"Part 1"
            sec = ExcerptSection.objects.create(
                excerpt=excerpt,
                header=default_header,
                topic_tag=topic_tag,
                order=0
            )
            sec.messages.set(conversation.messages.all())

        conversation.tag = 'PUBLISHED'
        conversation.save()

        if is_new:
            topic.chats_count += 1
            topic.save(update_fields=['chats_count'])

        sections_list = [
            {
                'id': s.id,
                'header': s.header,
                'topic_tag': s.topic_tag,
                'order': s.order,
                'message_ids': list(s.messages.values_list('id', flat=True))
            }
            for s in excerpt.sections.all()
        ]

        return Response({
            'detail': 'Excerpt published',
            'excerpt_id': excerpt.id,
            'title': excerpt.title,
            'topic': excerpt.topic.tag,
            'published_by_me': True,
            'partner_is_anonymous': excerpt.publishers.count() < conversation.participants.count(),
            'publishers_count': excerpt.publishers.count(),
            'sections': sections_list,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post', 'delete'])
    def remove_publication(self, request, pk=None):
        conversation = self.get_object()
        current_profile = request.user.profile

        if not conversation.participants.filter(id=current_profile.id).exists():
            raise PermissionDenied("You are not a participant in this conversation.")

        unpublish_all = request.data.get('unpublish_all', False)
        excerpts = conversation.excerpts.filter(is_active=True)
        if not excerpts.exists():
            return Response({'detail': 'No active publication found'}, status=status.HTTP_200_OK)

        excerpt = excerpts.first()
        if unpublish_all or excerpt.publishers.count() <= 1 or not excerpt.publishers.filter(id=current_profile.id).exists():
            excerpts.update(is_active=False)
            conversation.tag = 'PRIVATE'
            conversation.save()
            return Response({'detail': 'Publication removed', 'is_published': False}, status=status.HTTP_200_OK)
        else:
            excerpt.publishers.remove(current_profile)
            if excerpt.publishers.count() == 0:
                excerpt.is_active = False
                excerpt.save()
                conversation.tag = 'PRIVATE'
                conversation.save()
                return Response({'detail': 'Publication removed', 'is_published': False}, status=status.HTTP_200_OK)
            return Response({
                'detail': 'Your consent removed. Partner remains published.',
                'is_published': True,
                'published_by_me': False,
            }, status=status.HTTP_200_OK)

