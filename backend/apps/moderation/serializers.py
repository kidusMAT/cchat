from rest_framework import serializers
from .models import Report, PrivacyRequest

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'reason', 'context', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']


class PrivacyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyRequest
        fields = ['id', 'name', 'email', 'request_type', 'details', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']
