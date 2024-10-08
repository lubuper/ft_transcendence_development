from django.urls import path, re_path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import create_account, login_view, current_user, logout_view, profile, update_profile

#urlpatterns = [
#    path('', views.homepage, name="homepage"),
#    re_path(r'^.*$', views.homepage)
#]

urlpatterns = [
    path('', views.homepage, name="homepage"),
    path('create-account/', views.create_account, name='create_account'),
    path('login/', login_view, name='login'),
    path('current-user/', current_user, name='current_user'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile, name='profile'),
    path('update_profile/', update_profile, name='update_profile'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)