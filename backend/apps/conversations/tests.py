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

    def test_participant_can_send_message_with_attachment(self):
        self.client.force_authenticate(user=self.user_jules)
        res = self.client.post(f'/api/chats/{self.conv.id}/send_message/', {
            'text': 'Here is the diagram',
            'attachment_url': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
            'attachment_name': 'diagram.png',
            'attachment_type': 'image'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['attachment_name'], 'diagram.png')
        self.assertEqual(res.data['attachment_type'], 'image')
        self.assertTrue(res.data['attachment_url'].startswith('data:image/png'))

    def test_create_chat_with_attachment(self):
        self.client.force_authenticate(user=self.user_maya)
        res = self.client.post('/api/chats/', {
            'recipient_handle': '@jules_test',
            'text': 'Doc attached',
            'attachment_url': 'data:application/pdf;base64,JVBERi0xLjQK',
            'attachment_name': 'report.pdf',
            'attachment_type': 'document'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['messages'][0]['attachment_name'], 'report.pdf')
        self.assertEqual(res.data['messages'][0]['attachment_type'], 'document')

    def test_single_user_eye_publish_sections_and_anonymity(self):
        """When one user publishes with sections, partner is Anonymous until they also consent."""
        # Add messages from both Maya and Jules
        msg_jules = Message.objects.create(
            conversation=self.conv,
            sender=self.profile_jules,
            text='I brought a resume to our dinner',
        )

        # Maya clicks the Eye icon to make chat public with sections
        self.client.force_authenticate(user=self.user_maya)
        pub_res = self.client.post(f'/api/chats/{self.conv.id}/publish/', {
            'title': 'Dinner Date Lore',
            'topic': '#dating',
            'sections': [
                {
                    'header': 'The Setup',
                    'topic_tag': '#firstdates',
                    'message_ids': [self.msg.id]
                },
                {
                    'header': 'The Resume Reveal',
                    'topic_tag': '#careerlore',
                    'message_ids': [msg_jules.id]
                }
            ]
        }, format='json')

        self.assertEqual(pub_res.status_code, status.HTTP_200_OK)
        self.assertTrue(pub_res.data['published_by_me'])
        self.assertTrue(pub_res.data['partner_is_anonymous'])
        self.assertEqual(len(pub_res.data['sections']), 2)
        self.assertEqual(pub_res.data['sections'][0]['header'], 'The Setup')
        self.assertEqual(pub_res.data['sections'][1]['header'], 'The Resume Reveal')

        # Verify public excerpt feed anonymity
        public_client = APIClient()  # Unauthenticated public reader
        excerpt_res = public_client.get('/api/excerpts/')
        self.assertEqual(excerpt_res.status_code, status.HTTP_200_OK)
        excerpts = excerpt_res.data.get('results', excerpt_res.data)
        my_excerpt = next((e for e in excerpts if e['id'] == pub_res.data['excerpt_id']), None)
        self.assertIsNotNone(my_excerpt)

        # Maya is published (visible), Jules did not publish yet (anonymous)
        self.assertIn('@maya_test × Anonymous', my_excerpt['authors_summary'])

        # Verify messages inside excerpt: Jules message must be Anonymous
        jules_pub_msg = next(m for m in my_excerpt['messages'] if m['text'] == 'I brought a resume to our dinner')
        self.assertEqual(jules_pub_msg['sender_display'], 'Anonymous')
        self.assertIsNone(jules_pub_msg['sender_handle'])
        self.assertIsNone(jules_pub_msg['sender_avatar'])
        self.assertTrue(jules_pub_msg['is_anonymous'])

        # Verify Maya's message is visible
        maya_pub_msg = next(m for m in my_excerpt['messages'] if m['text'] == self.msg.text)
        self.assertEqual(maya_pub_msg['sender_display'], 'Maya Test')
        self.assertEqual(maya_pub_msg['sender_handle'], '@maya_test')

        # Test live sync: Jules sends a new message in this public chat
        self.client.force_authenticate(user=self.user_jules)
        send_res = self.client.post(f'/api/chats/{self.conv.id}/send_message/', {
            'text': 'And I brought references too!'
        }, format='json')
        self.assertEqual(send_res.status_code, status.HTTP_201_CREATED)

        # Check excerpt again: the new message is automatically public and anonymous
        excerpt_res2 = public_client.get(f"/api/excerpts/{pub_res.data['excerpt_id']}/")
        self.assertEqual(excerpt_res2.status_code, status.HTTP_200_OK)
        new_msg_in_excerpt = next(m for m in excerpt_res2.data['messages'] if 'references too' in m['text'])
        self.assertEqual(new_msg_in_excerpt['sender_display'], 'Anonymous')

        # Now Jules ALSO clicks the Eye icon to make it public from their end
        jules_pub_res = self.client.post(f'/api/chats/{self.conv.id}/publish/', {
            'title': 'Dinner Date Lore',
            'topic': '#dating'
        }, format='json')
        self.assertEqual(jules_pub_res.status_code, status.HTTP_200_OK)
        self.assertFalse(jules_pub_res.data['partner_is_anonymous'])

        # Check excerpt again: Now both Jules and Maya are visible!
        excerpt_res3 = public_client.get(f"/api/excerpts/{pub_res.data['excerpt_id']}/")
        self.assertIn('Maya Test & Jules Test', excerpt_res3.data['authors_summary'])
        jules_revealed_msg = next(m for m in excerpt_res3.data['messages'] if m['text'] == 'I brought a resume to our dinner')
        self.assertEqual(jules_revealed_msg['sender_display'], 'Jules Test')
        self.assertEqual(jules_revealed_msg['sender_handle'], '@jules_test')
        self.assertFalse(jules_revealed_msg['is_anonymous'])

