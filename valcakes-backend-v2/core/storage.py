"""Persistent storage for public shop images."""
import hashlib
from urllib.request import urlopen

import cloudinary
import cloudinary.api
import cloudinary.uploader
from cloudinary.exceptions import NotFound
from cloudinary.utils import cloudinary_url
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage


class CloudinaryImageStorage(Storage):
    def __init__(self):
        cloudinary.config(**settings.CLOUDINARY_CREDENTIALS, secure=True)

    @staticmethod
    def public_id(name):
        # Include the entire stored filename (including extension) in the hash.
        # Existing database references can be migrated without modifying rows.
        digest = hashlib.sha256(name.encode('utf-8')).hexdigest()
        return f'valcakes/shop_images/{digest}'

    def url(self, name):
        return cloudinary_url(self.public_id(name), secure=True, resource_type='image')[0]

    def exists(self, name):
        try:
            self._resource(name)
        except NotFound:
            return False
        return True

    def _resource(self, name):
        return cloudinary.api.resource(self.public_id(name), resource_type='image', type='upload')

    def _save(self, name, content):
        if hasattr(content, 'seek'):
            content.seek(0)
        result = cloudinary.uploader.upload(
            content, public_id=self.public_id(name), resource_type='image',
            overwrite=False, timeout=60,
        )
        if result.get('existing'):
            raise FileExistsError(name)
        if result.get('public_id') != self.public_id(name):
            raise OSError('Cloudinary returned an unexpected image identifier')
        return name

    def _open(self, name, mode='rb'):
        if mode != 'rb':
            raise ValueError('Cloudinary images can only be opened in binary read mode')
        with urlopen(self.url(name), timeout=30) as response:
            return ContentFile(response.read(), name=name)

    def size(self, name):
        return self._resource(name)['bytes']

    def delete(self, name):
        cloudinary.uploader.destroy(self.public_id(name), resource_type='image', invalidate=True)
