import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'send_message':
            # Broadcast message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'senderId': data['senderId'],
                    'text': data['text'],
                    'chatId': self.chat_id
                }
            )
        elif message_type == 'reaction':
            # Broadcast reaction to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_reaction',
                    'messageId': data['messageId'],
                    'reactionType': data['reactionType'],
                    'chatId': self.chat_id
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'receive_message',
            'senderId': event['senderId'],
            'text': event['text'],
            'chatId': event['chatId']
        }))

    # Receive reaction from room group
    async def chat_reaction(self, event):
        # Send reaction update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update_reaction',
            'messageId': event['messageId'],
            'reactionType': event['reactionType'],
            'chatId': event['chatId']
        }))
