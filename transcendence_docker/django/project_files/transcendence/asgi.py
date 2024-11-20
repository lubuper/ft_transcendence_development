"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from remote.routing import websocket_urlpatterns as remote_urlpatterns
from firstApp.routing import websocket_urlpatterns as firstApp_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

application = ProtocolTypeRouter({
	'http':get_asgi_application(),
	'websocket':AuthMiddlewareStack(
		URLRouter(remote_urlpatterns + firstApp_urlpatterns)
	)
})
