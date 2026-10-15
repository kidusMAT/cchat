from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    MeView,
    RegisterView,
    LoginView,
    DemoLoginView,
    LogoutView,
    UserProfileViewSet,
)
from apps.conversations.views import ConversationViewSet
from apps.publications.views import (
    PublicExcerptViewSet,
    TopicViewSet,
    SavedExcerptViewSet,
    react_message,
)
from apps.moderation.views import SubmitReportView, SubmitPrivacyRequestView
from apps.sponsorship.views import SubmitInquiryView, AfterHoursDetailView

router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='user')
router.register(r'chats', ConversationViewSet, basename='chat')
router.register(r'excerpts', PublicExcerptViewSet, basename='excerpt')
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'saved', SavedExcerptViewSet, basename='saved')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth routes
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/auth/demo-login/', DemoLoginView.as_view(), name='auth-demo-login'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/auth/me/', MeView.as_view(), name='auth-me'),

    # Excerpt & message reactions
    path('api/excerpts/messages/<int:msg_id>/react/', react_message, name='message-react'),

    # Moderation & Privacy
    path('api/moderation/report/', SubmitReportView.as_view(), name='submit-report'),
    path('api/privacy/request/', SubmitPrivacyRequestView.as_view(), name='submit-privacy-request'),

    # Sponsorship
    path('api/sponsorship/inquiry/', SubmitInquiryView.as_view(), name='submit-inquiry'),
    path('api/sponsorship/after-hours/', AfterHoursDetailView.as_view(), name='after-hours-detail'),

    # ViewSet routes
    path('api/', include(router.urls)),
]
