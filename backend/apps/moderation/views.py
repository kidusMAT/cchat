from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from .models import Report, PrivacyRequest
from .serializers import ReportSerializer, PrivacyRequestSerializer
from apps.accounts.models import UserProfile

class SubmitReportView(views.APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'reports'
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            reporter = None
            if request.user and request.user.is_authenticated:
                try:
                    reporter = request.user.profile
                except UserProfile.DoesNotExist:
                    reporter = None
            serializer.save(reporter=reporter)
            return Response({
                'detail': 'Report submitted successfully. Our safety team will review it.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmitPrivacyRequestView(views.APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'privacy'
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PrivacyRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = None
            if request.user and request.user.is_authenticated:
                try:
                    user = request.user.profile
                except UserProfile.DoesNotExist:
                    user = None
            serializer.save(user=user)
            return Response({
                'detail': 'Privacy request submitted successfully. You will receive an email confirmation shortly.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
