from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests
import urllib.request
import urllib.error
import json

from .models import (
    Profile, Follow, Conversation, Message, MessageReaction,
    ConversationReaction, ChatVisibility, AnonymousProfile, Post
)
from .serializers import (
    UserSerializer, ProfileSerializer, RegisterSerializer,
    FollowSerializer, MessageSerializer, ConversationSerializer,
    ChatVisibilitySerializer, AnonymousProfileSerializer,
    ChatterProfileSerializer, PostSerializer, MessageReactionSerializer
)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request, username):
    """Get a specific user's profile"""
    user = get_object_or_404(User, username=username)
    serializer = ProfileSerializer(user.profile)
    return Response(serializer.data)


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
    """Get algorithm-recommended public chats"""
    # Get conversations where at least one participant has made it public
    public_visibilities = ChatVisibility.objects.filter(is_public=True)
    conversation_ids = public_visibilities.values_list('conversation_id', flat=True).distinct()
    
    conversations = Conversation.objects.filter(
        id__in=conversation_ids
    ).order_by('-updated_at')[:20]
    
    result = []
    for conv in conversations:
        # Get both participants
        participants = list(conv.participants.all())
        if len(participants) != 2:
            continue
            
        display_usernames = {}
        chatter_data = []
        for participant in participants:
            # Check if this participant made their side public
            is_public = conv.is_public_for_user(participant)
            
            if is_public:
                # Show real profile
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
                # Show anonymous profile
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
        
        # Get messages
        messages = Message.objects.filter(conversation=conv).order_by('timestamp')
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
def get_following_chats(request):
    """Get public chats from users you follow"""
    # Get users current user is following
    following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
    
    # Get public conversations involving these users
    public_visibilities = ChatVisibility.objects.filter(
        user_id__in=following_ids,
        is_public=True
    )
    conversation_ids = public_visibilities.values_list('conversation_id', flat=True).distinct()
    
    conversations = Conversation.objects.filter(
        id__in=conversation_ids
    ).order_by('-updated_at')[:20]
    
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
        
        messages = Message.objects.filter(conversation=conv).order_by('timestamp')
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
    
    users = User.objects.filter(username__icontains=query)[:10]
    return Response(UserSerializer(users, many=True).data)


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
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    is_authenticated = request.user.is_authenticated
    is_participant = is_authenticated and conversation.participants.filter(id=request.user.id).exists()
    
    if not is_participant:
        # If any user made it public, anyone can view it
        if not ChatVisibility.objects.filter(conversation=conversation, is_public=True).exists():
            return Response({'error': 'Not a participant or public'}, status=status.HTTP_403_FORBIDDEN)
    
    messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
    serialized_conv = ConversationSerializer(conversation, context={'request': request}).data
    serialized_messages = MessageSerializer(messages, many=True, context={'request': request}).data
    
    # Anonymize users and messages for non-participants based on their visibility preference
    if not is_participant:
        display_usernames = {}
        for participant in conversation.participants.all():
            if conversation.is_public_for_user(participant):
                display_usernames[participant.username] = participant.username
            else:
                anon = AnonymousProfile.get_or_create_for_user(conversation, participant)
                display_usernames[participant.username] = anon.fake_username
                
                # Replace in serialized_conv['participants']
                for p in serialized_conv.get('participants', []):
                    if p['username'] == participant.username:
                        p['username'] = anon.fake_username
                        p['first_name'] = 'Anonymous'
                        p['last_name'] = ''
                        
                # Replace in 'other_participant' just in case
                other = serialized_conv.get('other_participant')
                if other and other['username'] == participant.username:
                    other['username'] = anon.fake_username
                    other['first_name'] = 'Anonymous'
                    other['last_name'] = ''

        for msg in serialized_messages:
            real_sender = msg.get('sender_username')
            if real_sender in display_usernames:
                msg['sender_username'] = display_usernames[real_sender]
    
    return Response({
        'conversation': serialized_conv,
        'messages': serialized_messages
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
    ChatVisibility.objects.create(user=request.user, conversation=conversation, is_public=False)
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
    
    # Check if user already reacted with this type
    existing = ConversationReaction.objects.filter(
        conversation=conversation,
        user=request.user,
        reaction_type=reaction_type
    ).first()
    
    if existing:
        # Removal: Decrement count
        if reaction_type == 'like':
            conversation.likes = max(0, conversation.likes - 1)
        elif reaction_type == 'dislike':
            conversation.dislikes = max(0, conversation.dislikes - 1)
        elif reaction_type == 'cap':
            conversation.caps = max(0, conversation.caps - 1)
        elif reaction_type == 'smile':
            conversation.smiles = max(0, conversation.smiles - 1)
        
        existing.delete()
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
    """Add or update reaction to a message"""
    message = get_object_or_404(Message, id=message_id)
    reaction_type = request.data.get('reaction_type')
    
    if reaction_type not in ['like', 'dislike', 'cap']:
        return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get or create reaction
    reaction, created = MessageReaction.objects.get_or_create(
        message=message,
        user=request.user,
        defaults={'reaction_type': reaction_type}
    )
    
    if not created:
        # Update existing reaction
        old_type = reaction.reaction_type
        if old_type != reaction_type:
            # Decrement old reaction count
            if old_type == 'like':
                message.likes = max(0, message.likes - 1)
            elif old_type == 'dislike':
                message.dislikes = max(0, message.dislikes - 1)
            elif old_type == 'cap':
                message.caps = max(0, message.caps - 1)
            
            reaction.reaction_type = reaction_type
            reaction.save()
    
    # Increment new reaction count
    if reaction_type == 'like':
        message.likes += 1
    elif reaction_type == 'dislike':
        message.dislikes += 1
    elif reaction_type == 'cap':
        message.caps += 1
    
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
    message.increment_view()
    return Response({'views': message.views})


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
