from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views  # ← ADD THIS LINE (imports the views.py we just created)

urlpatterns = [
    path('', views.home, name='home'),  # ← ADD THIS LINE (the home page route)
    path('admin/', admin.site.urls),
    path('api/', include('gamestore.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)