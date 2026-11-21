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

from unittest.mock import patch
from django.core.files.base import ContentFile
from django.test import SimpleTestCase
from cloudinary.exceptions import NotFound
from core.storage import CloudinaryImageStorage
from shop.models import ShopItem
from shop.serializers import ShopItemSerializer


@override_settings(CLOUDINARY_CREDENTIALS={'cloud_name': 'test', 'api_key': 'test', 'api_secret': 'test'})
class ImageStorageTests(SimpleTestCase):
    def test_image_path_is_stable_and_extension_specific(self):
        storage = CloudinaryImageStorage()
        self.assertEqual(storage.public_id('shop_items/a.jpg'), storage.public_id('shop_items/a.jpg'))
        self.assertNotEqual(storage.public_id('shop_items/a.jpg'), storage.public_id('shop_items/a.png'))
        self.assertTrue(storage.url('shop_items/a.jpg').startswith('https://'))

    @patch('core.storage.cloudinary.uploader.upload')
    @patch('core.storage.cloudinary.api.resource', side_effect=NotFound('missing'))
    def test_upload_preserves_name(self, resource, upload):
        storage = CloudinaryImageStorage()
        name = 'shop_items/a.jpg'
        upload.return_value = {'public_id': storage.public_id(name)}
        self.assertEqual(storage.save(name, ContentFile(b'image')), name)
        self.assertFalse(upload.call_args.kwargs['overwrite'])

    def test_serializer_returns_cloud_url_without_request(self):
        item = ShopItem(name='Cake', price=100, image='shop_items/a.jpg')
        item.image.storage = CloudinaryImageStorage()
        self.assertEqual(ShopItemSerializer(item).data['image'], item.image.url)
