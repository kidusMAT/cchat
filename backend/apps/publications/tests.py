from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import UserProfile
from apps.conversations.models import Conversation, Message
from apps.publications.models import Topic, PublicExcerpt, SavedExcerpt

class PublicationsSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.user = User.objects.create_user('pub_user', 'pub@test.com', 'Pass123!')
        self.profile = UserProfile.objects.create(
            user=self.user, handle='@pub_user', display_name='Pub User'
        )

        self.author_user = User.objects.create_user('author_user', 'author@test.com', 'Pass123!')
        self.author_profile = UserProfile.objects.create(
            user=self.author_user, handle='@author_user', display_name='Author'
        )

        # Conversation 1: Published with active excerpt
        self.conv_pub = Conversation.objects.create(title='Public Chat', tag='PUBLISHED')
        self.conv_pub.participants.add(self.author_profile)

        self.topic = Topic.objects.create(tag='#trending', name='Trending Topics', chats_count=10)

        self.public_msg = Message.objects.create(
            conversation=self.conv_pub,
            sender=self.author_profile,
            text='This is a public excerpt message',
            is_excerpt_eligible=True
        )

        self.excerpt = PublicExcerpt.objects.create(
            conversation=self.conv_pub,
            title='Featured Public Story',
            topic=self.topic,
            is_active=True
        )
        self.excerpt.publishers.add(self.author_profile)
        self.excerpt.messages.add(self.public_msg)

        # Conversation 2: Strictly private conversation
        self.conv_priv = Conversation.objects.create(title='Private Secret Chat', tag='PRIVATE')
        self.conv_priv.participants.add(self.author_profile)

        self.private_msg = Message.objects.create(
            conversation=self.conv_priv,
            sender=self.author_profile,
            text='Private confidential message never published',
            is_excerpt_eligible=False
        )

    def test_anonymous_can_read_public_excerpts(self):
        res = self.client.get('/api/excerpts/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        self.assertGreaterEqual(len(results), 1)

    def test_react_on_public_excerpt_message_succeeds(self):
        """Authenticated user can react to message that belongs to an active excerpt."""
        self.client.force_authenticate(user=self.user)
        res = self.client.post(
            f'/api/excerpts/messages/{self.public_msg.id}/react/',
            {'type': 'heart'},
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['heart'], 1)
        self.assertEqual(res.data['user_reacted'], 'heart')

    def test_react_on_private_message_is_forbidden(self):
        """
        SECURITY CRITICAL:
        Users CANNOT react to arbitrary message IDs if the message does not
        belong to an active public excerpt. Returns 403 Forbidden.
        """
        self.client.force_authenticate(user=self.user)
        res = self.client.post(
            f'/api/excerpts/messages/{self.private_msg.id}/react/',
            {'type': 'heart'},
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('strictly forbidden', res.data['detail'])

    def test_unauthenticated_cannot_react(self):
        res = self.client.post(
            f'/api/excerpts/messages/{self.public_msg.id}/react/',
            {'type': 'heart'},
            format='json'
        )
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_toggle_save_excerpt_per_user(self):
        self.client.force_authenticate(user=self.user)

        # Save
        res = self.client.post(f'/api/excerpts/{self.excerpt.id}/toggle_save/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['saved'])
        self.assertTrue(SavedExcerpt.objects.filter(user=self.profile, excerpt=self.excerpt).exists())

        # Check saved list
        saved_list = self.client.get('/api/saved/')
        self.assertEqual(saved_list.status_code, status.HTTP_200_OK)
        results = saved_list.data.get('results', saved_list.data)
        self.assertEqual(len(results), 1)

        # Unsave
        res_unsave = self.client.post(f'/api/excerpts/{self.excerpt.id}/toggle_save/')
        self.assertEqual(res_unsave.status_code, status.HTTP_200_OK)
        self.assertFalse(res_unsave.data['saved'])
        self.assertFalse(SavedExcerpt.objects.filter(user=self.profile, excerpt=self.excerpt).exists())

    def test_broadcast_endpoints_and_admin_security(self):
        from apps.publications.models import PlatformBroadcast

        # 1. Anonymous get broadcast when inactive
        res = self.client.get('/api/broadcast/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data.get('is_active'))

        # 2. Non-staff user cannot access or update admin broadcast
        self.client.force_authenticate(user=self.user)
        res_forbidden = self.client.get('/api/admin/broadcast/')
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        res_post_forbidden = self.client.post('/api/admin/broadcast/', {'is_active': True}, format='json')
        self.assertEqual(res_post_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Staff user can view and update broadcast
        staff_user = User.objects.create_superuser('admin_staff', 'staff@test.com', 'Pass123!')
        self.client.force_authenticate(user=staff_user)

        res_admin_get = self.client.get('/api/admin/broadcast/')
        self.assertEqual(res_admin_get.status_code, status.HTTP_200_OK)

        res_admin_update = self.client.post('/api/admin/broadcast/', {
            'is_active': True,
            'badge_text': 'PROMO',
            'message': 'Tonight exclusive drops are live!',
            'style_variant': 'emerald',
            'action_label': 'View Now',
            'action_url': '/tonight',
        }, format='json')
        self.assertEqual(res_admin_update.status_code, status.HTTP_200_OK)
        self.assertTrue(res_admin_update.data['is_active'])
        self.assertEqual(res_admin_update.data['badge_text'], 'PROMO')

        # 4. Anonymous can now see active broadcast
        self.client.logout()
        res_active = self.client.get('/api/broadcast/')
        self.assertEqual(res_active.status_code, status.HTTP_200_OK)
        self.assertTrue(res_active.data['is_active'])
        self.assertEqual(res_active.data['badge_text'], 'PROMO')

    def test_admin_stats_includes_reactions_and_inquiries(self):
        staff_user = User.objects.create_superuser('admin_staff_stats', 'stats@test.com', 'Pass123!')
        self.client.force_authenticate(user=staff_user)

        res = self.client.get('/api/admin/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('reactions_breakdown', res.data)
        self.assertIn('inquiries_summary', res.data)
        self.assertIn('heart', res.data['reactions_breakdown'])
        self.assertIn('cap', res.data['reactions_breakdown'])
        self.assertIn('pending', res.data['inquiries_summary'])

