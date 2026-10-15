from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets, views, status
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class MeView(views.APIView):
    def get(self, request):
        profile = UserProfile.objects.filter(handle='@mayamaybe').first() or UserProfile.objects.first()
        if not profile:
            return Response({'detail': 'No profile found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserProfileSerializer(profile).data)


class LoginView(views.APIView):
    """
    POST /api/auth/login/
    Body: { "handle": "@mayamaybe", "password": "..." }
    Returns the UserProfile data on success.
    """
    def post(self, request):
        handle = request.data.get('handle', '').strip()
        password = request.data.get('password', '')

        if not handle or not password:
            return Response({'detail': 'Handle and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Normalise handle — always starts with @
        if not handle.startswith('@'):
            handle = f'@{handle}'

        profile = UserProfile.objects.filter(handle=handle).first()
        if not profile:
            return Response({'detail': 'Invalid handle or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=profile.user.username, password=password)
        if user is None:
            return Response({'detail': 'Invalid handle or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(UserProfileSerializer(profile).data)


class SignupView(views.APIView):
    """
    POST /api/auth/signup/
    Body: { "handle": "@newuser", "display_name": "New User", "password": "..." }
    Creates a Django User + UserProfile and returns the profile.
    """
    def post(self, request):
        handle = request.data.get('handle', '').strip()
        display_name = request.data.get('display_name', '').strip()
        password = request.data.get('password', '')

        if not handle or not display_name or not password:
            return Response({'detail': 'handle, display_name and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Normalise handle
        if not handle.startswith('@'):
            handle = f'@{handle}'

        if len(password) < 6:
            return Response({'detail': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        if UserProfile.objects.filter(handle=handle).exists():
            return Response({'detail': f'The handle {handle} is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        # Derive a username from the handle (strip the @, ensure uniqueness)
        base_username = handle.lstrip('@')
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'{base_username}{counter}'
            counter += 1

        user = User.objects.create_user(username=username, password=password)
        profile = UserProfile.objects.create(
            user=user,
            handle=handle,
            display_name=display_name,
        )
        return Response(UserProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

