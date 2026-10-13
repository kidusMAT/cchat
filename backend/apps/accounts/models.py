from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    handle = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    avatar_url = models.CharField(max_length=500, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.display_name} ({self.handle})"
