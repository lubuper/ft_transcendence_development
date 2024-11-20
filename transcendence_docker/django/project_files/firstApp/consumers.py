# consumers.py
# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Profile
from datetime import timedelta
from django.utils import timezone
from .signals import status_change_signal
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.dispatch import receiver
import logging
logger = logging.getLogger(__name__)


class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join a channel group (e.g., based on user ID or friends group)
        self.group_name = "status_updates"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # This part will depend on any specific requests, if necessary

    async def status_update(self, event):
        logger.info(f"Received event in status_update: {event}")
        await self.send(text_data=json.dumps({
            'friend_': event['username'],
            'status': event['status']
        }))

@receiver(status_change_signal)
def status_change_handler(sender, username, status, **kwargs):
    logger.info(f"Entered status_change_handler: {username}, {status}")
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "status_updates",
        {
            'type': 'status_update',
            'username': username,
            'status': status,
        }
    )

