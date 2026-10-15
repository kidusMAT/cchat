from rest_framework import viewsets, views, status, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer, LoginSerializer

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.all().select_related('user')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]


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
