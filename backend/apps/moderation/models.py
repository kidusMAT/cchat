from django.db import models
from apps.accounts.models import UserProfile
from apps.conversations.models import Conversation

class Report(models.Model):
    reporter = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='filed_reports')
    reason = models.CharField(max_length=100)
    context = models.TextField()
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report {self.id}: {self.reason} by {self.reporter.handle}"


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
