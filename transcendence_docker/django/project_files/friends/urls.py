from django.urls import path
from . import views

urlpatterns = [
    path('send-friend-request/', views.send_friend_request, name='send_friend_request'),
    path('accept-friend-request/', views.accept_friend_request, name='accept_friend_request'),
    path('reject-friend-request/', views.reject_friend_request, name='reject_friend_request'),
]
