from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.db import IntegrityError
from django.db.models import F
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests
import urllib.request
import urllib.error
import json

from .models import (
    Profile, Follow, Conversation, Message, MessageReaction,
    ConversationReaction, ChatVisibility, AnonymousProfile, Post,
    MessageComment, Report, Block, MessagePoll, PollVote, SponsorshipRequest
)
from .serializers import (
    UserSerializer, ProfileSerializer, RegisterSerializer,
    FollowSerializer, MessageSerializer, ConversationSerializer,
    ChatVisibilitySerializer, AnonymousProfileSerializer,
    ChatterProfileSerializer, PostSerializer, MessageReactionSerializer,
    MessageCommentSerializer
    ,
    SponsorshipRequestSerializer
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def mutually_blocked_user_ids(user):
    if not user or not user.is_authenticated:
        return []
    blocked = Block.objects.filter(blocker=user).values_list('blocked_id', flat=True)
    blockers = Block.objects.filter(blocked=user).values_list('blocker_id', flat=True)
    return set(blocked).union(blockers)


def users_mutually_blocked(first, second):
    return Block.objects.filter(Q(blocker=first, blocked=second) | Q(blocker=second, blocked=first)).exists()


def any_block_between(user, others):
    if not user or not user.is_authenticated:
        return False
    ids = others.values_list('id', flat=True)
    return Block.objects.filter(Q(blocker=user, blocked_id__in=ids) | Q(blocked=user, blocker_id__in=ids)).exists()


def visible_to_user(conversations, user):
    blocked_ids = set()
    for blocker_id, blocked_id in Block.objects.filter(Q(blocker=user) | Q(blocked=user)).values_list('blocker_id', 'blocked_id'):
        blocked_ids.add(blocked_id if blocker_id == user.id else blocker_id)
    return conversations.exclude(participants__id__in=blocked_ids).distinct()


# ==================== Authentication Views ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'profile': ProfileSerializer(user.profile).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user and return JWT tokens"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'profile': ProfileSerializer(user.profile).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """Handle Google One-Tap or regular sign-in"""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify the Access Token
        req = urllib.request.Request('https://www.googleapis.com/oauth2/v3/userinfo')
        req.add_header('Authorization', f'Bearer {token}')
        response = urllib.request.urlopen(req)
        idinfo = json.loads(response.read())
        
        email = idinfo.get('email')
        if not email:
            return Response({'error': 'Email not provided by Google account.'}, status=status.HTTP_400_BAD_REQUEST)
            
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        # Find or create user
        user, created = User.objects.get_or_create(email=email, defaults={
            'username': email.split('@')[0],
            'first_name': first_name,
            'last_name': last_name
        })
        
        # Ensure profile exists (signal should have created it, but safe check)
        if not hasattr(user, 'profile'):
            Profile.objects.create(user=user)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'profile': ProfileSerializer(user.profile).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    except urllib.error.URLError:
        # Invalid access token
        return Response({'error': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user (client should delete tokens)"""
    return Response({'message': 'Logged out successfully'})


# ==================== Profile Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user's profile"""
    serializer = ProfileSerializer(request.user.profile)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update current user's profile"""
    serializer = ProfileSerializer(request.user.profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_account(request):
    user = request.user
    ChatVisibility.objects.filter(user=user, is_public=True).update(is_public=False)
    user.is_active = False
    user.save(update_fields=['is_active'])
    return Response({'message': 'Account deactivated. Your public conversation visibility has been turned off.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request, username):
    """Get a specific user's profile"""
    user = get_object_or_404(User, username=username)
    if request.user.is_authenticated and users_mutually_blocked(request.user, user):
        return Response({'error': 'Profile unavailable'}, status=status.HTTP_404_NOT_FOUND)
    if not user.is_active:
        return Response({'error': 'Profile unavailable'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ProfileSerializer(user.profile)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request, target_type, target_id):
    if target_type == 'conversation':
        target = get_object_or_404(Conversation, id=target_id, is_removed=False)
        kwargs = {'conversation': target}
    else:
        target = get_object_or_404(Message, id=target_id, is_removed=False, conversation__is_removed=False)
        kwargs = {'message': target}
    reason = request.data.get('reason')
    if reason not in dict(Report.REASONS):
        return Response({'reason': 'Invalid report reason'}, status=status.HTTP_400_BAD_REQUEST)
    report = Report.objects.create(reporter=request.user, reason=reason, detail=request.data.get('detail', '')[:4000], **kwargs)
    return Response({'id': report.id, 'status': report.status}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def moderation_reports(request):
    if not request.user.is_staff:
        return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
    reports = Report.objects.filter(status='PENDING').select_related('reporter', 'conversation', 'message').order_by('created_at')
    return Response([{'id': r.id, 'reporter': r.reporter.username, 'target_type': 'message' if r.message_id else 'conversation', 'target_id': r.message_id or r.conversation_id, 'reason': r.reason, 'detail': r.detail, 'created_at': r.created_at} for r in reports])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def moderate_report(request, report_id):
    if not request.user.is_staff:
        return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
    report = get_object_or_404(Report, id=report_id)
    action = request.data.get('action')
    if action not in ('dismiss', 'remove_content', 'suspend_user'):
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
    if action == 'dismiss':
        report.status = 'DISMISSED'
    elif action == 'remove_content':
        if report.message_id:
            report.message.is_removed = True
            report.message.save(update_fields=['is_removed'])
        else:
            report.conversation.is_removed = True
            report.conversation.save(update_fields=['is_removed'])
        report.status = 'ACTIONED'
    else:
        target_user = report.message.sender if report.message_id else report.conversation.participants.exclude(id=report.reporter_id).first()
        if not target_user:
            return Response({'error': 'No account to suspend'}, status=status.HTTP_400_BAD_REQUEST)
        target_user.is_active = False
        target_user.save(update_fields=['is_active'])
        report.status = 'ACTIONED'
    report.reviewed_by = request.user
    report.reviewed_at = timezone.now()
    report.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])
    return Response({'status': report.status})


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_block(request, username):
    blocked = get_object_or_404(User, username=username)
    if blocked == request.user:
        return Response({'error': 'Cannot block yourself'}, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'POST':
        Block.objects.get_or_create(blocker=request.user, blocked=blocked)
        return Response({'blocked': username}, status=status.HTTP_201_CREATED)
    Block.objects.filter(blocker=request.user, blocked=blocked).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_blocks(request):
    return Response(list(Block.objects.filter(blocker=request.user).select_related('blocked').values('blocked__username', 'created_at')))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_on_poll(request, poll_id):
    poll = get_object_or_404(MessagePoll, id=poll_id, message__is_removed=False, message__conversation__is_removed=False)
    if not _can_access_message(request, poll.message):
        return Response({'error': 'Poll unavailable'}, status=status.HTTP_403_FORBIDDEN)
    option = request.data.get('option')
    if option not in ('A', 'B'):
        return Response({'error': 'Option must be A or B'}, status=status.HTTP_400_BAD_REQUEST)
    if PollVote.objects.filter(poll=poll, user=request.user).exists():
        return Response({'error': 'You have already voted'}, status=status.HTTP_409_CONFLICT)
    try:
        PollVote.objects.create(poll=poll, user=request.user, selected_option=option)
    except IntegrityError:
        return Response({'error': 'You have already voted'}, status=status.HTTP_409_CONFLICT)
    field = 'votes_a' if option == 'A' else 'votes_b'
    MessagePoll.objects.filter(id=poll.id).update(**{field: F(field) + 1})
    poll.refresh_from_db()
    return Response({'votes_a': poll.votes_a, 'votes_b': poll.votes_b}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_on_sponsorship(request, conversation_id, sponsorship_id):
    conversation = get_object_or_404(Conversation, id=conversation_id, is_removed=False)
    sponsorship = get_object_or_404(SponsorshipRequest, id=sponsorship_id, conversation=conversation)
    if not conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Participants only'}, status=status.HTTP_403_FORBIDDEN)
    if sponsorship.user1_id == request.user.id:
        sponsorship.user1_accepted = request.data.get('accepted') is True
    elif sponsorship.user2_id == request.user.id:
        sponsorship.user2_accepted = request.data.get('accepted') is True
    else:
        return Response({'error': 'Not a sponsorship participant'}, status=status.HTTP_403_FORBIDDEN)
    sponsorship.save(update_fields=['user1_accepted', 'user2_accepted'])
    return Response({'user1_accepted': sponsorship.user1_accepted, 'user2_accepted': sponsorship.user2_accepted, 'active': sponsorship.user1_accepted and sponsorship.user2_accepted})


# ----------------- Moderation: Sponsorship creation & listing -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sponsorship_request(request):
    if not request.user.is_staff:
        return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
    conv_id = request.data.get('conversation_id')
    sponsor_name = request.data.get('sponsor_name')
    sponsor_text = request.data.get('sponsor_text')
    if not conv_id or not sponsor_name:
        return Response({'error': 'conversation_id and sponsor_name required'}, status=status.HTTP_400_BAD_REQUEST)
    conversation = get_object_or_404(Conversation, id=conv_id, is_removed=False)
    participants = list(conversation.participants.all()[:2])
    if len(participants) != 2:
        return Response({'error': 'Conversation must have exactly 2 participants for sponsorships'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for existing pending sponsorships
    existing = SponsorshipRequest.objects.filter(conversation=conversation).exclude(
        Q(user1_accepted=True, user2_accepted=True) | Q(user1_accepted=False) | Q(user2_accepted=False)
    ).exists()
    if existing:
        return Response({'error': 'A pending sponsorship already exists for this conversation'}, status=status.HTTP_400_BAD_REQUEST)

    sr = SponsorshipRequest.objects.create(
        conversation=conversation,
        sponsor_name=sponsor_name,
        sponsor_text=sponsor_text or '',
        user1=participants[0],
        user2=participants[1]
    )

    # Broadcast via channels to conversation group
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{conversation.id}',
            {
                'type': 'sponsorship_update',
                'sponsorship': SponsorshipRequestSerializer(sr).data,
                'chatId': conversation.id
            }
        )
    except Exception:
        pass

    return Response(SponsorshipRequestSerializer(sr).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sponsorship_requests(request):
    if not request.user.is_staff:
        return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
    conversation_id = request.query_params.get('conversation_id')
    qs = SponsorshipRequest.objects.all().order_by('-created_at')
    if conversation_id:
        qs = qs.filter(conversation_id=conversation_id)
    data = []
    for s in qs:
        d = SponsorshipRequestSerializer(s).data
        d['status'] = s.status
        data.append(d)
    return Response(data)


# ----------------- Verification endpoints -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_verification(request):
    profile = request.user.profile
    if profile.verification_status == 'PENDING' or profile.verification_status == 'VERIFIED':
        return Response({'error': 'Already pending or verified'}, status=status.HTTP_400_BAD_REQUEST)
    profile.verification_text = request.data.get('verification_text', '')[:2000]
    profile.verification_url = request.data.get('verification_url', '')[:1000]
    profile.verification_status = 'PENDING'
    profile.save(update_fields=['verification_text', 'verification_url', 'verification_status'])
    return Response({'status': 'PENDING'}, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def moderation_verification_requests(request):
    if not request.user.is_staff:
        return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
    pending = Profile.objects.filter(verification_status='PENDING').select_related('user')
    data = []
    for p in pending:
        data.append({'profile_id': p.id, 'user_id': p.user_id, 'username': p.user.username, 'verification_text': p.verification_text, 'verification_url': p.verification_url, 'applied_at': p.updated_at})
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_verification_request(request, profile_id):
    if not request.user.is_staff:
        return Response({'error': 'Staff only'}, status=status.HTTP_403_FORBIDDEN)
    profile = get_object_or_404(Profile, id=profile_id)
    if profile.verification_status != 'PENDING':
        return Response({'error': 'Not pending'}, status=status.HTTP_400_BAD_REQUEST)
    action = request.data.get('action')
    if action not in ('approve', 'reject'):
        return Response({'error': "action must be 'approve' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)
    if action == 'approve':
        profile.verification_status = 'VERIFIED'
    else:
        profile.verification_status = 'REJECTED'
    profile.verification_reviewed_by = request.user
    profile.verification_reviewed_at = timezone.now()
    profile.save(update_fields=['verification_status', 'verification_reviewed_by', 'verification_reviewed_at'])
    return Response({'status': profile.verification_status})


# ==================== Follow Views ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    """Follow a user"""
    user_to_follow = get_object_or_404(User, username=username)
    
    if user_to_follow == request.user:
        return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    follow, created = Follow.objects.get_or_create(
        follower=request.user,
        following=user_to_follow
    )
    
    if created:
        # Update counts
        request.user.profile.following_count += 1
        request.user.profile.save()
        user_to_follow.profile.followers_count += 1
        user_to_follow.profile.save()
        return Response({'message': 'Followed successfully'}, status=status.HTTP_201_CREATED)
    
    return Response({'message': 'Already following'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, username):
    """Unfollow a user"""
    user_to_unfollow = get_object_or_404(User, username=username)
    
    try:
        follow = Follow.objects.get(follower=request.user, following=user_to_unfollow)
        follow.delete()
        
        # Update counts
        request.user.profile.following_count = max(0, request.user.profile.following_count - 1)
        request.user.profile.save()
        user_to_unfollow.profile.followers_count = max(0, user_to_unfollow.profile.followers_count - 1)
        user_to_unfollow.profile.save()
        
        return Response({'message': 'Unfollowed successfully'})
    except Follow.DoesNotExist:
        return Response({'error': 'Not following this user'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_following(request, username):
    """Check if current user is following another user"""
    user_to_check = get_object_or_404(User, username=username)
    is_following = Follow.objects.filter(follower=request.user, following=user_to_check).exists()
    return Response({'is_following': is_following})


# ==================== Chat Discovery Views ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_recommended_chats(request):
    """
    Multi-stage feed ranking algorithm inspired by TikTok, YouTube, and X.

    STAGE 1 — CANDIDATE RETRIEVAL
        Pull all public conversations as the candidate pool.

    STAGE 2 — SIGNAL COLLECTION
        For each conversation, compute raw engagement signals:
        - Reaction score (weighted sum of likes/caps/smiles vs dislikes)
        - Message velocity (messages in the last hour — recency boost)
        - View count (reach signal)
        - Conversation depth (total messages — quality proxy)
        - Freshness decay (exponential decay over hours since last activity)
        - Social graph boost (viewer follows a participant → personalized lift)
        - Diversity penalty (avoid consecutive same-participant conversations)

    STAGE 3 — SCORING
        Combine signals into a single score using a weighted log-scale formula.
        Apply a Wilson score lower bound for reactions (avoids low-count inflation).

    STAGE 4 — RANKING + INJECTION
        Sort by composite score, inject "breakout" chats (viral newcomers)
        into top positions, and return paginated results.
    """
    import math
    from datetime import timedelta
    from django.utils import timezone

    now = timezone.now()
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))

    # ── STAGE 1: Candidate Retrieval ─────────────────────────────────────────
    public_visibilities = ChatVisibility.objects.filter(is_public=True, conversation__is_removed=False, user__is_active=True)
    conversation_ids = public_visibilities.values_list('conversation_id', flat=True).distinct()

    # Annotate with message count and latest message time for efficiency
    conversations = Conversation.objects.filter(
        id__in=conversation_ids
    ).annotate(
        total_messages=Count('messages', filter=Q(messages__is_removed=False)),
        # Reaction sum
    ).prefetch_related('participants', 'messages')
    if request.user.is_authenticated:
        conversations = visible_to_user(conversations, request.user)

    # ── Social graph: who does the viewer follow? ────────────────────────────
    followed_user_ids = set()
    viewer_seen_ids = set()  # conversations the user has already seen (from session/cookie)

    if request.user.is_authenticated:
        followed_user_ids = set(
            Follow.objects.filter(follower=request.user)
            .values_list('following_id', flat=True)
        )
        # Conversations the user participated in (de-prioritize)
        viewer_seen_ids = set(
            request.user.conversations.values_list('id', flat=True)
        )

    # ── STAGE 2 + 3: Signal collection & Scoring ─────────────────────────────
    def wilson_lower_bound(pos, neg, confidence=1.645):
        """
        Wilson score interval lower bound — avoids inflating scores for
        conversations with very few reactions (same technique Reddit uses).
        """
        n = pos + neg
        if n == 0:
            return 0.0
        z = confidence
        phat = pos / n
        return (phat + z*z/(2*n) - z * math.sqrt((phat*(1-phat)+z*z/(4*n))/n)) / (1+z*z/n)

    def freshness_decay(last_activity, half_life_hours=6):
        """
        Exponential decay: a conversation that was active 6 hours ago scores
        50% of what it would if it was active right now.
        This mimics TikTok's strong recency bias.
        """
        hours_old = max((now - last_activity).total_seconds() / 3600, 0)
        return math.exp(-0.693 * hours_old / half_life_hours)

    def message_velocity(conv, window_minutes=60):
        """
        Messages sent in the last `window_minutes`. High velocity = "heating up".
        Inspired by X's trending algorithm.
        """
        cutoff = now - timedelta(minutes=window_minutes)
        return conv.messages.filter(timestamp__gte=cutoff).count()

    scored = []
    for conv in conversations:
        participants = list(conv.participants.all())
        if len(participants) < 2:
            continue

        # ── Reaction signals ──────────────────────────────────────────────────
        positive = conv.likes + conv.caps + conv.smiles
        negative = conv.dislikes
        total_reactions = positive + negative

        # Wilson lower bound prevents viral inflation from tiny samples
        reaction_score = wilson_lower_bound(positive, negative) if total_reactions > 0 else 0.0

        # ── Engagement depth ─────────────────────────────────────────────────
        # More messages = richer conversation (log to avoid mega-threads dominating)
        depth_score = math.log1p(conv.total_messages) / math.log1p(200)  # normalized 0–1

        # ── View reach ───────────────────────────────────────────────────────
        # Log-scale view count (YouTube-style reach signal)
        view_score = math.log1p(conv.views) / math.log1p(100000)

        # ── Freshness decay ───────────────────────────────────────────────────
        last_activity = conv.updated_at
        decay = freshness_decay(last_activity, half_life_hours=6)

        # ── Velocity (heating up signal) ──────────────────────────────────────
        velocity = message_velocity(conv, window_minutes=60)
        velocity_score = math.log1p(velocity) / math.log1p(50)  # normalized

        # ── Social graph boost ────────────────────────────────────────────────
        # If you follow one of the chatters, this conversation gets a lift
        participant_ids = {p.id for p in participants}
        social_overlap = len(followed_user_ids & participant_ids)
        social_boost = 1.0 + (0.4 * social_overlap)  # up to +40% boost

        # ── Already-seen penalty ──────────────────────────────────────────────
        seen_penalty = 0.3 if conv.id in viewer_seen_ids else 1.0

        # ── COMPOSITE SCORE ───────────────────────────────────────────────────
        # Weights inspired by TikTok (completion/recency), YouTube (depth/views),
        # and X (social graph + reaction quality)
        score = (
            reaction_score  * 0.30 +   # Quality of reactions (Wilson)
            decay           * 0.25 +   # Recency (TikTok-style decay)
            velocity_score  * 0.20 +   # Heating up (X trending signal)
            depth_score     * 0.15 +   # Conversation richness
            view_score      * 0.10     # Reach/popularity
        ) * social_boost * seen_penalty

        # ── Breakout detection ────────────────────────────────────────────────
        # A "breakout" chat is new (<2h) but already has high velocity or reactions
        age_hours = (now - conv.updated_at).total_seconds() / 3600
        is_breakout = age_hours < 2 and (velocity >= 5 or total_reactions >= 10)

        scored.append({
            'conv': conv,
            'score': score,
            'is_breakout': is_breakout,
            'velocity': velocity,
            'participants': participants,
        })

    # ── STAGE 4: Ranking + Breakout Injection ────────────────────────────────
    # Sort by score descending
    scored.sort(key=lambda x: x['score'], reverse=True)

    # Separate breakouts and inject them into top-3 positions
    breakouts = [s for s in scored if s['is_breakout']]
    regulars = [s for s in scored if not s['is_breakout']]

    # Interleave: first breakout at position 0 (if any), rest are regulars
    final_ranked = []
    breakout_injected = 0
    for i, item in enumerate(regulars):
        # Inject one breakout every 5 positions
        if breakouts and breakout_injected < len(breakouts) and i % 5 == 0:
            final_ranked.append(breakouts[breakout_injected])
            breakout_injected += 1
        final_ranked.append(item)

    # Append any remaining breakouts at end
    final_ranked.extend(breakouts[breakout_injected:])

    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    page_items = final_ranked[start:end]

    # ── Build response ────────────────────────────────────────────────────────
    result = []
    for item in page_items:
        conv = item['conv']
        participants = item['participants']

        display_usernames = {}
        chatter_data = []
        try:
            for participant in participants:
                is_p_public = conv.is_public_for_user(participant)
                if is_p_public:
                    profile = participant.profile
                    display_usernames[participant.username] = participant.username
                    chatter_data.append({
                        'id': participant.id,
                        'username': participant.username,
                        'avatar_url': profile.get_avatar_url(),
                        'color': profile.color if hasattr(profile, 'color') and profile.color else ('var(--red-accent)' if not chatter_data else 'var(--yellow-accent)'),
                        'bio': profile.bio,
                        'rank': profile.rank,
                        'followers_count': profile.followers_count,
                        'following_count': profile.following_count,
                        'posts_count': profile.posts_count,
                        'is_anonymous': False,
                        'is_public': True,
                        'can_follow': True
                    })
                else:
                    anonymous = AnonymousProfile.get_or_create_for_user(conv, participant)
                    display_usernames[participant.username] = anonymous.fake_username
                    chatter_data.append({
                        'id': participant.id,
                        'username': anonymous.fake_username,
                        'avatar_url': anonymous.get_avatar_url(),
                        'color': '#eee',
                        'bio': 'User prefers to stay in the shadows.',
                        'rank': 0,
                        'followers_count': 0,
                        'following_count': 0,
                        'posts_count': 0,
                        'is_anonymous': True,
                        'is_public': False,
                        'can_follow': False
                    })

            messages = Message.objects.filter(conversation=conv, is_removed=False).order_by('timestamp')
            serialized_messages = MessageSerializer(messages, many=True, context={'request': request}).data

            for msg in serialized_messages:
                real_sender = msg.get('sender_username')
                if real_sender in display_usernames:
                    msg['sender_username'] = display_usernames[real_sender]

            result.append({
                'conversation_id': conv.id,
                'participants': chatter_data,
                'messages': serialized_messages,
                'likes': conv.likes,
                'dislikes': conv.dislikes,
                'caps': conv.caps,
                'smiles': conv.smiles,
                'views': conv.views,
                'updated_at': conv.updated_at,
                '_feed': {
                    'score': round(item['score'], 4),
                    'velocity': item['velocity'],
                    'is_breakout': item['is_breakout'],
                }
            })
        except Exception as e:
            # Shield the feed from a single corrupted conversation
            print(f"ERROR: Could not serialize conversation {conv.id}: {e}")
            continue

    return Response(result)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_following_chats(request):
    """Get public chats from users you follow"""
    # Get users current user is following
    following_ids = Follow.objects.filter(follower=request.user, following__is_active=True).values_list('following_id', flat=True)
    
    # Get public conversations involving these users
    public_visibilities = ChatVisibility.objects.filter(
        user_id__in=following_ids,
        is_public=True
    )
    conversation_ids = public_visibilities.values_list('conversation_id', flat=True).distinct()
    
    conversations = Conversation.objects.filter(
        id__in=conversation_ids, is_removed=False
    ).order_by('-updated_at')
    conversations = visible_to_user(conversations, request.user)[:20]
    
    result = []
    for conv in conversations:
        participants = list(conv.participants.all())
        if len(participants) != 2:
            continue
            
        display_usernames = {}
        chatter_data = []
        for participant in participants:
            is_public = conv.is_public_for_user(participant)
            
            if is_public:
                profile = participant.profile
                display_usernames[participant.username] = participant.username
                chatter_data.append({
                    'username': participant.username,
                    'avatar_url': profile.get_avatar_url(),
                    'bio': profile.bio,
                    'rank': profile.rank,
                    'followers_count': profile.followers_count,
                    'following_count': profile.following_count,
                    'posts_count': profile.posts_count,
                    'is_anonymous': False,
                    'can_follow': True
                })
            else:
                anonymous = AnonymousProfile.get_or_create_for_user(conv, participant)
                display_usernames[participant.username] = anonymous.fake_username
                chatter_data.append({
                    'username': anonymous.fake_username,
                    'avatar_url': anonymous.get_avatar_url(),
                    'bio': '',
                    'rank': 0,
                    'followers_count': 0,
                    'following_count': 0,
                    'posts_count': 0,
                    'is_anonymous': True,
                    'can_follow': False
                })
        
        messages = Message.objects.filter(conversation=conv, is_removed=False).order_by('timestamp')
        serialized_messages = MessageSerializer(messages, many=True, context={'request': request}).data
        
        for msg in serialized_messages:
            real_sender = msg.get('sender_username')
            if real_sender in display_usernames:
                msg['sender_username'] = display_usernames[real_sender]
        
        result.append({
            'conversation_id': conv.id,
            'chatters': chatter_data,
            'messages': serialized_messages,
            'likes': conv.likes,
            'dislikes': conv.dislikes,
            'caps': conv.caps,
            'smiles': conv.smiles,
            'updated_at': conv.updated_at
        })
    
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search for users by username"""
    query = request.GET.get('q', '')
    if not query:
        return Response([])
    
    users = User.objects.filter(username__icontains=query, is_active=True)
    if request.user.is_authenticated:
        users = users.exclude(id__in=mutually_blocked_user_ids(request.user))
    users = users[:10]
    return Response(UserSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile_conversations(request, username):
    """Return the public conversations owned by a user's visibility settings."""
    profile_user = get_object_or_404(User, username=username, is_active=True)
    conversations = Conversation.objects.filter(
        participants=profile_user,
        visibilities__user=profile_user,
        visibilities__is_public=True,
        is_removed=False,
    ).distinct().order_by('-updated_at')
    if request.user.is_authenticated:
        conversations = visible_to_user(conversations, request.user)

    result = []
    for conversation in conversations:
        other = conversation.participants.exclude(id=profile_user.id).first()
        if not other:
            continue
        other_public = conversation.is_public_for_user(other)
        other_data = UserSerializer(other).data if other_public else {
            'username': 'Anonymous', 'is_anonymous': True, 'is_public': False
        }
        result.append({
            'id': conversation.id,
            'other_participant': other_data,
            'last_message': MessageSerializer(
                conversation.messages.filter(is_removed=False).order_by('-timestamp').first(),
                context={'request': request},
            ).data if conversation.messages.filter(is_removed=False).exists() else None,
            'updated_at': conversation.updated_at,
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_conversations(request):
    """Search message text and public participant names in public rooms."""
    query = request.GET.get('q', '').strip()
    if not query:
        return Response([])

    public_ids = ChatVisibility.objects.filter(
        is_public=True,
        user__is_active=True,
        conversation__is_removed=False,
    ).values('conversation_id')
    conversations = Conversation.objects.filter(
        id__in=public_ids,
        is_removed=False,
    ).filter(
        Q(messages__text__icontains=query, messages__is_removed=False) |
        Q(participants__username__icontains=query)
    ).distinct().order_by('-updated_at')
    if request.user.is_authenticated:
        conversations = visible_to_user(conversations, request.user)

    result = []
    for conversation in conversations[:30]:
        participants = []
        display_usernames = {}
        for participant in conversation.participants.all().order_by('id'):
            if conversation.is_public_for_user(participant):
                display_usernames[participant.username] = participant.username
                participants.append({
                    'id': participant.id, 'username': participant.username,
                    'is_public': True, 'is_anonymous': False,
                })
            else:
                anonymous = AnonymousProfile.get_or_create_for_user(conversation, participant)
                display_usernames[participant.username] = anonymous.fake_username
                participants.append({
                    'id': participant.id, 'username': anonymous.fake_username,
                    'is_public': False, 'is_anonymous': True,
                })
        messages = list(Message.objects.filter(
            conversation=conversation, is_removed=False
        ).order_by('timestamp'))
        serialized_messages = MessageSerializer(messages, many=True, context={'request': request}).data
        for message in serialized_messages:
            if message.get('sender_username') in display_usernames:
                message['sender_username'] = display_usernames[message['sender_username']]
        result.append({
            'conversation_id': conversation.id,
            'participants': participants,
            'messages': serialized_messages[-4:],
            'likes': conversation.likes,
            'dislikes': conversation.dislikes,
            'caps': conversation.caps,
            'smiles': conversation.smiles,
            'views': conversation.views,
            'updated_at': conversation.updated_at,
        })
    return Response(result)


def _can_access_message(request, message):
    """Participants and readers of public conversations may access a message."""
    if message.is_removed or message.conversation.is_removed:
        return False
    if request.user.is_authenticated and any_block_between(request.user, message.conversation.participants.all()):
        return False
    if message.conversation.participants.filter(id=request.user.id).exists():
        return True
    return ChatVisibility.objects.filter(
        conversation=message.conversation, is_public=True
    ).exists()


# ==================== Conversation Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_conversations(request):
    """Get all conversations for current user"""
    conversations = request.user.conversations.all()
    serializer = ConversationSerializer(conversations, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_conversation(request, conversation_id):
    """Get a specific conversation with messages"""
    conversation = get_object_or_404(Conversation, id=conversation_id, is_removed=False)
    
    is_authenticated = request.user.is_authenticated
    is_participant = is_authenticated and conversation.participants.filter(id=request.user.id).exists()
    if is_authenticated and any_block_between(request.user, conversation.participants.all()):
        return Response({'error': 'Conversation unavailable'}, status=status.HTTP_404_NOT_FOUND)
    
    if not is_participant:
        # If any user made it public, anyone can view it
        if not ChatVisibility.objects.filter(conversation=conversation, is_public=True).exists():
            return Response({'error': 'Not a participant or public'}, status=status.HTTP_403_FORBIDDEN)
    
    # Increment view count for the conversation
    conversation.increment_view()
    
    messages = Message.objects.filter(conversation=conversation, is_removed=False).order_by('timestamp')
    serialized_conv = ConversationSerializer(conversation, context={'request': request}).data
    serialized_messages = MessageSerializer(messages, many=True, context={'request': request}).data
    
    # Identify which participants should be anonymous
    display_usernames = {}
    chatter_data = []
    other_chats_data = [] # To store [left_chats, right_chats]

    # Get participants in consistent order: [Creator, Other]
    all_p = conversation.participants.all().order_by('id') # Force deterministic order
    
    for participant in all_p:
        is_p_public = conversation.is_public_for_user(participant)
        
        # --- Fetch other public chats for this participant ---
        participant_other_chats = []
        others = Conversation.objects.filter(
            visibilities__user=participant,
            visibilities__is_public=True,
            is_removed=False
        ).exclude(id=conversation.id).distinct().order_by('-updated_at')
        if request.user.is_authenticated:
            others = visible_to_user(others, request.user)
        others = others[:2]
        
        for oc in others:
            # Find the OTHER person in that conversation
            op = oc.participants.exclude(id=participant.id).first()
            if op:
                is_op_public = oc.is_public_for_user(op)
                if is_op_public:
                    op_name = op.username
                    op_avatar = op.profile.avatar if op.profile.avatar else op_name[:2].upper()
                    op_color = op.profile.color if hasattr(op.profile, 'color') and op.profile.color else 'var(--accent-color)'
                else:
                    op_anon = AnonymousProfile.get_or_create_for_user(oc, op)
                    op_name = op_anon.fake_username
                    op_avatar = '?'
                    op_color = '#eee'
                
                participant_other_chats.append({
                    'id': oc.id,
                    'username': op_name,
                    'handle': f"@{op_name.lower().replace(' ', '')}",
                    'avatar': op_avatar,
                    'color': op_color
                })
        other_chats_data.append(participant_other_chats)
        # ------------------------------------------------------

        if is_p_public:
            profile = participant.profile
            # For public users, use their ACTUAL username and real identity
            real_username = str(participant.username)
            display_usernames[participant.username] = real_username
            chatter_data.append({
                'id': participant.id,
                'username': real_username,
                'avatar': profile.avatar if profile.avatar else real_username[:2].upper(),
                'avatar_url': profile.get_avatar_url(),
                'color': profile.color if hasattr(profile, 'color') and profile.color else ('var(--red-accent)' if not chatter_data else 'var(--yellow-accent)'),
                'handle': f"@{real_username}",
                'is_anonymous': False,
                'is_public': True,
                'bio': profile.bio,
                'rank': profile.rank,
                'followers_count': profile.followers_count,
                'following_count': profile.following_count,
                'posts_count': profile.posts_count,
            })
        else:
            anon = AnonymousProfile.get_or_create_for_user(conversation, participant)
            # For anonymous users, strictly use the masked identity
            masked_username = str(anon.fake_username)
            display_usernames[participant.username] = masked_username
            chatter_data.append({
                'id': participant.id,
                'username': masked_username,
                'avatar': '?',
                'avatar_url': anon.get_avatar_url(),
                'color': '#eee',
                'handle': '@anonymous',
                'is_anonymous': True,
                'is_public': False,
                'bio': 'User prefers to stay in the shadows.',
                'rank': 0,
                'followers_count': 0,
                'following_count': 0,
                'posts_count': 0,
            })
        # Note: id is used to preserve left/right consistency

    # Scrub sender names in messages based on our masking map
    for msg in serialized_messages:
        real_sender = msg.get('sender_username')
        if real_sender in display_usernames:
            msg['sender_username'] = display_usernames[real_sender]

    return Response({
        'conversation': {
            **serialized_conv,
            'participants': chatter_data,
            'other_chats_left': other_chats_data[0] if len(other_chats_data) > 0 else [],
            'other_chats_right': other_chats_data[1] if len(other_chats_data) > 1 else []
        },
        'messages': serialized_messages,
        'is_participant': is_participant
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    """Create a new conversation with another user"""
    other_username = request.data.get('username')
    other_user = get_object_or_404(User, username=other_username)
    
    if other_user == request.user:
        return Response({'error': 'Cannot create conversation with yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if conversation already exists
    existing = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=other_user
    ).first()
    
    if existing:
        return Response(ConversationSerializer(existing, context={'request': request}).data)
    
    # Create new conversation
    conversation = Conversation.objects.create()
    conversation.participants.add(request.user, other_user)
    
    # Create visibility settings (default private)
    ChatVisibility.objects.create(user=request.user, conversation=conversation, is_public=request.user.profile.default_conversations_public)
    ChatVisibility.objects.create(user=other_user, conversation=conversation, is_public=False)
    
    return Response(ConversationSerializer(conversation, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_visibility(request, conversation_id):
    """Toggle public/private status for a conversation"""
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Check if user is a participant
    if not conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Not a participant'}, status=status.HTTP_403_FORBIDDEN)
    
    visibility, created = ChatVisibility.objects.get_or_create(
        user=request.user,
        conversation=conversation,
        defaults={'is_public': False}
    )
    
    visibility.is_public = not visibility.is_public
    visibility.save()
    
    return Response({
        'is_public': visibility.is_public,
        'message': f'Chat is now {"public" if visibility.is_public else "private"}'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def react_to_conversation(request, conversation_id):
    """Add or toggle reaction to a conversation"""
    conversation = get_object_or_404(Conversation, id=conversation_id)
    reaction_type = request.data.get('reaction_type')
    
    if reaction_type not in ['like', 'dislike', 'cap', 'smile']:
        return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if there is new content since the last reaction of this type
    last_msg = conversation.messages.order_by('-timestamp').first()
    latest_reaction = ConversationReaction.objects.filter(
        conversation=conversation,
        user=request.user,
        reaction_type=reaction_type
    ).order_by('-created_at').first()

    should_add_new = False
    if last_msg and latest_reaction:
        if last_msg.timestamp > latest_reaction.created_at:
            should_add_new = True
    elif not latest_reaction:
        should_add_new = True
    
    if latest_reaction and not should_add_new:
        # Removal: Decrement count if no new content since last reaction
        if reaction_type == 'like':
            conversation.likes = max(0, conversation.likes - 1)
        elif reaction_type == 'dislike':
            conversation.dislikes = max(0, conversation.dislikes - 1)
        elif reaction_type == 'cap':
            conversation.caps = max(0, conversation.caps - 1)
        elif reaction_type == 'smile':
            conversation.smiles = max(0, conversation.smiles - 1)
        
        latest_reaction.delete()
        conversation.save()
        return Response(ConversationSerializer(conversation, context={'request': request}).data)
    
    # Addition: Increment count
    ConversationReaction.objects.create(
        conversation=conversation,
        user=request.user,
        reaction_type=reaction_type
    )
    
    if reaction_type == 'like':
        conversation.likes += 1
    elif reaction_type == 'dislike':
        conversation.dislikes += 1
    elif reaction_type == 'cap':
        conversation.caps += 1
    elif reaction_type == 'smile':
        conversation.smiles += 1
    
    conversation.save()
    
    return Response(ConversationSerializer(conversation, context={'request': request}).data)


# ==================== Message Views ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Send a new message in a conversation"""
    conversation_id = request.data.get('conversation_id')
    text = request.data.get('text')
    
    if not text:
        return Response({'error': 'Message text is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Check if user is a participant
    if not conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Not a participant'}, status=status.HTTP_403_FORBIDDEN)
    
    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        text=text
    )
    
    # Update conversation timestamp
    conversation.save()
    
    return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def react_to_message(request, message_id):
    """Add, update, or toggle off a reaction to a message"""
    message = get_object_or_404(Message, id=message_id)
    if not _can_access_message(request, message):
        return Response({'error': 'Not a participant or public'}, status=status.HTTP_403_FORBIDDEN)
    reaction_type = request.data.get('reaction_type')
    
    if reaction_type not in ['like', 'dislike', 'cap', 'smile']:
        return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get or create reaction
    reaction, created = MessageReaction.objects.get_or_create(
        message=message,
        user=request.user,
        defaults={'reaction_type': reaction_type}
    )
    
    if created:
        # Increment new reaction count
        if reaction_type == 'like':
            message.likes += 1
        elif reaction_type == 'dislike':
            message.dislikes += 1
        elif reaction_type == 'cap':
            message.caps += 1
        elif reaction_type == 'smile':
            message.smiles += 1
    else:
        old_type = reaction.reaction_type
        if old_type == reaction_type:
            # Toggle off: remove the reaction
            if old_type == 'like':
                message.likes = max(0, message.likes - 1)
            elif old_type == 'dislike':
                message.dislikes = max(0, message.dislikes - 1)
            elif old_type == 'cap':
                message.caps = max(0, message.caps - 1)
            elif old_type == 'smile':
                message.smiles = max(0, message.smiles - 1)
            reaction.delete()
        else:
            # Change reaction type
            if old_type == 'like':
                message.likes = max(0, message.likes - 1)
            elif old_type == 'dislike':
                message.dislikes = max(0, message.dislikes - 1)
            elif old_type == 'cap':
                message.caps = max(0, message.caps - 1)
            elif old_type == 'smile':
                message.smiles = max(0, message.smiles - 1)
            
            reaction.reaction_type = reaction_type
            reaction.save()
            
            if reaction_type == 'like':
                message.likes += 1
            elif reaction_type == 'dislike':
                message.dislikes += 1
            elif reaction_type == 'cap':
                message.caps += 1
            elif reaction_type == 'smile':
                message.smiles += 1
    
    message.save()
    
    return Response(MessageSerializer(message, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, conversation_id):
    """Mark all messages in a conversation as read for the current user"""
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Check if user is a participant
    if not conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Not a participant'}, status=status.HTTP_403_FORBIDDEN)
    
    # Mark messages as read where sender is NOT the current user
    unread_messages = Message.objects.filter(
        conversation=conversation,
        is_read=False
    ).exclude(sender=request.user)
    
    count = unread_messages.count()
    unread_messages.update(is_read=True)
    
    return Response({'marked_read': count, 'message': f'{count} messages marked as read'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_reaction(request, message_id):
    """Remove reaction from a message"""
    message = get_object_or_404(Message, id=message_id)
    if not _can_access_message(request, message):
        return Response({'error': 'Not a participant or public'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        reaction = MessageReaction.objects.get(message=message, user=request.user)
        reaction_type = reaction.reaction_type
        
        # Decrement count
        if reaction_type == 'like':
            message.likes = max(0, message.likes - 1)
        elif reaction_type == 'dislike':
            message.dislikes = max(0, message.dislikes - 1)
        elif reaction_type == 'cap':
            message.caps = max(0, message.caps - 1)
        
        message.save()
        reaction.delete()
        
        return Response({'message': 'Reaction removed'})
    except MessageReaction.DoesNotExist:
        return Response({'error': 'No reaction found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def increment_view(request, message_id):
    """Increment view count for a message"""
    message = get_object_or_404(Message, id=message_id)
    if not _can_access_message(request, message):
        return Response({'error': 'Not a participant or public'}, status=status.HTTP_403_FORBIDDEN)
    message.increment_view()
    return Response({'views': message.views})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_message_comment(request, message_id):
    """Add an inline comment to a specific message"""
    message = get_object_or_404(Message, id=message_id)
    if not _can_access_message(request, message):
        return Response({'error': 'Not a participant or public'}, status=status.HTTP_403_FORBIDDEN)
    text = request.data.get('text')
    
    if not text:
        return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    comment = MessageComment.objects.create(
        message=message,
        user=request.user,
        text=text
    )
    
    serializer = MessageCommentSerializer(comment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    """Delete a message"""
    message = get_object_or_404(Message, id=message_id)
    if message.sender != request.user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    message.delete()
    return Response({'message': 'Deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    """Delete a comment"""
    comment = get_object_or_404(MessageComment, id=comment_id)
    if comment.user != request.user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    comment.delete()
    return Response({'message': 'Deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# ==================== Post Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_posts(request, username):
    """Get posts for a specific user"""
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(user=user)
    return Response(PostSerializer(posts, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    """Create a new post"""
    serializer = PostSerializer(data=request.data)
    if serializer.is_valid():
        post = serializer.save(user=request.user)
        request.user.profile.posts_count += 1
        request.user.profile.save()
        return Response(PostSerializer(post).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({'error': 'Both old and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    if not user.check_password(old_password):
        return Response({'error': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password changed successfully'})
