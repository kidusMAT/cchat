from django.db.models import Count, F, Case, When, Value, IntegerField, Q
from django.utils import timezone
from datetime import timedelta
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

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q') or self.request.query_params.get('search')
        if q:
            clean_tag = q if q.startswith('#') else f"#{q}"
            qs = qs.filter(Q(tag__icontains=q) | Q(tag__icontains=clean_tag) | Q(name__icontains=q))
        return qs


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
        q = self.request.query_params.get('q') or self.request.query_params.get('search')
        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(topic__tag__icontains=q) |
                Q(topic__name__icontains=q) |
                Q(messages__text__icontains=q) |
                Q(publishers__display_name__icontains=q) |
                Q(publishers__handle__icontains=q)
            ).distinct()
        tab = self.request.query_params.get('tab')
        topic_tag = self.request.query_params.get('topic')
        publisher = self.request.query_params.get('publisher') or self.request.query_params.get('handle')
        if publisher:
            if publisher.startswith('@#') or publisher.startswith('#'):
                topic_tag = publisher.replace('@#', '#')
                publisher = None
            else:
                handle = publisher if publisher.startswith('@') else f"@{publisher}"
                qs = qs.filter(publishers__handle__iexact=handle)
                return qs.order_by('-created_at')

        if topic_tag:
            qs = qs.filter(topic__tag=topic_tag)

        if tab == 'fresh':
            qs = qs.order_by('-created_at')
        elif tab == 'following':
            user = self.request.user
            if user and user.is_authenticated:
                try:
                    following_ids = user.profile.following.values_list('id', flat=True)
                    qs = qs.filter(publishers__id__in=following_ids).distinct()
                except UserProfile.DoesNotExist:
                    qs = qs.none()
            else:
                qs = qs.none()
        else:
            # FYP (For You Page) Discovery:
            # Randomize order across requests so feed is dynamic and never gets stuck in a static order
            sort = self.request.query_params.get('sort')
            if sort == 'ranked':
                now = timezone.now()
                qs = qs.annotate(
                    rx_count=Count('messages__reactions', distinct=True),
                    sv_count=Count('saved_by', distinct=True),
                )
                fresh_boost = Case(
                    When(created_at__gte=now - timedelta(hours=3), then=Value(6000)),
                    When(created_at__gte=now - timedelta(hours=24), then=Value(2500)),
                    When(created_at__gte=now - timedelta(days=3), then=Value(800)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
                qs = qs.annotate(
                    fyp_score=(
                        F('reads_count') +
                        (F('rx_count') * 3) +
                        (F('sv_count') * 8) +
                        fresh_boost
                    )
                ).order_by('-fyp_score', '-created_at').distinct()
            else:
                qs = qs.order_by('?')

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

    if not belongs_to_active_excerpt and msg.conversation:
        active_exc = msg.conversation.excerpts.filter(is_active=True).first()
        if active_exc:
            active_exc.messages.add(msg)
            belongs_to_active_excerpt = True

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
    has_any = any(counts[k] > 0 for k in ['heart', 'cap', 'skull', 'fire'])
    counts['dominant'] = max(['heart', 'cap', 'skull', 'fire'], key=lambda k: counts[k]) if has_any else None
    counts['total'] = sum(counts[k] for k in ['heart', 'cap', 'skull', 'fire'])
    return Response(counts, status=status.HTTP_200_OK)


class SavedExcerptViewSet(viewsets.ModelViewSet):
    serializer_class = SavedExcerptSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        user = self.request.user
        if not user or not user.is_authenticated:
            return SavedExcerpt.objects.none()
        try:
            qs = SavedExcerpt.objects.filter(user=user.profile).select_related(
                'excerpt', 'excerpt__topic', 'excerpt__conversation'
            ).prefetch_related(
                'excerpt__publishers', 'excerpt__messages', 'excerpt__sections'
            )
            collection = self.request.query_params.get('collection')
            if collection and collection != 'All saved':
                qs = qs.filter(collection_name__iexact=collection)
            return qs
        except UserProfile.DoesNotExist:
            return SavedExcerpt.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user.profile)



class UnifiedSearchView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = (request.query_params.get('q') or request.query_params.get('search') or '').strip()
        if not q:
            return Response({'excerpts': [], 'people': [], 'topics': [], 'total': 0})

        # Excerpts matching title, topic tag/name, message text, author
        excerpt_qs = PublicExcerpt.objects.filter(is_active=True).filter(
            Q(title__icontains=q) |
            Q(topic__tag__icontains=q) |
            Q(topic__name__icontains=q) |
            Q(messages__text__icontains=q) |
            Q(publishers__display_name__icontains=q) |
            Q(publishers__handle__icontains=q)
        ).prefetch_related('publishers', 'messages', 'topic', 'conversation').distinct()[:10]

        context = {'request': request}
        if request.user.is_authenticated:
            try:
                context['current_user_profile'] = request.user.profile
            except Exception:
                context['current_user_profile'] = None
        else:
            context['current_user_profile'] = None

        excerpts_data = PublicExcerptSerializer(excerpt_qs, many=True, context=context).data

        # People matching handle, display_name, bio
        from apps.accounts.serializers import UserProfileSerializer
        clean_handle = q if q.startswith('@') else f"@{q}"
        people_qs = UserProfile.objects.filter(
            Q(handle__icontains=q) |
            Q(handle__icontains=clean_handle) |
            Q(display_name__icontains=q) |
            Q(bio__icontains=q)
        ).select_related('user')[:8]
        people_data = UserProfileSerializer(people_qs, many=True, context=context).data

        # Topics matching tag or name
        clean_tag = q if q.startswith('#') else f"#{q}"
        topic_qs = Topic.objects.filter(
            Q(tag__icontains=q) |
            Q(tag__icontains=clean_tag) |
            Q(name__icontains=q)
        ).order_by('-chats_count')[:8]
        topics_data = TopicSerializer(topic_qs, many=True).data

        return Response({
            'excerpts': excerpts_data,
            'people': people_data,
            'topics': topics_data,
            'total': len(excerpts_data) + len(people_data) + len(topics_data)
        })
