from rest_framework import viewsets, views, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import Http404, HttpResponseRedirect
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
import urllib.request
import urllib.parse
import urllib.error
import json
import datetime
import secrets
import re

from .models import UserProfile, GoogleIdentity, OAuthLoginTicket
from .serializers import UserProfileSerializer, RegisterSerializer, LoginSerializer


def resolve_or_create_google_user(sub: str, email: str, name: str = '', picture: str = ''):
    """
    Given verified Google user info, resolve or link an existing account,
    or provision a new User and UserProfile.
    """
    # 1. Existing verified Google identity
    identity = GoogleIdentity.objects.filter(subject=sub).select_related('user', 'user__profile').first()
    if identity:
        user = identity.user
        profile = getattr(user, 'profile', None)
        if not profile:
            profile = UserProfile.objects.create(
                user=user,
                handle=f"@{user.username}",
                display_name=name or user.username,
                avatar_url=picture or ''
            )
        elif picture and not profile.avatar_url:
            profile.avatar_url = picture
            profile.save(update_fields=['avatar_url'])
        return user, profile

    # 2. Existing user matched by email address
    user = User.objects.filter(email__iexact=email).first() if email else None
    if user:
        GoogleIdentity.objects.create(user=user, subject=sub, email=email)
        profile = getattr(user, 'profile', None)
        if not profile:
            profile = UserProfile.objects.create(
                user=user,
                handle=f"@{user.username}",
                display_name=name or user.username,
                avatar_url=picture or ''
            )
        elif picture and not profile.avatar_url:
            profile.avatar_url = picture
            profile.save(update_fields=['avatar_url'])
        return user, profile

    # 3. Create fresh user account
    clean_base = re.sub(r'[^a-zA-Z0-9_]', '', (email.split('@')[0] if email else 'user')) or 'user'
    username = clean_base[:40]
    counter = 1
    while User.objects.filter(username__iexact=username).exists():
        username = f"{clean_base[:35]}{counter}"
        counter += 1

    user = User.objects.create_user(username=username, email=email or '')
    user.set_unusable_password()
    user.save()

    profile = UserProfile.objects.create(
        user=user,
        handle=f"@{user.username}",
        display_name=name.strip() if name and name.strip() else user.username,
        avatar_url=picture or '',
        bio='Joined via Google sign-in.'
    )
    GoogleIdentity.objects.create(user=user, subject=sub, email=email or '')
    return user, profile


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.all().select_related('user')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q') or self.request.query_params.get('search')
        if q:
            clean_handle = q if q.startswith('@') else f"@{q}"
            qs = qs.filter(
                Q(handle__icontains=q) |
                Q(handle__icontains=clean_handle) |
                Q(display_name__icontains=q) |
                Q(bio__icontains=q)
            )
        return qs

    def get_object(self):
        lookup = self.kwargs.get('pk')
        if lookup:
            lookup_str = str(lookup).strip()
            if not lookup_str.isdigit():
                clean_handle = lookup_str if lookup_str.startswith('@') else f"@{lookup_str}"
                obj = UserProfile.objects.filter(handle__iexact=clean_handle).first()
                if not obj:
                    obj = UserProfile.objects.filter(user__username__iexact=lookup_str).first()
                if not obj:
                    raise Http404
                return obj
        return super().get_object()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_follow(self, request, pk=None):
        target_profile = self.get_object()
        current_profile = request.user.profile
        if target_profile.id == current_profile.id:
            return Response({'detail': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        if current_profile.following.filter(id=target_profile.id).exists():
            current_profile.following.remove(target_profile)
            is_following = False
        else:
            current_profile.following.add(target_profile)
            is_following = True

        return Response({
            'is_following': is_following,
            'following_count': current_profile.following.count(),
            'followers_count': target_profile.followers.count()
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def following(self, request):
        current_profile = request.user.profile
        following_profiles = current_profile.following.all()
        serializer = self.get_serializer(following_profiles, many=True)
        return Response(serializer.data)


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            token, _ = Token.objects.get_or_create(user=profile.user)
            return Response({
                'token': token.key,
                'user': UserProfileSerializer(profile).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # Allow login via username or handle
        if username.startswith('@'):
            profile = UserProfile.objects.filter(handle__iexact=username).first()
            if profile:
                username = profile.user.username

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={'handle': f"@{user.username}", 'display_name': user.username}
        )
        return Response({
            'token': token.key,
            'user': UserProfileSerializer(profile).data
        }, status=status.HTTP_200_OK)


class DemoLoginView(views.APIView):
    """
    Convenience endpoint for switching between accounts (e.g. Maya, Jules, Nina, Leo)
    in development, testing, and evaluator previews.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.DEMO_LOGIN_ENABLED:
            raise Http404

        identifier = request.data.get('identifier', 'maya').strip()
        if identifier.startswith('@'):
            profile = UserProfile.objects.filter(handle__iexact=identifier).first()
        else:
            profile = UserProfile.objects.filter(user__username__iexact=identifier).first()
            if not profile:
                profile = UserProfile.objects.filter(handle__iexact=f"@{identifier}").first()

        if not profile:
            # Fall back to first available user or create one
            profile = UserProfile.objects.first()
            if not profile:
                user = User.objects.create_user(username='maya', email='maya@example.com')
                profile = UserProfile.objects.create(
                    user=user,
                    handle='@mayamaybe',
                    display_name='Maya Chen',
                    bio='A little less posting. A lot more plot.'
                )

        token, _ = Token.objects.get_or_create(user=profile.user)
        return Response({
            'token': token.key,
            'user': UserProfileSerializer(profile).data
        }, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': 'Logged out successfully'}, status=status.HTTP_200_OK)


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(
                user=request.user,
                handle=f"@{request.user.username}",
                display_name=request.user.username
            )
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(
                user=request.user,
                handle=f"@{request.user.username}",
                display_name=request.user.username
            )
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if 'email' in request.data:
                request.user.email = request.data['email']
                request.user.save(update_fields=['email'])
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OAuthStatusView(views.APIView):
    """Public discovery endpoint reporting whether Google OAuth is enabled."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'google_enabled': bool(settings.GOOGLE_OAUTH_ENABLED),
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID if settings.GOOGLE_OAUTH_ENABLED else '',
        }, status=status.HTTP_200_OK)


class GoogleLoginInitView(views.APIView):
    """Generates the Google OAuth authorization URL or redirects browser to Google."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not settings.GOOGLE_OAUTH_ENABLED:
            return Response({'detail': 'Google OAuth is not configured or enabled.'}, status=status.HTTP_400_BAD_REQUEST)

        state = secrets.token_urlsafe(24)
        params = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'select_account',
            'state': state,
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

        if request.query_params.get('format') == 'json' or 'application/json' in request.headers.get('Accept', ''):
            return Response({'url': auth_url, 'state': state}, status=status.HTTP_200_OK)
        return HttpResponseRedirect(auth_url)


class GoogleCallbackView(views.APIView):
    """
    Receives authorization code from Google OAuth, exchanges it for userinfo,
    links or provisions account, and generates a single-use OAuthLoginTicket.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        frontend_base = (settings.FRONTEND_URL or 'http://localhost:5173').rstrip('/')
        code = request.query_params.get('code')
        error = request.query_params.get('error')

        if error or not code:
            err_param = urllib.parse.quote(error or 'missing_code')
            return HttpResponseRedirect(f"{frontend_base}/login?oauth_error={err_param}")

        try:
            token_payload = urllib.parse.urlencode({
                'code': code,
                'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
                'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
                'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
                'grant_type': 'authorization_code',
            }).encode('utf-8')

            token_req = urllib.request.Request(
                'https://oauth2.googleapis.com/token',
                data=token_payload,
                headers={'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'CCHAT-Auth'}
            )
            with urllib.request.urlopen(token_req, timeout=10) as token_resp:
                token_data = json.loads(token_resp.read().decode('utf-8'))

            access_token = token_data.get('access_token')
            if not access_token:
                raise ValueError('Google token exchange failed to produce an access_token')

            userinfo_req = urllib.request.Request(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}', 'User-Agent': 'CCHAT-Auth'}
            )
            with urllib.request.urlopen(userinfo_req, timeout=10) as userinfo_resp:
                userinfo = json.loads(userinfo_resp.read().decode('utf-8'))

            sub = userinfo.get('sub')
            email = userinfo.get('email', '')
            name = userinfo.get('name') or userinfo.get('given_name', '')
            picture = userinfo.get('picture', '')

            if not sub:
                raise ValueError('Google userinfo response missing subject (sub)')

            user, _ = resolve_or_create_google_user(sub=sub, email=email, name=name, picture=picture)
            ticket = OAuthLoginTicket.objects.create(
                user=user,
                expires_at=timezone.now() + datetime.timedelta(minutes=5)
            )

            return HttpResponseRedirect(f"{frontend_base}/?oauth_ticket={ticket.token}")
        except Exception as exc:
            err_msg = urllib.parse.quote(str(exc)[:100])
            return HttpResponseRedirect(f"{frontend_base}/login?oauth_error={err_msg}")


class OAuthTicketExchangeView(views.APIView):
    """Exchanges a valid, single-use OAuthLoginTicket for an auth token and user profile."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ticket_str = (request.data.get('ticket') or '').strip()
        if not ticket_str:
            return Response({'detail': 'OAuth ticket is required.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket = OAuthLoginTicket.objects.filter(token=ticket_str).select_related('user').first()
        if not ticket or not ticket.is_usable:
            return Response({'detail': 'OAuth ticket is invalid, expired, or already used.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket.used_at = timezone.now()
        ticket.save(update_fields=['used_at'])

        token, _ = Token.objects.get_or_create(user=ticket.user)
        profile, _ = UserProfile.objects.get_or_create(
            user=ticket.user,
            defaults={'handle': f"@{ticket.user.username}", 'display_name': ticket.user.username}
        )

        return Response({
            'token': token.key,
            'user': UserProfileSerializer(profile).data
        }, status=status.HTTP_200_OK)


class GoogleTokenLoginView(views.APIView):
    """Direct ID token or Access Token authentication for frontend button or one-tap."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = (request.data.get('credential') or request.data.get('token') or '').strip()
        if not token:
            return Response({'detail': 'Token or credential is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            req = urllib.request.Request(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}', 'User-Agent': 'CCHAT-Auth'}
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    idinfo = json.loads(resp.read().decode('utf-8'))
            except urllib.error.HTTPError:
                tokeninfo_req = urllib.request.Request(
                    f'https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(token)}',
                    headers={'User-Agent': 'CCHAT-Auth'}
                )
                with urllib.request.urlopen(tokeninfo_req, timeout=10) as resp:
                    idinfo = json.loads(resp.read().decode('utf-8'))

            sub = idinfo.get('sub')
            email = idinfo.get('email', '')
            name = idinfo.get('name') or idinfo.get('given_name', '')
            picture = idinfo.get('picture', '')

            if not sub:
                return Response({'detail': 'Invalid Google credential.'}, status=status.HTTP_400_BAD_REQUEST)

            user, profile = resolve_or_create_google_user(sub=sub, email=email, name=name, picture=picture)
            auth_token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'token': auth_token.key,
                'user': UserProfileSerializer(profile).data
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({'detail': f'Google verification failed: {str(exc)}'}, status=status.HTTP_400_BAD_REQUEST)
