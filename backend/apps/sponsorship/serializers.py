from rest_framework import serializers
from .models import PartnerInquiry, SponsorPlacement, SponsorMenuItem, SponsorTrack

class PartnerInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerInquiry
        fields = ['id', 'name', 'brand', 'email', 'placement_interest', 'idea', 'agreed_terms', 'created_at']


class SponsorMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorMenuItem
        fields = ['id', 'name', 'description', 'order']


class SponsorTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorTrack
        fields = ['id', 'title', 'description', 'order']


class SponsorPlacementSerializer(serializers.ModelSerializer):
    menu_items = SponsorMenuItemSerializer(many=True, read_only=True)
    tracks = SponsorTrackSerializer(many=True, read_only=True)

    class Meta:
        model = SponsorPlacement
        fields = ['id', 'brand_name', 'headline', 'tagline', 'image_url', 'menu_items', 'tracks']
