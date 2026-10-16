from django.db import models
from apps.accounts.models import UserProfile

class Conversation(models.Model):
    title = models.CharField(max_length=200)
    initials = models.CharField(max_length=10, blank=True, default='')
    participants = models.ManyToManyField(UserProfile, related_name='conversations')
    tag = models.CharField(max_length=50, default='PRIVATE')
    pinned_message = models.ForeignKey('Message', null=True, blank=True, on_delete=models.SET_NULL, related_name='pinned_in_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

    @property
    def preview(self):
        last_msg = self.messages.order_by('created_at').last()
        return last_msg.text if last_msg else ''


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField(blank=True, default='')
    attachment_url = models.TextField(blank=True, default='')
    attachment_name = models.CharField(max_length=255, blank=True, default='')
    attachment_type = models.CharField(max_length=50, blank=True, default='')
    is_edited = models.BooleanField(default=False)
    quick_reactions = models.JSONField(default=dict, blank=True)
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    is_excerpt_eligible = models.BooleanField(default=True)
    seen_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.display_name}: {self.text[:30]}"
