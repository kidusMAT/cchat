from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import UserProfile
from apps.conversations.models import Conversation, Message
from apps.publications.models import PublicExcerpt, Topic

class ConversationSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # User 1: Maya
        self.user_maya = User.objects.create_user('maya_test', 'maya@test.com', 'Pass123!')
        self.profile_maya = UserProfile.objects.create(
            user=self.user_maya, handle='@maya_test', display_name='Maya Test'
        )

        # User 2: Jules
        self.user_jules = User.objects.create_user('jules_test', 'jules@test.com', 'Pass123!')
        self.profile_jules = UserProfile.objects.create(
            user=self.user_jules, handle='@jules_test', display_name='Jules Test'
        )

        # User 3: Eve (Intruder)
        self.user_eve = User.objects.create_user('eve_test', 'eve@test.com', 'Pass123!')
        self.profile_eve = UserProfile.objects.create(
            user=self.user_eve, handle='@eve_test', display_name='Eve Intruder'
        )

        # Private conversation between Maya and Jules
        self.conv = Conversation.objects.create(
            title='Secret Planning',
            initials='SP',
            tag='PRIVATE'
        )
        self.conv.participants.add(self.profile_maya, self.profile_jules)

        self.msg = Message.objects.create(
            conversation=self.conv,
            sender=self.profile_maya,
            text='Top secret message only for Jules',
            is_excerpt_eligible=False
        )

    def test_unauthenticated_cannot_access_conversations(self):
        res = self.client.get('/api/chats/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_participant_can_view_conversation(self):
        self.client.force_authenticate(user=self.user_maya)
        res = self.client.get('/api/chats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in res.data.get('results', res.data)]
        self.assertIn(self.conv.id, ids)

    def test_non_participant_cannot_view_conversation_in_list(self):
        """Privacy verification: Eve cannot see Maya and Jules' conversation."""
        self.client.force_authenticate(user=self.user_eve)
        res = self.client.get('/api/chats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in res.data.get('results', res.data)]
        self.assertNotIn(self.conv.id, ids)

    def test_non_participant_cannot_retrieve_conversation_detail(self):
        """Direct ID access: Eve requesting Maya's conversation returns 404."""
        self.client.force_authenticate(user=self.user_eve)
        res = self.client.get(f'/api/chats/{self.conv.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_participant_can_send_message(self):
        self.client.force_authenticate(user=self.user_jules)
        res = self.client.post(f'/api/chats/{self.conv.id}/send_message/', {'text': 'Reply from Jules'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['sender_handle'], '@jules_test')
        self.assertEqual(res.data['text'], 'Reply from Jules')

    def test_non_participant_cannot_send_message(self):
        """Security: Non-participant cannot inject messages into private chats."""
        self.client.force_authenticate(user=self.user_eve)
        res = self.client.post(f'/api/chats/{self.conv.id}/send_message/', {'text': 'Eve hacking in'}, format='json')
        self.assertIn(res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_participant_can_publish_and_remove_excerpt(self):
        self.client.force_authenticate(user=self.user_maya)

        # Publish
        pub_res = self.client.post(f'/api/chats/{self.conv.id}/publish/', {
            'title': 'Public Excerpt Title',
            'topic': '#testtopic'
        }, format='json')
        self.assertEqual(pub_res.status_code, status.HTTP_200_OK)
        self.conv.refresh_from_db()
        self.assertEqual(self.conv.tag, 'PUBLISHED')

        # Remove publication
        unpub_res = self.client.post(f'/api/chats/{self.conv.id}/remove_publication/')
        self.assertEqual(unpub_res.status_code, status.HTTP_200_OK)
        self.conv.refresh_from_db()
        self.assertEqual(self.conv.tag, 'PRIVATE')

    def test_create_chat(self):
        self.client.force_authenticate(user=self.user_maya)
        res = self.client.post('/api/chats/', {
            'recipient_handle': '@jules_test',
            'text': 'Starting brand new chat',
            'title': 'Coffee Meetup'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'Coffee Meetup')
        self.assertEqual(len(res.data['messages']), 1)
        self.assertEqual(res.data['messages'][0]['text'], 'Starting brand new chat')
