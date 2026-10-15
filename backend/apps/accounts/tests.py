from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import UserProfile

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
