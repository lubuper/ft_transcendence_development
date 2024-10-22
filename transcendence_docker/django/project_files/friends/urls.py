from django.urls import path
from . import views

urlpatterns = [
    path('send-friend-request/', views.send_friend_request, name='send_friend_request'),
]
