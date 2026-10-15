from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.sponsorship.models import PartnerInquiry, SponsorPlacement

class SponsorshipTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_submit_inquiry_success(self):
        payload = {
            'name': 'Alex Partner',
            'brand': 'Acme Roasters',
            'email': 'alex@acme.example.com',
            'placement_interest': 'Discover sponsor card',
            'idea': 'Specialty cold brew sponsorship for late-night chat reading.',
            'agreed_terms': True
        }
        res = self.client.post('/api/sponsorship/inquiry/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(PartnerInquiry.objects.filter(brand='Acme Roasters').exists())

    def test_submit_inquiry_invalid_missing_fields(self):
        payload = {
            'name': 'Incomplete',
            # missing email and brand
        }
        res = self.client.post('/api/sponsorship/inquiry/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_after_hours_detail_fallback(self):
        res = self.client.get('/api/sponsorship/after-hours/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['brand_name'], 'After Hours')
        self.assertIn('menu_items', res.data)
        self.assertIn('tracks', res.data)
