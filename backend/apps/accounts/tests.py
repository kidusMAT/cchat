from django.test import TestCase
from django.test.utils import override_settings
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
import datetime
import json
import io

from apps.accounts.models import UserProfile, GoogleIdentity, OAuthLoginTicket


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Password123!'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            handle='@testuser',
            display_name='Test User',
            bio='Test bio'
        )

    def test_register_success(self):
        payload = {
            'username': 'newuser',
            'password': 'Password123!',
            'email': 'new@example.com',
            'handle': '@newuser',
            'display_name': 'New User',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['handle'], '@newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_duplicate_handle(self):
        payload = {
            'username': 'anotheruser',
            'password': 'Password123!',
            'handle': '@testuser',  # already taken
            'display_name': 'Another User',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        payload = {'username': 'testuser', 'password': 'Password123!'}
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['handle'], '@testuser')

    def test_login_invalid_password(self):
        payload = {'username': 'testuser', 'password': 'WrongPassword'}
        response = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_demo_login(self):
        response = self.client.post('/api/auth/demo-login/', {'identifier': 'testuser'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['handle'], '@testuser')

    @override_settings(DEMO_LOGIN_ENABLED=False)
    def test_demo_login_is_unavailable_when_disabled(self):
        response = self.client.post('/api/auth/demo-login/', {'identifier': 'testuser'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_me_unauthenticated_returns_401(self):
        response = self.client.get('/api/auth/me/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_me_authenticated_returns_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['handle'], '@testuser')
        self.assertEqual(response.data['display_name'], 'Test User')

    def test_logout(self):
        login_res = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'Password123!'}, format='json')
        token = login_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

        logout_res = self.client.post('/api/auth/logout/')
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

        # Trying to access me with old token should fail
        me_res = self.client.get('/api/auth/me/')
        self.assertEqual(me_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile_lookup_variations(self):
        other_user = User.objects.create_user(username='otheruser', password='Password123!')
        other_profile = UserProfile.objects.create(
            user=other_user,
            handle='@otheruser',
            display_name='Other User',
            bio='Other bio'
        )

        # Lookup by ID
        res_id = self.client.get(f'/api/users/{other_profile.id}/')
        self.assertEqual(res_id.status_code, status.HTTP_200_OK)
        self.assertEqual(res_id.data['handle'], '@otheruser')

        # Lookup by @handle
        res_handle = self.client.get('/api/users/@otheruser/')
        self.assertEqual(res_handle.status_code, status.HTTP_200_OK)
        self.assertEqual(res_handle.data['display_name'], 'Other User')

        # Lookup by handle without @
        res_plain = self.client.get('/api/users/otheruser/')
        self.assertEqual(res_plain.status_code, status.HTTP_200_OK)
        self.assertEqual(res_plain.data['display_name'], 'Other User')

    def test_view_other_profile_is_following(self):
        other_user = User.objects.create_user(username='creator', password='Password123!')
        other_profile = UserProfile.objects.create(
            user=other_user,
            handle='@creator',
            display_name='Creative Mind'
        )

        self.client.force_authenticate(user=self.user)
        # Not following yet
        res = self.client.get(f'/api/users/{other_profile.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['is_following'])

        # Toggle follow
        follow_res = self.client.post(f'/api/users/{other_profile.id}/toggle_follow/')
        self.assertEqual(follow_res.status_code, status.HTTP_200_OK)
        self.assertTrue(follow_res.data['is_following'])

        # Now check profile
        res_after = self.client.get(f'/api/users/{other_profile.id}/')
        self.assertTrue(res_after.data['is_following'])

    # ── Google OAuth & OAuthLoginTicket Tests ─────────────────────────

    def test_oauth_status_endpoint(self):
        res = self.client.get('/api/auth/oauth-status/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('google_enabled', res.data)
        self.assertIn('client_id', res.data)

    @override_settings(GOOGLE_OAUTH_ENABLED=False)
    def test_google_login_init_disabled(self):
        res = self.client.get('/api/auth/google/login/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        GOOGLE_OAUTH_ENABLED=True,
        GOOGLE_OAUTH_CLIENT_ID='test-client-id.apps.googleusercontent.com',
        GOOGLE_OAUTH_REDIRECT_URI='http://localhost:8000/api/auth/google/callback/'
    )
    def test_google_login_init_enabled(self):
        res = self.client.get('/api/auth/google/login/?format=json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('url', res.data)
        self.assertIn('test-client-id', res.data['url'])
        self.assertIn('accounts.google.com', res.data['url'])

    def test_oauth_ticket_exchange_lifecycle(self):
        ticket = OAuthLoginTicket.objects.create(
            user=self.user,
            expires_at=timezone.now() + datetime.timedelta(minutes=5)
        )
        self.assertTrue(ticket.is_usable)

        # Exchange valid ticket
        res = self.client.post('/api/auth/oauth-ticket/', {'ticket': ticket.token}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['handle'], '@testuser')

        # Re-using ticket must fail
        ticket.refresh_from_db()
        self.assertFalse(ticket.is_usable)
        res_reuse = self.client.post('/api/auth/oauth-ticket/', {'ticket': ticket.token}, format='json')
        self.assertEqual(res_reuse.status_code, status.HTTP_400_BAD_REQUEST)

    def test_oauth_ticket_expired_fails(self):
        expired_ticket = OAuthLoginTicket.objects.create(
            user=self.user,
            expires_at=timezone.now() - datetime.timedelta(minutes=1)
        )
        self.assertFalse(expired_ticket.is_usable)
        res = self.client.post('/api/auth/oauth-ticket/', {'ticket': expired_ticket.token}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        GOOGLE_OAUTH_ENABLED=True,
        GOOGLE_OAUTH_CLIENT_ID='cid',
        GOOGLE_OAUTH_CLIENT_SECRET='csecret',
        GOOGLE_OAUTH_REDIRECT_URI='http://localhost:8000/api/auth/google/callback/',
        FRONTEND_URL='http://localhost:5173'
    )
    @patch('urllib.request.urlopen')
    def test_google_callback_flow(self, mock_urlopen):
        # First call: exchange code for access_token
        # Second call: fetch userinfo
        mock_token_resp = MagicMock()
        mock_token_resp.read.return_value = json.dumps({'access_token': 'fake-access-token'}).encode('utf-8')
        mock_token_resp.__enter__.return_value = mock_token_resp

        mock_userinfo_resp = MagicMock()
        mock_userinfo_resp.read.return_value = json.dumps({
            'sub': 'google-sub-12345',
            'email': 'oauthuser@example.com',
            'name': 'OAuth Pioneer',
            'picture': 'https://example.com/avatar.png',
        }).encode('utf-8')
        mock_userinfo_resp.__enter__.return_value = mock_userinfo_resp

        mock_urlopen.side_effect = [mock_token_resp, mock_userinfo_resp]

        res = self.client.get('/api/auth/google/callback/?code=test-code')
        self.assertEqual(res.status_code, status.HTTP_302_FOUND)
        self.assertIn('oauth_ticket=', res.url)

        # Verify GoogleIdentity and User were provisioned
        identity = GoogleIdentity.objects.filter(subject='google-sub-12345').first()
        self.assertIsNotNone(identity)
        self.assertEqual(identity.email, 'oauthuser@example.com')
        self.assertEqual(identity.user.profile.display_name, 'OAuth Pioneer')

        # Verify ticket can be exchanged for token
        ticket_token = res.url.split('oauth_ticket=')[1]
        exchange_res = self.client.post('/api/auth/oauth-ticket/', {'ticket': ticket_token}, format='json')
        self.assertEqual(exchange_res.status_code, status.HTTP_200_OK)
        self.assertIn('token', exchange_res.data)
        self.assertEqual(exchange_res.data['user']['display_name'], 'OAuth Pioneer')

    @patch('urllib.request.urlopen')
    def test_google_token_login(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps({
            'sub': 'google-direct-67890',
            'email': 'directgoogle@example.com',
            'name': 'Direct Google User',
            'picture': '',
        }).encode('utf-8')
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        res = self.client.post('/api/auth/google/', {'credential': 'mock-credential-token'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)
        self.assertEqual(res.data['user']['display_name'], 'Direct Google User')
