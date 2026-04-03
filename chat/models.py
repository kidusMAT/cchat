from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import random
import string


class Profile(models.Model):
    """Extended user profile with social features"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    rank = models.IntegerField(default=0)
    followers_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    posts_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    def get_avatar_url(self):
        """Get avatar URL or generate default"""
        if self.avatar:
            return self.avatar.url
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create profile when user is created"""
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save profile when user is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


class Follow(models.Model):
    """Follow relationship between users"""
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class Conversation(models.Model):
    """Chat conversation between users"""
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    caps = models.IntegerField(default=0)
    smiles = models.IntegerField(default=0)
    views = models.IntegerField(default=0)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        users = list(self.participants.all()[:2])
        if len(users) == 2:
            return f"Chat: {users[0].username} & {users[1].username}"
        return f"Chat #{self.id}"

    def get_last_message(self):
        """Get the last message in this conversation"""
        return self.messages.first()

    def is_public_for_user(self, user):
        """Check if this conversation is public for a specific user"""
        try:
            visibility = ChatVisibility.objects.get(user=user, conversation=self)
            return visibility.is_public
        except ChatVisibility.DoesNotExist:
            return False

    def get_other_participant(self, user):
        """Get the other participant in a 2-person conversation"""
        participants = self.participants.exclude(id=user.id)
        return participants.first() if participants.exists() else None

    def increment_view(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])


class ConversationReaction(models.Model):
    """Track individual user reactions to conversations"""
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
        ('cap', 'Cap'),
        ('smile', 'Smile'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='conversation_reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('conversation', 'user', 'reaction_type')

    def __str__(self):
        return f"{self.user.username} {self.reaction_type}d conversation {self.conversation.id}"


class Message(models.Model):
    """Individual message in a conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('audio', 'Audio'),
        ('file', 'File'),
    )
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    caps = models.IntegerField(default=0)
    views = models.IntegerField(default=0)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.sender.username}: {self.text[:30]}"

    @property
    def dominant_reaction(self):
        """Get the dominant reaction type for background color"""
        reactions = {
            'like': self.likes,
            'dislike': self.dislikes,
            'cap': self.caps
        }
        if all(v == 0 for v in reactions.values()):
            return 'neutral'
        return max(reactions, key=reactions.get)

    def increment_view(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])


class MessageReaction(models.Model):
    """Track individual user reactions to messages"""
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
        ('cap', 'Cap'),
    ]
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')

    def __str__(self):
        return f"{self.user.username} {self.reaction_type}d message {self.message.id}"


class ChatVisibility(models.Model):
    """Controls whether a user's side of a conversation is public"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_visibilities')
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='visibilities')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'conversation')
        verbose_name_plural = 'Chat visibilities'

    def __str__(self):
        status = 'public' if self.is_public else 'private'
        return f"{self.user.username}'s chat in conversation {self.conversation.id} is {status}"


class AnonymousProfile(models.Model):
    """Generated anonymous profile for one-sided public chats"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='anonymous_profiles')
    original_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='anonymous_profiles')
    fake_username = models.CharField(max_length=150)
    fake_avatar_seed = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('conversation', 'original_user')

    def __str__(self):
        return f"Anonymous: {self.fake_username} (actually {self.original_user.username})"

    def get_avatar_url(self):
        """Get anonymous avatar URL"""
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.fake_avatar_seed}"

    @staticmethod
    def generate_fake_username():
        """Return a static anonymous username"""
        return "Anonymous"

    @staticmethod
    def generate_fake_avatar_seed():
        """Generate a random seed for avatar"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=20))

    @classmethod
    def get_or_create_for_user(cls, conversation, user):
        """Get existing or create new anonymous profile"""
        anonymous, created = cls.objects.get_or_create(
            conversation=conversation,
            original_user=user,
            defaults={
                'fake_username': cls.generate_fake_username(),
                'fake_avatar_seed': cls.generate_fake_avatar_seed()
            }
        )
        return anonymous


class Post(models.Model):
    """User posts for profile display"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.IntegerField(default=0)
    views = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.title}"
