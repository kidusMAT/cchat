from django.db import models
from apps.accounts.models import UserProfile
from apps.conversations.models import Conversation, Message

class Topic(models.Model):
    tag = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150, blank=True, default='')
    chats_count = models.IntegerField(default=0)

    def __str__(self):
        return self.tag


class PublicExcerpt(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='excerpts')
    title = models.CharField(max_length=255)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='excerpts')
    publishers = models.ManyToManyField(UserProfile, related_name='published_excerpts')
    messages = models.ManyToManyField(Message, related_name='included_in_excerpts')
    reads_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class MessageReaction(models.Model):
    REACTION_CHOICES = [
        ('heart', 'Heart'),
        ('cap', 'Cap'),
        ('skull', 'Skull'),
        ('fire', 'Fire'),
    ]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user', 'reaction_type')

    def __str__(self):
        return f"{self.user.handle} reacted {self.reaction_type} on msg {self.message_id}"


class SavedExcerpt(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='saved_excerpts')
    excerpt = models.ForeignKey(PublicExcerpt, on_delete=models.CASCADE, related_name='saved_by')
    collection_name = models.CharField(max_length=100, default='All saved')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'excerpt')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.handle} saved {self.excerpt.title}"


class ExcerptSection(models.Model):
    excerpt = models.ForeignKey(PublicExcerpt, on_delete=models.CASCADE, related_name='sections')
    header = models.CharField(max_length=255, default='Part 1')
    topic_tag = models.CharField(max_length=50, default='#dating')
    order = models.PositiveIntegerField(default=0)
    messages = models.ManyToManyField(Message, related_name='excerpt_sections', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.excerpt.title} - {self.header} ({self.topic_tag})"


class PlatformBroadcast(models.Model):
    STYLE_CHOICES = [
        ('violet', 'Neon Violet'),
        ('cyan', 'Electric Cyan'),
        ('amber', 'Sunset Ember'),
        ('emerald', 'Emerald Green'),
    ]

    is_active = models.BooleanField(default=False)
    badge_text = models.CharField(max_length=50, default='ANNOUNCEMENT')
    message = models.CharField(max_length=300, default='Welcome to CCHAT — The Plot is Public!')
    style_variant = models.CharField(max_length=30, choices=STYLE_CHOICES, default='violet')
    action_label = models.CharField(max_length=50, blank=True, default="Explore Tonight's Picks")
    action_url = models.CharField(max_length=200, blank=True, default='/tonight')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        status = 'ACTIVE' if self.is_active else 'INACTIVE'
        return f"Broadcast [{status}]: {self.message[:30]}"


