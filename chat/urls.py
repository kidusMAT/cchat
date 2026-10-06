from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('report/conversation/<int:target_id>/', views.create_report, {'target_type': 'conversation'}, name='report_conversation'),
    path('report/message/<int:target_id>/', views.create_report, {'target_type': 'message'}, name='report_message'),
    path('moderation/reports/', views.moderation_reports, name='moderation_reports'),
    path('moderation/sponsorships/create/', views.create_sponsorship_request, name='create_sponsorship_request'),
    path('moderation/sponsorships/', views.list_sponsorship_requests, name='list_sponsorship_requests'),
    path('moderation/reports/<int:report_id>/action/', views.moderate_report, name='moderate_report'),
    path('block/<str:username>/', views.manage_block, name='manage_block'),
    path('blocks/', views.list_blocks, name='list_blocks'),
    path('polls/<int:poll_id>/vote/', views.vote_on_poll, name='vote_on_poll'),
    path('conversations/<int:conversation_id>/sponsorships/<int:sponsorship_id>/vote/', views.vote_on_sponsorship, name='vote_on_sponsorship'),
    # Authentication
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/google/', views.google_login, name='google_login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/change-password/', views.change_password, name='change_password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('account/deactivate/', views.deactivate_account, name='deactivate_account'),
    path('profile/<str:username>/', views.get_user_profile, name='get_user_profile'),
    path('profile/<str:username>/conversations/', views.get_profile_conversations, name='get_profile_conversations'),

    # Verification
    path('verification/apply/', views.apply_verification, name='apply_verification'),
    path('moderation/verification-requests/', views.moderation_verification_requests, name='moderation_verification_requests'),
    path('moderation/verification-requests/<int:profile_id>/review/', views.review_verification_request, name='review_verification_request'),
    
    # Follow
    path('follow/<str:username>/', views.follow_user, name='follow_user'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow_user'),
    path('check-following/<str:username>/', views.check_following, name='check_following'),
    
    # Chat Discovery
    path('stats/landing/', views.landing_stats, name='landing_stats'),
    path('chats/recommended/', views.get_recommended_chats, name='recommended_chats'),
    path('chats/following/', views.get_following_chats, name='following_chats'),
    path('search/users/', views.search_users, name='search_users'),
    path('search/conversations/', views.search_conversations, name='search_conversations'),
    path('search/', views.hybrid_message_search, name='hybrid_search'),
    
    # Conversations
    path('conversations/', views.get_user_conversations, name='user_conversations'),
    path('conversations/create/', views.create_conversation, name='create_conversation'),
    path('conversations/<int:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('conversations/<int:conversation_id>/toggle-visibility/', views.toggle_visibility, name='toggle_visibility'),
    path('conversations/<int:conversation_id>/react/', views.react_to_conversation, name='react-to-conversation'),
    path('conversations/<int:conversation_id>/bookmark/', views.toggle_bookmark, name='toggle-bookmark'),
    path('bookmarks/', views.get_user_bookmarks, name='user_bookmarks'),
    
    # Messages
    path('messages/send/', views.send_message, name='send_message'),
    path('messages/<int:message_id>/react/', views.react_to_message, name='react_to_message'),
    path('messages/<int:message_id>/comment/', views.add_message_comment, name='add_message_comment'),
    path('messages/<int:message_id>/remove-reaction/', views.remove_reaction, name='remove_reaction'),
    path('messages/<int:message_id>/view/', views.increment_view, name='increment_view'),
    path('messages/<int:message_id>/delete/', views.delete_message, name='delete_message'),
    path('comments/<int:comment_id>/delete/', views.delete_comment, name='delete_comment'),
    path('conversations/<int:conversation_id>/mark-read/', views.mark_messages_read, name='mark_messages_read'),
    
    # Posts
    path('posts/<str:username>/', views.get_user_posts, name='get_user_posts'),
    path('posts/create/', views.create_post, name='create_post'),
]
