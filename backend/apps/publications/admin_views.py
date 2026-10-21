from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from apps.publications.models import PublicExcerpt, MessageReaction, Topic, PlatformBroadcast
from apps.publications.serializers import PlatformBroadcastSerializer
from apps.sponsorship.models import PartnerInquiry


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
        week_ago = timezone.now() - timedelta(days=7)
        new_this_week = PublicExcerpt.objects.filter(created_at__gte=week_ago).count()

        # Reaction culture breakdown (Heart, Cap, Skull, Fire)
        reactions_breakdown = {
            'heart': MessageReaction.objects.filter(reaction_type='heart').count(),
            'cap': MessageReaction.objects.filter(reaction_type='cap').count(),
            'skull': MessageReaction.objects.filter(reaction_type='skull').count(),
            'fire': MessageReaction.objects.filter(reaction_type='fire').count(),
        }

        # Sponsorship pipeline summary
        inquiries_summary = {
            'total': PartnerInquiry.objects.count(),
            'pending': PartnerInquiry.objects.filter(status='pending').count(),
            'reviewed': PartnerInquiry.objects.filter(status='reviewed').count(),
            'accepted': PartnerInquiry.objects.filter(status='accepted').count(),
            'rejected': PartnerInquiry.objects.filter(status='rejected').count(),
        }

        return Response({
            'total_users': total_users,
            'total_public_chats': total_public_chats,
            'total_reactions': total_reactions,
            'total_reads': total_reads_count,
            'total_topics': total_topics,
            'new_this_week': new_this_week,
            'reactions_breakdown': reactions_breakdown,
            'inquiries_summary': inquiries_summary,
        })


class AdminBroadcastView(views.APIView):
    """Admin endpoint to view and update the platform-wide broadcast banner."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        broadcast = PlatformBroadcast.objects.first()
        if not broadcast:
            broadcast = PlatformBroadcast.objects.create(
                is_active=False,
                badge_text='ANNOUNCEMENT',
                message='Welcome to CCHAT — The Plot is Public!',
                style_variant='violet',
                action_label="Explore Tonight's Picks",
                action_url='/tonight'
            )
        return Response(PlatformBroadcastSerializer(broadcast).data)

    def post(self, request):
        broadcast = PlatformBroadcast.objects.first()
        if not broadcast:
            serializer = PlatformBroadcastSerializer(data=request.data)
        else:
            serializer = PlatformBroadcastSerializer(broadcast, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        return self.post(request)

    def patch(self, request):
        return self.post(request)

