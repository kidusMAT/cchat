from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import UserProfile
from apps.moderation.models import Report, PrivacyRequest

class ModerationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('mod_user', 'mod@test.com', 'Pass123!')
        self.profile = UserProfile.objects.create(
            user=self.user, handle='@mod_user', display_name='Mod User'
        )

    def test_submit_report_authenticated(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'reason': 'Harassment or spam',
            'context': 'User is sending abusive unsolicited messages in chat.'
        }
        res = self.client.post('/api/moderation/report/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Report.objects.filter(reporter=self.profile).exists())

    def test_submit_report_anonymous(self):
        payload = {
            'reason': 'Content violation',
            'context': 'Public excerpt contains sensitive personal information.'
        }
        res = self.client.post('/api/moderation/report/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Report.objects.filter(context=payload['context']).exists())

    def test_submit_privacy_request(self):
        payload = {
            'email': 'requester@example.com',
            'request_type': 'Account data deletion',
            'details': 'Please erase all personal data associated with my account.'
        }
        res = self.client.post('/api/privacy/request/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(PrivacyRequest.objects.filter(email='requester@example.com').exists())
