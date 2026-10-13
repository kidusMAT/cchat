from rest_framework import views, status
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer
from apps.accounts.models import UserProfile

class SubmitReportView(views.APIView):
    def post(self, request):
        user = UserProfile.objects.filter(handle='@mayamaybe').first() or UserProfile.objects.first()
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reporter=user)
            return Response({'detail': 'Report submitted successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
