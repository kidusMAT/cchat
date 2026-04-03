from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/google/', views.google_login, name='google_login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/<str:username>/', views.get_user_profile, name='get_user_profile'),
    
    # Follow
    path('follow/<str:username>/', views.follow_user, name='follow_user'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow_user'),
    path('check-following/<str:username>/', views.check_following, name='check_following'),
    
    # Chat Discovery
    path('chats/recommended/', views.get_recommended_chats, name='recommended_chats'),
    path('chats/following/', views.get_following_chats, name='following_chats'),
    path('search/users/', views.search_users, name='search_users'),
    
    # Conversations
    path('conversations/', views.get_user_conversations, name='user_conversations'),
    path('conversations/create/', views.create_conversation, name='create_conversation'),
    path('conversations/<int:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('conversations/<int:conversation_id>/toggle-visibility/', views.toggle_visibility, name='toggle_visibility'),
    path('conversations/<int:conversation_id>/react/', views.react_to_conversation, name='react-to-conversation'),
    
    # Messages
    path('messages/send/', views.send_message, name='send_message'),
    path('messages/<int:message_id>/react/', views.react_to_message, name='react_to_message'),
    path('messages/<int:message_id>/remove-reaction/', views.remove_reaction, name='remove_reaction'),
    path('messages/<int:message_id>/view/', views.increment_view, name='increment_view'),
    path('conversations/<int:conversation_id>/mark-read/', views.mark_messages_read, name='mark_messages_read'),
    
    # Posts
    path('posts/<str:username>/', views.get_user_posts, name='get_user_posts'),
    path('posts/create/', views.create_post, name='create_post'),
]
