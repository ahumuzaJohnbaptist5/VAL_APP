from django.conf import settings
from django.core.files.storage import FileSystemStorage, default_storage
from django.core.management.base import BaseCommand, CommandError

from core.storage import CloudinaryImageStorage
from shop.models import ShopItem


class Command(BaseCommand):
    help = 'Copy referenced local product images to Cloudinary without changing database rows.'

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Upload missing images (default: dry run).')

    def handle(self, *args, **options):
        if not isinstance(default_storage, CloudinaryImageStorage):
            raise CommandError('Configure all three Cloudinary credentials first.')
        local = FileSystemStorage(location=settings.MEDIA_ROOT)
        names = (ShopItem.objects.exclude(image__isnull=True).exclude(image='')
                 .values_list('image', flat=True).distinct().order_by('image'))
        missing = 0
        for name in names.iterator():
            if default_storage.exists(name):
                self.stdout.write(f'Already in Cloudinary: {name}')
                continue
            if not local.exists(name):
                self.stderr.write(f'Missing local backup: {name}')
                missing += 1
                continue
            if options['apply']:
                with local.open(name, 'rb') as content:
                    # Preserve the exact name and never overwrite an existing asset.
                    default_storage._save(name, content)
                if not default_storage.exists(name):
                    raise CommandError(f'Upload verification failed: {name}')
                self.stdout.write(self.style.SUCCESS(f'Uploaded: {name}'))
            else:
                self.stdout.write(f'Would upload: {name}')
        if missing:
            raise CommandError(f'{missing} referenced image(s) are missing. Restore backups and retry.')
        self.stdout.write(self.style.SUCCESS('Migration complete.' if options['apply'] else 'Dry run complete. Use --apply to upload.'))
