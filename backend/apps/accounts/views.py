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
