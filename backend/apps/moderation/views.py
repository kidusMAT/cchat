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


# ──────────────────────────────────────────────────────
# ADMIN-ONLY VIEWS
# ──────────────────────────────────────────────────────

class AdminReportsView(views.APIView):
    """List all reports and update their status. Admin only."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        reports = Report.objects.select_related('reporter').order_by('-created_at')
        data = []
        for r in reports:
            data.append({
                'id': r.id,
                'reason': r.reason,
                'context': r.context,
                'status': r.status,
                'reporter': r.reporter.handle if r.reporter else 'Anonymous',
                'created_at': r.created_at.isoformat(),
            })
        return Response(data)

    def patch(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        allowed = ['pending', 'reviewed', 'resolved', 'dismissed']
        if new_status not in allowed:
            return Response({'detail': f'Status must be one of: {allowed}'}, status=status.HTTP_400_BAD_REQUEST)
        report.status = new_status
        report.save(update_fields=['status'])
        return Response({'detail': 'Status updated', 'status': report.status})


class AdminPrivacyRequestsView(views.APIView):
    """List all privacy requests and update their status. Admin only."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        reqs = PrivacyRequest.objects.order_by('-created_at')
        data = []
        for r in reqs:
            data.append({
                'id': r.id,
                'name': r.name,
                'email': r.email,
                'request_type': r.request_type,
                'details': r.details,
                'status': r.status,
                'created_at': r.created_at.isoformat(),
            })
        return Response(data)

    def patch(self, request, req_id):
        try:
            req = PrivacyRequest.objects.get(id=req_id)
        except PrivacyRequest.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        allowed = ['received', 'in_review', 'processed', 'rejected']
        if new_status not in allowed:
            return Response({'detail': f'Status must be one of: {allowed}'}, status=status.HTTP_400_BAD_REQUEST)
        req.status = new_status
        req.save(update_fields=['status'])
        return Response({'detail': 'Status updated', 'status': req.status})
