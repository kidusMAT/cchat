from rest_framework import views, status
from rest_framework.response import Response
from .models import PartnerInquiry, SponsorPlacement
from .serializers import PartnerInquirySerializer, SponsorPlacementSerializer

class SubmitInquiryView(views.APIView):
    def post(self, request):
        serializer = PartnerInquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Inquiry received successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AfterHoursDetailView(views.APIView):
    def get(self, request):
        sponsor = SponsorPlacement.objects.filter(brand_name='After Hours', is_active=True).first()
        if not sponsor:
            return Response({'detail': 'Sponsor not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SponsorPlacementSerializer(sponsor).data)
