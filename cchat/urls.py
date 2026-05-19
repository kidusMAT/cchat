from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def home_view(request):
    return JsonResponse({
        "status": "online",
        "name": "cchat API Backend",
        "message": "Welcome to cchat! This is the API gateway. The frontend client is located in the /frontend directory.",
        "endpoints": {
            "api": "/api/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', home_view),
    path('admin/', admin.site.urls),
    path('api/', include('chat.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
