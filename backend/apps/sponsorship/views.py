from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from .models import PartnerInquiry, SponsorPlacement
from .serializers import PartnerInquirySerializer, SponsorPlacementSerializer


class SubmitInquiryView(views.APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'inquiries'
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PartnerInquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'detail': 'Inquiry received successfully. Our partnership team will review and contact you.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AfterHoursDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sponsor = SponsorPlacement.objects.filter(brand_name='After Hours', is_active=True).first()
        if not sponsor:
            return Response({
                'brand_name': 'After Hours',
                'headline': 'Fuel your next conversation.',
                'tagline': 'Late-night coffee, fresh playlists, better conversations.',
                'image_url': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
                'menu_items': [
                    {'name': 'Midnight Cold Brew', 'description': 'Slow-steeped 18 hours with cinnamon bark'},
                    {'name': 'Dark Room Espresso', 'description': 'Double shot with dark chocolate undertones'},
                    {'name': 'Matcha Cloud', 'description': 'Ceremonial grade with oat foam'}
                ],
                'tracks': [
                    {'title': 'Night Walk 03', 'description': 'Low-tempo ambient beats for late thinking'},
                    {'title': 'Overpass Echoes', 'description': 'Downtempo synth wave curated by Midnight Collective'},
                    {'title': 'Subway Lights', 'description': 'Minimalist keys and rainy atmosphere'}
                ]
            })
        return Response(SponsorPlacementSerializer(sponsor).data)


# ──────────────────────────────────────────────────────
# ADMIN-ONLY VIEWS
# ──────────────────────────────────────────────────────

class AdminInquiriesView(views.APIView):
    """List all sponsorship inquiries and update status. Admin only."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        inquiries = PartnerInquiry.objects.order_by('-created_at')
        data = []
        for i in inquiries:
            data.append({
                'id': i.id,
                'name': i.name,
                'brand': i.brand,
                'email': i.email,
                'placement_interest': i.placement_interest,
                'idea': i.idea,
                'agreed_terms': i.agreed_terms,
                'status': getattr(i, 'status', 'pending'),
                'created_at': i.created_at.isoformat(),
            })
        return Response(data)

    def patch(self, request, inquiry_id):
        try:
            inquiry = PartnerInquiry.objects.get(id=inquiry_id)
        except PartnerInquiry.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        allowed = ['pending', 'reviewed', 'accepted', 'rejected']
        if new_status not in allowed:
            return Response({'detail': f'Status must be one of: {allowed}'}, status=status.HTTP_400_BAD_REQUEST)
        inquiry.status = new_status
        inquiry.save(update_fields=['status'])
        return Response({'detail': f'Inquiry marked as {new_status}', 'status': new_status})
