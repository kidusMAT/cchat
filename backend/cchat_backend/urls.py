from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.accounts.views import MeView, UserProfileViewSet
from apps.conversations.views import ConversationViewSet
from apps.publications.views import (
    PublicExcerptViewSet,
    TopicViewSet,
    SavedExcerptViewSet,
    react_message,
)
from apps.moderation.views import SubmitReportView
from apps.sponsorship.views import SubmitInquiryView, AfterHoursDetailView

router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='user')
router.register(r'chats', ConversationViewSet, basename='chat')
router.register(r'excerpts', PublicExcerptViewSet, basename='excerpt')
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'saved', SavedExcerptViewSet, basename='saved')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/me/', MeView.as_view(), name='auth-me'),
    path('api/excerpts/messages/<int:msg_id>/react/', react_message, name='message-react'),
    path('api/moderation/report/', SubmitReportView.as_view(), name='submit-report'),
    path('api/sponsorship/inquiry/', SubmitInquiryView.as_view(), name='submit-inquiry'),
    path('api/sponsorship/after-hours/', AfterHoursDetailView.as_view(), name='after-hours-detail'),
    path('api/', include(router.urls)),
]
