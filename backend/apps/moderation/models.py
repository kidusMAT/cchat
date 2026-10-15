from django.db import models
from apps.accounts.models import UserProfile
from apps.conversations.models import Conversation

class Report(models.Model):
    reporter = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='filed_reports', null=True, blank=True)
    reason = models.CharField(max_length=100)
    context = models.TextField()
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        reporter_handle = self.reporter.handle if self.reporter else 'Anonymous'
        return f"Report {self.id}: {self.reason} by {reporter_handle}"


class PrivacyRequest(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='privacy_requests')
    name = models.CharField(max_length=120, blank=True, default='')
    email = models.EmailField()
    request_type = models.CharField(max_length=100)
    details = models.TextField()
    status = models.CharField(max_length=30, default='received')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PrivacyRequest {self.id}: {self.request_type} from {self.email}"


class Mute(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='muted_conversations')
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='muted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'conversation')


class Block(models.Model):
    blocker = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='blocking')
    blocked_user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked_user')
