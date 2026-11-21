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

from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from .models import User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PasswordRecoveryTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            phone_number='+256700000900', full_name='Customer',
            email='customer@example.com', password='Old!Password924',
            role='customer', is_approved=True,
        )

    def test_matching_details_send_link(self):
        response = self.client.post(reverse('password-reset'), {
            'phone_number': self.user.phone_number, 'email': self.user.email,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('#uid=', mail.outbox[0].body)

    def test_wrong_email_does_not_disclose_account(self):
        response = self.client.post(reverse('password-reset'), {
            'phone_number': self.user.phone_number, 'email': 'wrong@example.com',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_reset_token_is_single_use(self):
        data = {'uid': urlsafe_base64_encode(force_bytes(self.user.pk)),
                'token': default_token_generator.make_token(self.user),
                'password': 'Fresh!Password984'}
        self.assertEqual(self.client.post(reverse('password-reset-confirm'), data).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(data['password']))
        self.assertEqual(self.client.post(reverse('password-reset-confirm'), data).status_code, 400)

    def test_invalid_token_cannot_change_password(self):
        data = {'uid': urlsafe_base64_encode(force_bytes(self.user.pk)),
                'token': 'invalid', 'password': 'Fresh!Password984'}
        self.assertEqual(self.client.post(reverse('password-reset-confirm'), data).status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Old!Password924'))
