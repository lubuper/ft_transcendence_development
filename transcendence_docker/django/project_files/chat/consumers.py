import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user_name = self.scope['url_route']['kwargs']['user_name']
		self.friend_name = self.scope['url_route']['kwargs']['friend_name']
		self.room_group_name = f"chat_{min(self.user_name, self.friend_name)}_{max(self.user_name, self.friend_name)}"

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		data = json.loads(text_data)
		message = data['message']

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_message',
				'message': message,
				'sender': self.user_name
			}
		)

	async def chat_message(self, event):
		message = event['message']
		sender = event['sender']

		await self.send(text_data=json.dumps({
			'message': message,
			'sender': sender
		}))

