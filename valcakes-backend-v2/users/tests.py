from django.urls import reverse
from rest_framework.test import APITestCase

class RegistrationSecurityTests(APITestCase):
    def test_invalid_role_is_rejected(self):
        response = self.client.post(reverse('register'), {
            'full_name': 'Test Customer', 'phone_number': '+256700000123',
            'password': 'Unusual!Passphrase92', 'role': 'superuser',
        })
        self.assertEqual(response.status_code, 400)

    def test_weak_password_is_rejected(self):
        response = self.client.post(reverse('register'), {
            'full_name': 'Test Customer', 'phone_number': '+256700000124',
            'password': '12345678',
        })
        self.assertEqual(response.status_code, 400)
