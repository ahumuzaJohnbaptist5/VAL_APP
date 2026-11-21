from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from users.views import get_tokens_for_user

from shop.models import ShopItem
from users.models import User

from .models import FeatureSettings, NotificationSettings, StoreSettings


class SettingsApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            phone_number='+256700000001',
            password='password123',
            full_name='Admin User',
            role='admin',
            is_approved=True,
            is_staff=True,
        )
        self.customer = User.objects.create_user(
            phone_number='+256700000002',
            password='password123',
            full_name='Customer User',
            role='customer',
            is_approved=True,
        )
        self.client = APIClient()
        self.settings_url = reverse('settings')

    def authenticate(self, user):
        token = get_tokens_for_user(user)['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_admin_can_read_and_update_settings(self):
        self.authenticate(self.admin)

        response = self.client.get(self.settings_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.data), {'store', 'notifications', 'features'})

        response = self.client.patch(
            self.settings_url,
            {
                'store': {'store_name': 'VAL Cakes Limited', 'currency': 'ugx'},
                'notifications': {'send_quote_emails': False, 'staff_email': 'staff@example.com'},
                'features': {'maintenance_mode': True, 'cake_orders_enabled': False},
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['store']['store_name'], 'VAL Cakes Limited')
        self.assertEqual(response.data['store']['currency'], 'UGX')
        self.assertFalse(response.data['notifications']['send_quote_emails'])
        self.assertTrue(response.data['features']['maintenance_mode'])
        self.assertFalse(response.data['features']['cake_orders_enabled'])

        self.assertEqual(StoreSettings.load().store_name, 'VAL Cakes Limited')
        self.assertEqual(NotificationSettings.load().staff_email, 'staff@example.com')
        self.assertFalse(FeatureSettings.load().cake_orders_enabled)

    def test_non_admin_cannot_read_settings(self):
        self.authenticate(self.customer)
        self.assertEqual(self.client.get(self.settings_url).status_code, 403)

    def test_public_settings_are_read_only_and_expose_flags(self):
        FeatureSettings.objects.update_or_create(pk=1, defaults={'wholesale_shop_enabled': False})

        response = self.client.get(reverse('public-settings'))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['features']['wholesale_shop_enabled'])
        self.assertNotIn('staff_email', response.data)
        self.assertEqual(self.client.patch(reverse('public-settings'), {}, format='json').status_code, 405)


class StaffManagementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            phone_number='+256700000010',
            password='password123',
            full_name='Admin User',
            role='admin',
            is_approved=True,
            is_staff=True,
        )
        self.pending = User.objects.create_user(
            phone_number='+256700000011',
            password='password123',
            full_name='Pending Agent',
            role='agent',
        )
        self.client = APIClient()
        token = get_tokens_for_user(self.admin)['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_admin_can_approve_and_manage_staff(self):
        approve_url = reverse('approve-admin', args=[self.pending.id])
        self.assertEqual(self.client.post(approve_url).status_code, 200)
        self.pending.refresh_from_db()
        self.assertTrue(self.pending.is_approved)

        detail_url = reverse('staff-user-detail', args=[self.pending.id])
        response = self.client.patch(detail_url, {'role': 'admin', 'is_active': False}, format='json')
        self.assertEqual(response.status_code, 200)
        self.pending.refresh_from_db()
        self.assertEqual(self.pending.role, 'admin')
        self.assertFalse(self.pending.is_active)

        list_response = self.client.get(reverse('staff-users'))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 2)

    def test_admin_cannot_deactivate_own_account(self):
        url = reverse('staff-user-detail', args=[self.admin.id])
        response = self.client.patch(url, {'is_active': False}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_reject_removes_pending_account(self):
        url = reverse('reject-admin', args=[self.pending.id])
        self.assertEqual(self.client.post(url).status_code, 200)
        self.assertFalse(User.objects.filter(pk=self.pending.pk).exists())


class FeatureToggleTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            phone_number='+256700000020',
            password='password123',
            full_name='Customer User',
            role='customer',
            is_approved=True,
        )
        self.client = APIClient()

    def test_maintenance_mode_blocks_customer_writes(self):
        FeatureSettings.objects.update_or_create(pk=1, defaults={'maintenance_mode': True})

        response = self.client.post(
            reverse('orders-list'),
            {
                'customer_name': 'Test',
                'customer_phone': '+256700000020',
                'items': [{'cake_name': 'Cake', 'quantity': 1}],
            },
            format='json',
        )
        self.assertEqual(response.status_code, 503)

    def test_maintenance_mode_still_allows_admin_writes(self):
        admin = User.objects.create_user(
            phone_number='+256700000021',
            password='password123',
            full_name='Admin User',
            role='admin',
            is_approved=True,
            is_staff=True,
        )
        FeatureSettings.objects.update_or_create(pk=1, defaults={'maintenance_mode': True})
        token = get_tokens_for_user(admin)['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.patch(
            reverse('settings'),
            {'store': {'store_name': 'Still Open For Staff'}},
            format='json',
        )
        self.assertEqual(response.status_code, 200)

    def test_shop_hidden_when_wholesale_shop_disabled(self):
        ShopItem.objects.create(name='Flour', description='Test', price=1000, stock_quantity=5)
        FeatureSettings.objects.update_or_create(pk=1, defaults={'wholesale_shop_enabled': False})

        response = self.client.get(reverse('shopitem-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
