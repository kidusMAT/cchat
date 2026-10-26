from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


def generate_ticket_token():
    return uuid.uuid4().hex


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    handle = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    avatar_url = models.CharField(max_length=500, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', blank=True)

    def __str__(self):
        return f"{self.display_name} ({self.handle})"


class GoogleIdentity(models.Model):
    """A verified Google subject linked to exactly one local account."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_identity')
    subject = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)


class OAuthLoginTicket(models.Model):
    """Short-lived, single-use bridge between the OAuth callback and the SPA."""
    token = models.CharField(max_length=64, unique=True, default=generate_ticket_token, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='oauth_login_tickets')
    expires_at = models.DateTimeField(db_index=True)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_usable(self):
        return self.used_at is None and self.expires_at > timezone.now()
