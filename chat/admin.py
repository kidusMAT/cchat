from django.contrib import admin
from .models import Profile, Follow, Conversation, Message, MessageReaction, ChatVisibility, AnonymousProfile, Post


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'rank', 'followers_count', 'following_count', 'posts_count']
    search_fields = ['user__username']


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'following', 'created_at']
    search_fields = ['follower__username', 'following__username']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'updated_at']
    filter_horizontal = ['participants']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'conversation', 'text', 'likes', 'dislikes', 'caps', 'views', 'timestamp']
    search_fields = ['sender__username', 'text']
    list_filter = ['timestamp']


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'reaction_type', 'created_at']
    list_filter = ['reaction_type']


@admin.register(ChatVisibility)
class ChatVisibilityAdmin(admin.ModelAdmin):
    list_display = ['user', 'conversation', 'is_public', 'updated_at']
    list_filter = ['is_public']


@admin.register(AnonymousProfile)
class AnonymousProfileAdmin(admin.ModelAdmin):
    list_display = ['fake_username', 'original_user', 'conversation', 'created_at']
    search_fields = ['fake_username', 'original_user__username']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'likes', 'views', 'created_at']
    search_fields = ['user__username', 'title', 'content']
    list_filter = ['created_at']
