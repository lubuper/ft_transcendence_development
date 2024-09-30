from django.urls import path, re_path
from . import views
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