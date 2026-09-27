from unittest.mock import Mock, patch

from asgiref.sync import async_to_sync
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .consumers import ChatConsumer
from .models import (
    AnonymousProfile, ChatVisibility, Conversation, Follow, Message,
    MessageComment, MessagePoll, PollVote, SponsorshipRequest, Report, Block,
)


class CChatAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user('alice', email='alice@example.com', password='password123')
        self.bob = User.objects.create_user('bob', email='bob@example.com', password='password123')
        self.eve = User.objects.create_user('eve', email='eve@example.com', password='password123')
        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.alice, self.bob)
        ChatVisibility.objects.create(user=self.alice, conversation=self.conversation)
        ChatVisibility.objects.create(user=self.bob, conversation=self.conversation)
        self.message = Message.objects.create(conversation=self.conversation, sender=self.alice, text='hello')

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_register_login_and_rotated_refresh_token_is_blacklisted(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'new-user', 'email': 'new@example.com',
            'password': 'password123', 'password2': 'password123',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        response = self.client.post('/api/auth/login/', {
            'username': 'new-user', 'password': 'password123',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        original_refresh = response.data['tokens']['refresh']
        rotated = self.client.post('/api/auth/token/refresh/', {'refresh': original_refresh}, format='json')
        self.assertEqual(rotated.status_code, 200)
        reused = self.client.post('/api/auth/token/refresh/', {'refresh': original_refresh}, format='json')
        self.assertEqual(reused.status_code, 401)

    @patch('chat.views.urllib.request.urlopen')
    def test_google_login_can_be_tested_without_google_credentials(self, mock_urlopen):
        response = Mock()
        response.read.return_value = b'{"email":"google@example.com","given_name":"G","family_name":"User"}'
        mock_urlopen.return_value = response
        result = self.client.post('/api/auth/google/', {'token': 'fake-access-token'}, format='json')
        self.assertEqual(result.status_code, 200)
        self.assertTrue(User.objects.filter(email='google@example.com').exists())

    def test_private_conversation_is_not_readable_by_non_participant(self):
        self.authenticate(self.eve)
        response = self.client.get(f'/api/conversations/{self.conversation.id}/')
        self.assertEqual(response.status_code, 403)

    def test_authenticated_nonparticipant_cannot_read_private_conversation_detail(self):
        """The detail endpoint must not expose a private room by guessed id."""
        self.authenticate(self.eve)
        response = self.client.get(f'/api/conversations/{self.conversation.pk}/')
        self.assertEqual(response.status_code, 403)
        self.assertNotIn('messages', response.data)

    def test_public_conversation_masks_the_private_side(self):
        ChatVisibility.objects.filter(conversation=self.conversation, user=self.alice).update(is_public=True)
        self.authenticate(self.eve)
        response = self.client.get(f'/api/conversations/{self.conversation.id}/')
        self.assertEqual(response.status_code, 200)
        participants = {p['id']: p for p in response.data['conversation']['participants']}
        self.assertFalse(participants[self.bob.id]['is_public'])
        self.assertTrue(participants[self.bob.id]['is_anonymous'])
        self.assertEqual(participants[self.bob.id]['username'], 'Anonymous')
        self.assertEqual(participants[self.alice.id]['username'], 'alice')
        self.assertEqual(response.data['messages'][0]['sender_username'], 'alice')
        self.assertTrue(AnonymousProfile.objects.filter(conversation=self.conversation, original_user=self.bob).exists())

    def test_participant_can_toggle_visibility_and_nonparticipant_cannot(self):
        self.authenticate(self.eve)
        denied = self.client.post(f'/api/conversations/{self.conversation.id}/toggle-visibility/')
        self.assertEqual(denied.status_code, 403)
        self.authenticate(self.alice)
        enabled = self.client.post(f'/api/conversations/{self.conversation.id}/toggle-visibility/')
        self.assertEqual(enabled.status_code, 200)
        self.assertTrue(enabled.data['is_public'])

    def test_default_visibility_preference_and_account_deactivation(self):
        self.alice.profile.default_conversations_public = True
        self.alice.profile.save()
        self.authenticate(self.alice)
        created = self.client.post('/api/conversations/create/', {'username': 'eve'}, format='json')
        self.assertEqual(created.status_code, 201)
        self.assertTrue(ChatVisibility.objects.get(user=self.alice, conversation_id=created.data['id']).is_public)
        self.assertFalse(ChatVisibility.objects.get(user=self.eve, conversation_id=created.data['id']).is_public)
        self.assertEqual(self.client.post('/api/account/deactivate/', {}, format='json').status_code, 200)
        self.alice.refresh_from_db()
        self.assertFalse(self.alice.is_active)
        self.assertFalse(ChatVisibility.objects.get(user=self.alice, conversation_id=created.data['id']).is_public)
        self.assertTrue(Conversation.objects.filter(id=created.data['id']).exists())

    def test_message_lifecycle_and_participant_permissions(self):
        self.authenticate(self.eve)
        self.assertEqual(self.client.post('/api/messages/send/', {'conversation_id': self.conversation.id, 'text': 'intrusion'}, format='json').status_code, 403)
        self.authenticate(self.alice)
        created = self.client.post('/api/messages/send/', {'conversation_id': self.conversation.id, 'text': 'new message'}, format='json')
        self.assertEqual(created.status_code, 201)
        new_message = Message.objects.get(id=created.data['id'])
        self.assertEqual(new_message.text, 'new message')
        consumer = ChatConsumer()
        consumer.user = self.alice
        self.assertTrue(async_to_sync(consumer.edit_message_from_db)(new_message.id, 'edited message'))
        new_message.refresh_from_db()
        self.assertEqual(new_message.text, 'edited message')
        consumer.user = self.eve
        self.assertFalse(async_to_sync(consumer.edit_message_from_db)(new_message.id, 'intruded edit'))
        self.assertEqual(self.client.delete(f'/api/messages/{new_message.id}/delete/').status_code, 204)

    def test_private_message_reactions_and_comments_are_protected(self):
        self.authenticate(self.eve)
        self.assertEqual(self.client.post(f'/api/messages/{self.message.id}/react/', {'reaction_type': 'like'}, format='json').status_code, 403)
        self.assertEqual(self.client.post(f'/api/messages/{self.message.id}/comment/', {'text': 'nope'}, format='json').status_code, 403)
        ChatVisibility.objects.filter(conversation=self.conversation, user=self.alice).update(is_public=True)
        self.assertEqual(self.client.post(f'/api/messages/{self.message.id}/react/', {'reaction_type': 'like'}, format='json').status_code, 200)
        comment = self.client.post(f'/api/messages/{self.message.id}/comment/', {'text': 'public thought'}, format='json')
        self.assertEqual(comment.status_code, 201)
        self.assertTrue(MessageComment.objects.filter(id=comment.data['id']).exists())

    def test_follow_counts_stay_in_sync(self):
        self.authenticate(self.alice)
        self.assertEqual(self.client.post('/api/follow/bob/').status_code, 201)
        self.alice.profile.refresh_from_db()
        self.bob.profile.refresh_from_db()
        self.assertEqual(Follow.objects.count(), 1)
        self.assertEqual(self.alice.profile.following_count, 1)
        self.assertEqual(self.bob.profile.followers_count, 1)
        self.assertEqual(self.client.post('/api/follow/bob/').status_code, 200)
        self.assertEqual(self.client.delete('/api/unfollow/bob/').status_code, 200)
        self.alice.profile.refresh_from_db()
        self.bob.profile.refresh_from_db()
        self.assertEqual(Follow.objects.count(), 0)
        self.assertEqual(self.alice.profile.following_count, 0)
        self.assertEqual(self.bob.profile.followers_count, 0)

    def test_search_is_case_insensitive_partial_and_does_not_expose_password(self):
        self.authenticate(self.eve)
        response = self.client.get('/api/search/users/?q=LIC')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([u['username'] for u in response.data], ['alice'])
        self.assertNotIn('password', response.data[0])

    def test_public_profile_conversations_exclude_private_and_mutually_blocked(self):
        ChatVisibility.objects.filter(conversation=self.conversation, user=self.alice).update(is_public=True)
        private = Conversation.objects.create()
        private.participants.add(self.alice, self.eve)
        ChatVisibility.objects.create(user=self.alice, conversation=private, is_public=False)
        ChatVisibility.objects.create(user=self.eve, conversation=private, is_public=True)
        self.assertEqual(self.client.get('/api/profile/alice/conversations/').status_code, 200)
        self.assertEqual([item['id'] for item in self.client.get('/api/profile/alice/conversations/').data], [self.conversation.id])
        self.authenticate(self.eve)
        self.client.post('/api/block/alice/')
        self.assertEqual(self.client.get('/api/profile/alice/conversations/').data, [])

    def test_conversation_search_never_returns_private_content(self):
        ChatVisibility.objects.filter(conversation=self.conversation, user=self.alice).update(is_public=True)
        Message.objects.create(conversation=self.conversation, sender=self.alice, text='public keyword')
        private = Conversation.objects.create()
        private.participants.add(self.alice, self.eve)
        ChatVisibility.objects.create(user=self.alice, conversation=private, is_public=False)
        ChatVisibility.objects.create(user=self.eve, conversation=private, is_public=False)
        Message.objects.create(conversation=private, sender=self.alice, text='secret keyword')
        public = self.client.get('/api/search/conversations/?q=keyword')
        self.assertEqual(public.status_code, 200)
        self.assertEqual([item['conversation_id'] for item in public.data], [self.conversation.id])
        self.assertNotIn('secret keyword', str(public.data))

    def test_poll_vote_is_one_per_user(self):
        poll_message = Message.objects.create(conversation=self.conversation, sender=self.alice, text='poll', message_type='poll')
        poll = MessagePoll.objects.create(message=poll_message, question='?', option_a='yes', option_b='no')
        consumer = ChatConsumer()
        consumer.chat_id = self.conversation.id
        self.assertIsNotNone(async_to_sync(consumer.save_poll_vote)(self.bob.id, poll.id, 'A'))
        self.assertIsNone(async_to_sync(consumer.save_poll_vote)(self.bob.id, poll.id, 'B'))
        self.assertEqual(PollVote.objects.filter(poll=poll, user=self.bob).count(), 1)
        poll.refresh_from_db()
        self.assertEqual((poll.votes_a, poll.votes_b), (1, 0))
        self.authenticate(self.alice)
        self.assertEqual(self.client.post(f'/api/polls/{poll.id}/vote/', {'option': 'A'}, format='json').status_code, 201)
        duplicate = self.client.post(f'/api/polls/{poll.id}/vote/', {'option': 'B'}, format='json')
        self.assertEqual(duplicate.status_code, 409)
        poll.refresh_from_db()
        self.assertEqual((poll.votes_a, poll.votes_b), (2, 0))

    def test_sponsorship_requires_both_acceptances_and_rejection_is_not_active(self):
        sponsorship = SponsorshipRequest.objects.create(conversation=self.conversation, sponsor_name='Brand', sponsor_text='Ad', user1=self.alice, user2=self.bob)
        consumer = ChatConsumer()
        consumer.chat_id = self.conversation.id
        async_to_sync(consumer.handle_sponsorship_vote)(self.alice.id, sponsorship.id, True)
        sponsorship.refresh_from_db()
        self.assertTrue(sponsorship.user1_accepted)
        self.assertFalse(sponsorship.user2_accepted)
        self.assertFalse(sponsorship.user1_accepted and sponsorship.user2_accepted)
        self.authenticate(self.eve)
        self.assertEqual(self.client.post(f'/api/conversations/{self.conversation.id}/sponsorships/{sponsorship.id}/vote/', {'accepted': True}, format='json').status_code, 403)
        self.authenticate(self.alice)
        first = self.client.post(f'/api/conversations/{self.conversation.id}/sponsorships/{sponsorship.id}/vote/', {'accepted': True}, format='json')
        self.assertFalse(first.data['active'])
        self.authenticate(self.bob)
        second = self.client.post(f'/api/conversations/{self.conversation.id}/sponsorships/{sponsorship.id}/vote/', {'accepted': True}, format='json')
        self.assertTrue(second.data['active'])
        async_to_sync(consumer.handle_sponsorship_vote)(self.bob.id, sponsorship.id, False)
        sponsorship.refresh_from_db()
        self.assertFalse(sponsorship.user2_accepted)
        self.assertFalse(sponsorship.user1_accepted and sponsorship.user2_accepted)
        async_to_sync(consumer.handle_sponsorship_vote)(self.bob.id, sponsorship.id, True)
        sponsorship.refresh_from_db()
        self.assertTrue(sponsorship.user1_accepted and sponsorship.user2_accepted)
        async_to_sync(consumer.handle_sponsorship_vote)(self.alice.id, sponsorship.id, False)
        sponsorship.refresh_from_db()
        self.assertFalse(sponsorship.user1_accepted and sponsorship.user2_accepted)

    def test_nonparticipant_can_report_conversation_and_message(self):
        self.authenticate(self.eve)
        c = self.client.post(f'/api/report/conversation/{self.conversation.id}/', {'reason': 'harassment', 'detail': 'context'}, format='json')
        m = self.client.post(f'/api/report/message/{self.message.id}/', {'reason': 'doxxing'}, format='json')
        self.assertEqual(c.status_code, 201)
        self.assertEqual(m.status_code, 201)
        self.assertEqual(Report.objects.filter(reporter=self.eve).count(), 2)

    def test_moderation_is_staff_only_and_remove_hides_content(self):
        self.authenticate(self.eve)
        message_conversation = Conversation.objects.create()
        message_conversation.participants.add(self.alice, self.bob)
        ChatVisibility.objects.create(user=self.alice, conversation=message_conversation, is_public=False)
        ChatVisibility.objects.create(user=self.bob, conversation=message_conversation, is_public=False)
        message = Message.objects.create(conversation=message_conversation, sender=self.alice, text='to remove')
        report = self.client.post(f'/api/report/conversation/{self.conversation.id}/', {'reason': 'other'}, format='json')
        message_report = self.client.post(f'/api/report/message/{message.id}/', {'reason': 'other'}, format='json')
        self.assertEqual(self.client.get('/api/moderation/reports/').status_code, 403)
        self.assertEqual(self.client.post(f"/api/moderation/reports/{report.data['id']}/action/", {'action': 'remove_content'}, format='json').status_code, 403)
        staff = User.objects.create_superuser('staff', 'staff@example.com', 'password123')
        self.authenticate(staff)
        self.assertEqual(self.client.post(f"/api/moderation/reports/{message_report.data['id']}/action/", {'action': 'remove_content'}, format='json').status_code, 200)
        self.assertEqual(self.client.post(f"/api/moderation/reports/{report.data['id']}/action/", {'action': 'remove_content'}, format='json').status_code, 200)
        self.authenticate(self.eve)
        self.assertEqual(self.client.get(f'/api/conversations/{self.conversation.id}/').status_code, 404)
        self.authenticate(self.alice)
        self.assertEqual(self.client.get(f'/api/conversations/{message_conversation.id}/').data['messages'], [])

    def test_blocks_hide_public_content_and_profiles_both_directions(self):
        ChatVisibility.objects.filter(conversation=self.conversation, user=self.alice).update(is_public=True)
        reverse_conversation = Conversation.objects.create()
        reverse_conversation.participants.add(self.eve, self.alice)
        ChatVisibility.objects.create(user=self.eve, conversation=reverse_conversation, is_public=True)
        ChatVisibility.objects.create(user=self.alice, conversation=reverse_conversation, is_public=False)
        self.authenticate(self.eve)
        self.client.post('/api/follow/alice/')
        self.assertEqual(self.client.post('/api/block/alice/').status_code, 201)
        self.assertEqual(len(self.client.get('/api/blocks/').data), 1)
        self.assertEqual(self.client.get(f'/api/conversations/{self.conversation.id}/').status_code, 404)
        self.assertEqual(self.client.get('/api/search/users/?q=alice').data, [])
        self.assertEqual(self.client.get('/api/profile/alice/').status_code, 404)
        self.assertNotIn(self.conversation.id, [row['conversation_id'] for row in self.client.get('/api/chats/recommended/').data])
        self.assertEqual(self.client.get('/api/chats/following/').data, [])
        # The blocker is also hidden from the blocked account.
        self.authenticate(self.alice)
        self.assertEqual(self.client.get('/api/conversations/%s/' % reverse_conversation.id).status_code, 404)
        self.assertEqual(self.client.get('/api/profile/eve/').status_code, 404)
        self.assertEqual(self.client.get('/api/search/users/?q=eve').data, [])
        self.assertNotIn(reverse_conversation.id, [row['conversation_id'] for row in self.client.get('/api/chats/recommended/').data])
class JWTBlacklistConfigurationTest(TestCase):
    def test_blacklist_app_is_installed(self):
        from django.conf import settings
        self.assertIn('rest_framework_simplejwt.token_blacklist', settings.INSTALLED_APPS)


