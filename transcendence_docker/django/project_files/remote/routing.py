from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
	re_path(r'ws/chat/(?P<user_name>\w+)/(?P<friend_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
	re_path(r'^ws/game/(?P<game_id>\w+)/$', consumers.GameConsumer.as_asgi()),
]
