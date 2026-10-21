from django.db import connection
from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response


class HealthCheckView(views.APIView):
    """
    Lightweight health probe endpoint for container orchestrators,
    load balancers, and monitoring systems.
    Verifies database connectivity and returns system status.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = []

    def get(self, request):
        db_status = 'ok'
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1;')
                cursor.fetchone()
        except Exception as e:
            db_status = f'error: {str(e)}'
            return Response(
                {
                    'status': 'degraded',
                    'database': db_status,
                    'timestamp': timezone.now().isoformat(),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                'status': 'ok',
                'database': 'connected',
                'service': 'cchat-api',
                'version': '1.0.0',
                'timestamp': timezone.now().isoformat(),
            },
            status=status.HTTP_200_OK,
        )
