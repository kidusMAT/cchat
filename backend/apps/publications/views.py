from rest_framework import viewsets, views, status, permissions
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from .models import Topic, PublicExcerpt, MessageReaction, SavedExcerpt
from .serializers import TopicSerializer, PublicExcerptSerializer, SavedExcerptSerializer
from apps.accounts.models import UserProfile
from apps.conversations.models import Message

class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.all().order_by('-chats_count')
    serializer_class = TopicSerializer
    permission_classes = [permissions.AllowAny]


class PublicExcerptViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PublicExcerpt.objects.filter(is_active=True).prefetch_related('publishers', 'messages', 'topic', 'conversation')
    serializer_class = PublicExcerptSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            try:
                context['current_user_profile'] = user.profile
            except UserProfile.DoesNotExist:
                context['current_user_profile'] = None
        else:
            context['current_user_profile'] = None
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        tab = self.request.query_params.get('tab')
        topic_tag = self.request.query_params.get('topic')

        if topic_tag:
            qs = qs.filter(topic__tag=topic_tag)

        if tab == 'fresh':
            qs = qs.order_by('-created_at')
        elif tab == 'following':
            user = self.request.user
            if user and user.is_authenticated:
                try:
                    following_ids = user.profile.following.values_list('id', flat=True)
                    qs = qs.filter(publishers__id__in=following_ids)
                except UserProfile.DoesNotExist:
                    qs = qs.none()
            else:
                qs = qs.none()

        return qs

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_save(self, request, pk=None):
        excerpt = self.get_object()
        user_profile = request.user.profile
        saved = SavedExcerpt.objects.filter(user=user_profile, excerpt=excerpt).first()
        if saved:
            saved.delete()
            return Response({'saved': False, 'detail': 'Excerpt removed from saved'}, status=status.HTTP_200_OK)
        else:
            SavedExcerpt.objects.create(user=user_profile, excerpt=excerpt)
            return Response({'saved': True, 'detail': 'Excerpt saved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def record_read(self, request, pk=None):
        excerpt = self.get_object()
        excerpt.reads_count += 1
        excerpt.save(update_fields=['reads_count'])
        return Response({'reads_count': excerpt.reads_count}, status=status.HTTP_200_OK)


class ReactionThrottle(ScopedRateThrottle):
    scope = 'reactions'


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([ReactionThrottle])
def react_message(request, msg_id):
    reaction_type = request.data.get('type')
    if reaction_type not in ['heart', 'cap', 'skull', 'fire']:
        return Response({'detail': 'Invalid reaction type. Must be heart, cap, skull, or fire.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        msg = Message.objects.select_related('conversation').get(id=msg_id)
    except Message.DoesNotExist:
        return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

    # CRITICAL SECURITY CHECK:
    # Verify that the message actually belongs to an active public excerpt!
    # Private messages cannot be reacted to.
    belongs_to_active_excerpt = PublicExcerpt.objects.filter(
        is_active=True,
        messages=msg
    ).exists()

    if not belongs_to_active_excerpt:
        return Response(
            {'detail': 'Reactions are strictly forbidden on private messages. Message must belong to an active public excerpt.'},
            status=status.HTTP_403_FORBIDDEN
        )

    user_profile = request.user.profile

    existing = MessageReaction.objects.filter(message=msg, user=user_profile, reaction_type=reaction_type).first()
    if existing:
        existing.delete()
        user_reacted = None
    else:
        # User can only have one dominant reaction per message: clear other reactions from this user
        MessageReaction.objects.filter(message=msg, user=user_profile).delete()
        MessageReaction.objects.create(message=msg, user=user_profile, reaction_type=reaction_type)
        user_reacted = reaction_type

    counts = {
        'heart': msg.reactions.filter(reaction_type='heart').count(),
        'cap': msg.reactions.filter(reaction_type='cap').count(),
        'skull': msg.reactions.filter(reaction_type='skull').count(),
        'fire': msg.reactions.filter(reaction_type='fire').count(),
        'user_reacted': user_reacted
    }
    return Response(counts, status=status.HTTP_200_OK)


class SavedExcerptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SavedExcerptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return SavedExcerpt.objects.none()
        try:
            return SavedExcerpt.objects.filter(user=user.profile).select_related('excerpt', 'excerpt__topic')
        except UserProfile.DoesNotExist:
            return SavedExcerpt.objects.none()
