from rest_framework import views, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from apps.publications.models import PublicExcerpt, MessageReaction, Topic


class AdminStatsView(views.APIView):
    """Platform-wide stats for the admin dashboard. Admin only."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_public_chats = PublicExcerpt.objects.filter(is_active=True).count()
        total_reactions = MessageReaction.objects.count()
        total_reads = PublicExcerpt.objects.filter(is_active=True).values_list('reads_count', flat=True)
        total_reads_count = sum(total_reads)
        total_topics = Topic.objects.count()

        # Recent activity: last 7 days excerpts
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        new_this_week = PublicExcerpt.objects.filter(created_at__gte=week_ago).count()

        return Response({
            'total_users': total_users,
            'total_public_chats': total_public_chats,
            'total_reactions': total_reactions,
            'total_reads': total_reads_count,
            'total_topics': total_topics,
            'new_this_week': new_this_week,
        })
