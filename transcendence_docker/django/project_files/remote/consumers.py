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

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'

        # Join the game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data['action']

        if action == 'join':
            # Notify the group that a player has joined
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'player_joined',
                    'message': f'{data["username"]} has joined the game.'
                }
            )

    async def player_joined(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))