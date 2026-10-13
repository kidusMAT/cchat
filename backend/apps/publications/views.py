from rest_framework import viewsets, views, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Topic, PublicExcerpt, MessageReaction, SavedExcerpt
from .serializers import TopicSerializer, PublicExcerptSerializer, SavedExcerptSerializer
from apps.accounts.models import UserProfile
from apps.conversations.models import Message

class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.all().order_by('-chats_count')
    serializer_class = TopicSerializer


class PublicExcerptViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PublicExcerpt.objects.filter(is_active=True).prefetch_related('publishers', 'messages', 'topic')
    serializer_class = PublicExcerptSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['current_user_profile'] = UserProfile.objects.filter(handle='@mayamaybe').first() or UserProfile.objects.first()
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
            user = UserProfile.objects.filter(handle='@mayamaybe').first()
            if user:
                following_ids = user.following.values_list('id', flat=True)
                qs = qs.filter(publishers__id__in=following_ids)

        return qs

    @action(detail=True, methods=['post'])
    def toggle_save(self, request, pk=None):
        excerpt = self.get_object()
        user = UserProfile.objects.filter(handle='@mayamaybe').first() or UserProfile.objects.first()
        saved = SavedExcerpt.objects.filter(user=user, excerpt=excerpt).first()
        if saved:
            saved.delete()
            return Response({'saved': False, 'detail': 'Excerpt removed from saved'}, status=status.HTTP_200_OK)
        else:
            SavedExcerpt.objects.create(user=user, excerpt=excerpt)
            return Response({'saved': True, 'detail': 'Excerpt saved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def record_read(self, request, pk=None):
        excerpt = self.get_object()
        excerpt.reads_count += 1
        excerpt.save()
        return Response({'reads_count': excerpt.reads_count}, status=status.HTTP_200_OK)


@api_view(['POST'])
def react_message(request, msg_id):
    reaction_type = request.data.get('type')
    if reaction_type not in ['heart', 'cap', 'skull', 'fire']:
        return Response({'detail': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        msg = Message.objects.get(id=msg_id)
    except Message.DoesNotExist:
        return Response({'detail': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

    user = UserProfile.objects.filter(handle='@mayamaybe').first() or UserProfile.objects.first()

    existing = MessageReaction.objects.filter(message=msg, user=user, reaction_type=reaction_type).first()
    if existing:
        existing.delete()
        user_reacted = None
    else:
        # User can only have one active reaction on this message: clear others
        MessageReaction.objects.filter(message=msg, user=user).delete()
        MessageReaction.objects.create(message=msg, user=user, reaction_type=reaction_type)
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

    def get_queryset(self):
        user = UserProfile.objects.filter(handle='@mayamaybe').first() or UserProfile.objects.first()
        return SavedExcerpt.objects.filter(user=user)
