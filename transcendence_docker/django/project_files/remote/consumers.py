import json
from channels.generic.websocket import WebsocketConsumer

class RemoteConsumer(WebsocketConsumer):
	def connect(self):
		self.accept()
		self.send(text_data=json.dumps({
			'type':'connection_estabilished',
			'message':'Connection Estabilished'
		}))