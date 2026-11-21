from django.urls import reverse
from rest_framework.test import APITestCase
from django.test import override_settings
from users.models import User
from shop.models import CakeOrder

@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class OrderSecurityTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(phone_number='+256700000125', password='Unusual!Passphrase92', full_name='Customer', role='customer', is_approved=True)
        self.other = User.objects.create_user(phone_number='+256700000126', password='Unusual!Passphrase92', full_name='Other', role='customer', is_approved=True)
        self.admin = User.objects.create_user(phone_number='+256700000127', password='Unusual!Passphrase92', full_name='Admin', role='admin', is_approved=True)
        self.order = CakeOrder.objects.create(customer=self.customer, customer_name='Customer', customer_phone=self.customer.phone_number)

    def test_customer_cannot_read_another_order(self):
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(reverse('orders-detail', args=[self.order.pk])).status_code, 404)

    def test_customer_cannot_quote_order(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.post(reverse('orders-quote', args=[self.order.pk]), {'quoted_price': 10000}, format='json').status_code, 403)

    def test_missing_order_quote_returns_404(self):
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.post(reverse('orders-quote', args=[999999]), {'quoted_price': 10000}, format='json').status_code, 404)
