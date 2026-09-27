from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Conversation, SponsorshipRequest


class SponsorshipAndVerificationTests(TestCase):
    def setUp(self):
        self.staff = User.objects.create_user(username='staff', password='pw')
        self.staff.is_staff = True
        self.staff.save()
        self.u1 = User.objects.create_user(username='alice', password='pw')
        self.u2 = User.objects.create_user(username='bob', password='pw')
        self.conv = Conversation.objects.create()
        self.conv.participants.add(self.u1, self.u2)
        self.client = APIClient()

    def test_non_staff_cannot_create_sponsorship(self):
        self.client.force_authenticate(user=self.u1)
        res = self.client.post('/api/moderation/sponsorships/create/', {'conversation_id': self.conv.id, 'sponsor_name': 'Acme'}, format='json')
        self.assertEqual(res.status_code, 403)

    def test_staff_can_create_and_prevents_duplicate_pending(self):
        self.client.force_authenticate(user=self.staff)
        res = self.client.post('/api/moderation/sponsorships/create/', {'conversation_id': self.conv.id, 'sponsor_name': 'Acme'}, format='json')
        self.assertEqual(res.status_code, 201)
        sr = SponsorshipRequest.objects.get(conversation=self.conv)
        self.assertEqual(sr.user1, self.conv.participants.all()[0])
        self.assertEqual(sr.user2, self.conv.participants.all()[1])

        # second attempt should 400
        res2 = self.client.post('/api/moderation/sponsorships/create/', {'conversation_id': self.conv.id, 'sponsor_name': 'Acme2'}, format='json')
        self.assertEqual(res2.status_code, 400)

    def test_verification_apply_and_review(self):
        # user applies
        self.client.force_authenticate(user=self.u1)
        res = self.client.post('/api/verification/apply/', {'verification_text': 'I am public', 'verification_url': 'https://example.com'}, format='json')
        self.assertEqual(res.status_code, 202)
        self.u1.refresh_from_db()
        self.assertEqual(self.u1.profile.verification_status, 'PENDING')

        # non-staff cannot review
        res = self.client.post(f'/api/moderation/verification-requests/{self.u1.profile.id}/review/', {'action': 'approve'}, format='json')
        self.assertEqual(res.status_code, 403)

        # staff approves
        self.client.force_authenticate(user=self.staff)
        res = self.client.post(f'/api/moderation/verification-requests/{self.u1.profile.id}/review/', {'action': 'approve'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.u1.refresh_from_db()
        self.assertEqual(self.u1.profile.verification_status, 'VERIFIED')
