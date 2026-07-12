from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/shop/', include('shop.urls')),
]

# CRITICAL: This serves media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # Disable admin CSS completely
admin.site.site_header = "Val Investments Admin"
admin.site.site_title = "Val Admin Portal"
admin.site.index_title = "Welcome to Val Investments"
