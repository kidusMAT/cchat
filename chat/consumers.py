import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'
        self.user = self.scope.get('user', None)

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

    # ─── Database helpers ────────────────────────────────────────────────

    @database_sync_to_async
    def save_message(self, sender_id, text):
        """Save a message to the database and return its serialized form."""
        from .models import Conversation, Message

        try:
            conversation = Conversation.objects.get(id=self.chat_id)
        except Conversation.DoesNotExist:
            return None

        try:
            sender = User.objects.get(id=sender_id)
        except User.DoesNotExist:
            return None

        # Verify sender is a participant
        if not conversation.participants.filter(id=sender.id).exists():
            return None

        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            text=text
        )

        # Update conversation timestamp
        conversation.save()

        return {
            'id': message.id,
            'sender_id': sender.id,
            'sender_username': sender.username,
            'text': message.text,
            'timestamp': message.timestamp.isoformat(),
            'likes': 0,
            'dislikes': 0,
            'caps': 0,
            'smiles': 0,
            'dominant_reaction': 'neutral',
            'is_edited': False,
        }

    @database_sync_to_async
    def save_reaction(self, user_id, message_id, reaction_type):
        """Save/toggle a message reaction in the database. Returns updated counts."""
        from .models import Message, MessageReaction

        try:
            message = Message.objects.get(id=message_id)
            user = User.objects.get(id=user_id)
        except (Message.DoesNotExist, User.DoesNotExist):
            return None

        valid_types = ['like', 'dislike', 'cap', 'smile']
        if reaction_type not in valid_types:
            return None

        reaction, created = MessageReaction.objects.get_or_create(
            message=message,
            user=user,
            defaults={'reaction_type': reaction_type}
        )

        if created:
            # New reaction — increment
            if reaction_type == 'like':
                message.likes += 1
            elif reaction_type == 'dislike':
                message.dislikes += 1
            elif reaction_type == 'cap':
                message.caps += 1
            elif reaction_type == 'smile':
                message.smiles += 1
        else:
            old_type = reaction.reaction_type
            if old_type == reaction_type:
                # Toggle off
                if old_type == 'like':
                    message.likes = max(0, message.likes - 1)
                elif old_type == 'dislike':
                    message.dislikes = max(0, message.dislikes - 1)
                elif old_type == 'cap':
                    message.caps = max(0, message.caps - 1)
                elif old_type == 'smile':
                    message.smiles = max(0, message.smiles - 1)
                reaction.delete()
            else:
                # Change reaction
                if old_type == 'like':
                    message.likes = max(0, message.likes - 1)
                elif old_type == 'dislike':
                    message.dislikes = max(0, message.dislikes - 1)
                elif old_type == 'cap':
                    message.caps = max(0, message.caps - 1)
                elif old_type == 'smile':
                    message.smiles = max(0, message.smiles - 1)

                reaction.reaction_type = reaction_type
                reaction.save()

                if reaction_type == 'like':
                    message.likes += 1
                elif reaction_type == 'dislike':
                    message.dislikes += 1
                elif reaction_type == 'cap':
                    message.caps += 1
                elif reaction_type == 'smile':
                    message.smiles += 1

        message.save()

        # Compute dominant reaction
        reactions = {
            'like': message.likes,
            'dislike': message.dislikes,
            'cap': message.caps,
            'smile': message.smiles,
        }
        dominant = 'neutral'
        if any(v > 0 for v in reactions.values()):
            dominant = max(reactions, key=reactions.get)

        return {
            'message_id': message.id,
            'likes': message.likes,
            'dislikes': message.dislikes,
            'caps': message.caps,
            'smiles': message.smiles,
            'dominant_reaction': dominant,
        }

    @database_sync_to_async
    def save_conversation_reaction(self, user_id, reaction_type):
        """Save/toggle a conversation-level reaction in the database."""
        from .models import Conversation, ConversationReaction

        try:
            conversation = Conversation.objects.get(id=self.chat_id)
            user = User.objects.get(id=user_id)
        except (Conversation.DoesNotExist, User.DoesNotExist):
            return None

        valid_types = ['like', 'dislike', 'cap', 'smile']
        if reaction_type not in valid_types:
            return None

        last_msg = conversation.messages.order_by('-timestamp').first()
        latest_reaction = ConversationReaction.objects.filter(
            conversation=conversation,
            user=user,
            reaction_type=reaction_type
        ).order_by('-created_at').first()

        should_add_new = False
        if last_msg and latest_reaction:
            if last_msg.timestamp > latest_reaction.created_at:
                should_add_new = True
        elif not latest_reaction:
            should_add_new = True

        if latest_reaction and not should_add_new:
            # Toggle off
            if reaction_type == 'like':
                conversation.likes = max(0, conversation.likes - 1)
            elif reaction_type == 'dislike':
                conversation.dislikes = max(0, conversation.dislikes - 1)
            elif reaction_type == 'cap':
                conversation.caps = max(0, conversation.caps - 1)
            elif reaction_type == 'smile':
                conversation.smiles = max(0, conversation.smiles - 1)
            latest_reaction.delete()
        else:
            # Add reaction
            ConversationReaction.objects.create(
                conversation=conversation,
                user=user,
                reaction_type=reaction_type
            )
            if reaction_type == 'like':
                conversation.likes += 1
            elif reaction_type == 'dislike':
                conversation.dislikes += 1
            elif reaction_type == 'cap':
                conversation.caps += 1
            elif reaction_type == 'smile':
                conversation.smiles += 1

        conversation.save()

        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count, Q, Max, Avg
        now = timezone.now()
        ten_mins_ago = now - timedelta(minutes=10)
        
        # Velocity of current chat
        current_v = conversation.conversation_reactions.filter(created_at__gte=ten_mins_ago).count()
        
        # Global stats
        stats = Conversation.objects.annotate(
            velocity=Count('conversation_reactions', filter=Q(conversation_reactions__created_at__gte=ten_mins_ago))
        ).aggregate(max_v=Max('velocity'), avg_v=Avg('velocity'))
        
        max_v = stats['max_v'] or 0
        avg_v = stats['avg_v'] or 0
        
        if current_v > 0:
            if current_v >= max_v and current_v > 5:
                status = 'LEGENDARY'
            elif current_v >= avg_v * 2:
                status = 'ON FIRE'
            elif current_v > avg_v:
                status = 'HEATING UP'
            else:
                status = 'ACTIVE'
        else:
            total = (conversation.likes or 0) + (conversation.dislikes or 0) + (conversation.caps or 0) + (conversation.smiles or 0)
            if total > 500: status = 'LEGENDARY'
            elif total > 200: status = 'ON FIRE'
            elif total > 100: status = 'HEATING UP'
            else: status = 'CHILLING'

        return {
            'likes': conversation.likes,
            'dislikes': conversation.dislikes,
            'caps': conversation.caps,
            'smiles': conversation.smiles,
            'status': status
        }

    @database_sync_to_async
    def save_comment(self, user_id, message_id, text, parent_id=None):
        """Save a message comment to the database."""
        from .models import Message, MessageComment

        try:
            message = Message.objects.get(id=message_id)
            user = User.objects.get(id=user_id)
        except (Message.DoesNotExist, User.DoesNotExist):
            return None

        comment = MessageComment.objects.create(
            message=message,
            user=user,
            text=text,
            parent_id=parent_id
        )

        return {
            'id': comment.id,
            'message_id': message.id,
            'text': comment.text,
            'username': user.username,
            'parent_id': parent_id,
            'created_at': comment.created_at.isoformat(),
            'is_edited': False,
        }

    @database_sync_to_async
    def save_poll(self, sender_id, text, question, option_a, option_b, is_system_generated=False):
        from .models import Conversation, Message, MessagePoll
        try:
            conversation = Conversation.objects.get(id=self.chat_id)
            sender = User.objects.get(id=sender_id)
        except (Conversation.DoesNotExist, User.DoesNotExist):
            return None

        if not is_system_generated and not conversation.participants.filter(id=sender.id).exists():
            return None

        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            text=text,
            message_type='poll'
        )

        poll = MessagePoll.objects.create(
            message=message,
            question=question,
            option_a=option_a,
            option_b=option_b,
            is_system_generated=is_system_generated
        )

        conversation.save()

        return {
            'id': message.id,
            'senderId': sender.username,
            'sender_username': sender.username,
            'text': message.text,
            'timestamp': message.timestamp.isoformat(),
            'message_type': 'poll',
            'likes': 0, 'dislikes': 0, 'caps': 0, 'smiles': 0, 'dominant_reaction': 'neutral',
            'poll_data': {
                'id': poll.id,
                'question': poll.question,
                'option_a': poll.option_a,
                'option_b': poll.option_b,
                'votes_a': poll.votes_a,
                'votes_b': poll.votes_b,
                'is_system_generated': poll.is_system_generated,
                'user_vote': None,
                'voters_a': [],
                'voters_b': []
            }
        }

    @database_sync_to_async
    def save_poll_vote(self, user_id, poll_id, option):
        from .models import MessagePoll, PollVote, Conversation
        try:
            poll = MessagePoll.objects.get(id=poll_id)
            user = User.objects.get(id=user_id)
            conversation = Conversation.objects.get(id=self.chat_id)
        except Exception:
            return None

        if not conversation.participants.filter(id=user.id).exists():
            return None
            
        if option not in ['A', 'B']:
            return None

        # Check if the user has already voted on this poll to prevent retracting or changing votes
        if PollVote.objects.filter(poll=poll, user=user).exists():
            return None

        vote, created = PollVote.objects.get_or_create(poll=poll, user=user, defaults={'selected_option': option})
        
        if not created and vote.selected_option != option:
            if vote.selected_option == 'A':
                poll.votes_a = max(0, poll.votes_a - 1)
            else:
                poll.votes_b = max(0, poll.votes_b - 1)
            
            vote.selected_option = option
            vote.save()
            if option == 'A':
                poll.votes_a += 1
            else:
                poll.votes_b += 1
        elif created:
            if option == 'A':
                poll.votes_a += 1
            else:
                poll.votes_b += 1
                
        poll.save()
        return {
            'poll_id': poll.id,
            'message_id': poll.message.id,
            'votes_a': poll.votes_a,
            'votes_b': poll.votes_b,
            'voters_a': list(poll.votes.filter(selected_option='A').values_list('user__username', flat=True)),
            'voters_b': list(poll.votes.filter(selected_option='B').values_list('user__username', flat=True))
        }

    @database_sync_to_async
    def handle_sponsorship_vote(self, user_id, sponsorship_id, accepted):
        from .models import SponsorshipRequest
        try:
            sponsorship = SponsorshipRequest.objects.get(id=sponsorship_id, conversation_id=self.chat_id)
            user = User.objects.get(id=user_id)
        except Exception:
            return None

        if sponsorship.user1_id == user.id:
            sponsorship.user1_accepted = accepted
        elif sponsorship.user2_id == user.id:
            sponsorship.user2_accepted = accepted
        else:
            return None
            
        sponsorship.save()
        from .serializers import SponsorshipRequestSerializer
        return SponsorshipRequestSerializer(sponsorship).data

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps(event))

    async def comment_deleted(self, event):
        await self.send(text_data=json.dumps(event))

    async def message_edited(self, event):
        await self.send(text_data=json.dumps(event))

    async def comment_edited(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def delete_message_from_db(self, message_id):
        try:
            from .models import Message
            msg = Message.objects.get(id=message_id)
            if self.user and self.user.id == msg.sender_id:
                msg.delete()
                return True
        except Exception:
            pass
        return False

    @database_sync_to_async
    def delete_comment_from_db(self, comment_id):
        try:
            from .models import MessageComment
            comment = MessageComment.objects.get(id=comment_id)
            if self.user and self.user.id == comment.user_id:
                comment.delete()
                return True
        except Exception:
            pass
        return False

    @database_sync_to_async
    def edit_message_from_db(self, message_id, new_text):
        try:
            from .models import Message
            msg = Message.objects.get(id=message_id)
            if self.user and self.user.id == msg.sender_id:
                msg.text = new_text
                msg.is_edited = True
                msg.save()
                return True
        except Exception:
            pass
        return False

    @database_sync_to_async
    def toggle_visibility_in_db(self):
        try:
            from .models import Conversation, ChatVisibility, AnonymousProfile
            conversation = Conversation.objects.get(id=self.chat_id)
            visibility, created = ChatVisibility.objects.get_or_create(
                user=self.user,
                conversation=conversation,
                defaults={'is_public': False}
            )
            visibility.is_public = not visibility.is_public
            visibility.save()

            if visibility.is_public:
                # Return real identity
                profile = self.user.profile
                return {
                    'is_public': True,
                    'username': self.user.username,
                    'handle': f"@{self.user.username}",
                    'avatar': profile.avatar if profile.avatar else self.user.username[:2].upper(),
                    'avatar_url': profile.get_avatar_url()
                }
            else:
                # Return masked identity
                anon = AnonymousProfile.get_or_create_for_user(conversation, self.user)
                return {
                    'is_public': False,
                    'username': anon.fake_username,
                    'handle': '@anonymous',
                    'avatar': '?',
                    'avatar_url': anon.get_avatar_url()
                }
        except Exception:
            return None

    @database_sync_to_async
    def edit_comment_from_db(self, comment_id, new_text):
        try:
            from .models import MessageComment
            comment = MessageComment.objects.get(id=comment_id)
            if self.user and self.user.id == comment.user_id:
                comment.text = new_text
                comment.is_edited = True
                comment.save()
                return True
        except Exception:
            pass
        return False

    @database_sync_to_async
    def get_user_id_from_username(self, username):
        """Look up a user ID from a username."""
        try:
            return User.objects.get(username=username).id
        except User.DoesNotExist:
            return None

    # ─── Receive from WebSocket ──────────────────────────────────────────

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'send_message':
            sender_identifier = data.get('senderId')
            text = data.get('text', '')

            # Resolve sender: try scope user first, then look up by username
            sender_id = None
            if self.user and hasattr(self.user, 'id') and self.user.id:
                sender_id = self.user.id
            elif sender_identifier:
                sender_id = await self.get_user_id_from_username(sender_identifier)

            if sender_id and text:
                saved = await self.save_message(sender_id, text)
                if saved:
                    # Broadcast with DB data (includes real ID and timestamp)
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'id': saved['id'],
                            'senderId': saved['sender_username'],
                            'sender_username': saved['sender_username'],
                            'text': saved['text'],
                            'timestamp': saved['timestamp'],
                            'chatId': self.chat_id,
                            'likes': saved['likes'],
                            'dislikes': saved['dislikes'],
                            'caps': saved['caps'],
                            'smiles': saved['smiles'],
                            'dominant_reaction': saved['dominant_reaction'],
                        }
                    )
                    return

            # Fallback: broadcast without saving (shouldn't normally happen)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'senderId': sender_identifier or 'ANON',
                    'sender_username': sender_identifier or 'ANON',
                    'text': text,
                    'chatId': self.chat_id
                }
            )

        elif message_type == 'delete_message':
            message_id = data.get('messageId')
            if await self.delete_message_from_db(message_id):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_deleted',
                        'messageId': message_id
                    }
                )

        elif message_type == 'delete_comment':
            comment_id = data.get('commentId')
            message_id = data.get('messageId')
            if await self.delete_comment_from_db(comment_id):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'comment_deleted',
                        'commentId': comment_id,
                        'messageId': message_id
                    }
                )

        elif message_type == 'edit_message':
            message_id = data.get('messageId')
            new_text = data.get('text', '')
            if message_id and new_text and await self.edit_message_from_db(message_id, new_text):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_edited',
                        'messageId': message_id,
                        'text': new_text,
                        'is_edited': True
                    }
                )

        elif message_type == 'edit_comment':
            comment_id = data.get('commentId')
            message_id = data.get('messageId')
            new_text = data.get('text', '')
            if comment_id and new_text and await self.edit_comment_from_db(comment_id, new_text):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'comment_edited',
                        'commentId': comment_id,
                        'messageId': message_id,
                        'text': new_text,
                        'is_edited': True
                    }
                )

        elif message_type == 'create_poll':
            sender_identifier = data.get('senderId')
            sender_id = None
            if self.user and hasattr(self.user, 'id') and self.user.id:
                sender_id = self.user.id
            elif sender_identifier:
                sender_id = await self.get_user_id_from_username(sender_identifier)

            if sender_id:
                saved = await self.save_poll(
                    sender_id=sender_id,
                    text=data.get('text', 'Poll'),
                    question=data.get('question'),
                    option_a=data.get('optionA'),
                    option_b=data.get('optionB'),
                    is_system_generated=data.get('isSystemGenerated', False)
                )
                if saved:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            **saved,
                            'chatId': self.chat_id
                        }
                    )
        
        elif message_type == 'poll_vote':
            user_id = None
            if self.user and hasattr(self.user, 'id') and self.user.id:
                user_id = self.user.id

            poll_id = data.get('pollId')
            option = data.get('option')

            if user_id and poll_id and option:
                result = await self.save_poll_vote(user_id, poll_id, option)
                if result:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'poll_vote_update',
                            **result,
                            'chatId': self.chat_id
                        }
                    )

        elif message_type == 'sponsorship_response':
            user_id = None
            if self.user and hasattr(self.user, 'id') and self.user.id:
                user_id = self.user.id

            sponsorship_id = data.get('sponsorshipId')
            accepted = data.get('accepted')

            if user_id and sponsorship_id:
                result = await self.handle_sponsorship_vote(user_id, sponsorship_id, accepted)
                if result:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'sponsorship_update',
                            'sponsorship': result,
                            'chatId': self.chat_id
                        }
                    )

        elif message_type == 'toggle_visibility':
            if self.user:
                res = await self.toggle_visibility_in_db()
                if res:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'visibility_changed',
                            'userId': self.user.id,
                            'is_public': res['is_public'],
                            'username': res['username'],
                            'handle': res['handle'],
                            'avatar': res['avatar'],
                            'avatar_url': res['avatar_url']
                        }
                    )

        elif message_type == 'reaction':
            user_id = None
            if self.user and hasattr(self.user, 'id') and self.user.id:
                user_id = self.user.id
            else:
                username = data.get('username')
                if username:
                    user_id = await self.get_user_id_from_username(username)

            message_id = data.get('messageId')
            reaction_type = data.get('reactionType')

            if user_id and message_id and reaction_type:
                result = await self.save_reaction(user_id, message_id, reaction_type)
                if result:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_reaction',
                            'messageId': result['message_id'],
                            'reactionType': reaction_type,
                            'likes': result['likes'],
                            'dislikes': result['dislikes'],
                            'caps': result['caps'],
                            'smiles': result['smiles'],
                            'dominant_reaction': result['dominant_reaction'],
                            'chatId': self.chat_id
                        }
                    )
                    return

            # Fallback broadcast
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_reaction',
                    'messageId': data.get('messageId'),
                    'reactionType': data.get('reactionType'),
                    'chatId': self.chat_id
                }
            )

        elif message_type == 'conversation_reaction':
            user_id = None
            if self.user and hasattr(self.user, 'id') and self.user.id:
                user_id = self.user.id
            else:
                username = data.get('username')
                if username:
                    user_id = await self.get_user_id_from_username(username)

            reaction_type = data.get('reactionType', '')

            counts = None
            if user_id and reaction_type:
                counts = await self.save_conversation_reaction(user_id, reaction_type)

            # Always broadcast so chatters see the live animation
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'conversation_reaction_event',
                    'userId': user_id,
                    'reactionType': reaction_type,
                    'chatId': self.chat_id,
                    'likes': counts['likes'] if counts else None,
                    'dislikes': counts['dislikes'] if counts else None,
                    'caps': counts['caps'] if counts else None,
                    'smiles': counts['smiles'] if counts else None,
                    'status': counts['status'] if counts else None,
                }
            )

        elif message_type == 'message_comment':
            user_id = None
            username = data.get('username', '')
            if self.user and hasattr(self.user, 'id') and self.user.id:
                user_id = self.user.id
            elif username:
                user_id = await self.get_user_id_from_username(username)

            message_id = data.get('messageId')
            text = data.get('text', '')
            parent_id = data.get('parentId', None)

            if user_id and message_id and text:
                saved = await self.save_comment(user_id, message_id, text, parent_id)
                if saved:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message_comment',
                            'id': saved['id'],
                            'messageId': saved['message_id'],
                            'text': saved['text'],
                            'username': saved['username'],
                            'parentId': saved['parent_id'],
                            'chatId': self.chat_id
                        }
                    )
                    return

            # Fallback broadcast
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_comment',
                    'messageId': message_id,
                    'text': text,
                    'username': username,
                    'parentId': parent_id,
                    'chatId': self.chat_id
                }
            )

    async def visibility_changed(self, event):
        """Broadcast visibility change"""
        await self.send(text_data=json.dumps({
            'type': 'visibility_changed',
            'userId': event.get('userId'),
            'is_public': event.get('is_public'),
            'username': event.get('username'),
            'handle': event.get('handle'),
            'avatar': event.get('avatar'),
            'avatar_url': event.get('avatar_url'),
        }))

    # ─── Send to WebSocket (group event handlers) ────────────────────────

    async def chat_message(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'receive_message',
            'id': event.get('id'),
            'senderId': event.get('senderId'),
            'sender_username': event.get('sender_username'),
            'text': event.get('text'),
            'timestamp': event.get('timestamp'),
            'chatId': event.get('chatId'),
            'likes': event.get('likes', 0),
            'dislikes': event.get('dislikes', 0),
            'caps': event.get('caps', 0),
            'smiles': event.get('smiles', 0),
            'dominant_reaction': event.get('dominant_reaction', 'neutral'),
            'is_edited': event.get('is_edited', False),
            'message_type': event.get('message_type', 'text'),
            'poll_data': event.get('poll_data', None),
        }))

    async def chat_reaction(self, event):
        """Send reaction update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'update_reaction',
            'messageId': event.get('messageId'),
            'reactionType': event.get('reactionType'),
            'likes': event.get('likes'),
            'dislikes': event.get('dislikes'),
            'caps': event.get('caps'),
            'smiles': event.get('smiles'),
            'dominant_reaction': event.get('dominant_reaction'),
            'chatId': event.get('chatId')
        }))

    async def conversation_reaction_event(self, event):
        """Broadcast reader (public audience) reaction to chatters"""
        payload = {
            'type': 'receive_conversation_reaction',
            'userId': event.get('userId'),
            'reactionType': event.get('reactionType'),
            'chatId': event.get('chatId')
        }
        if event.get('likes') is not None:
            payload.update({
                'likes': event.get('likes'),
                'dislikes': event.get('dislikes'),
                'caps': event.get('caps'),
                'smiles': event.get('smiles'),
                'status': event.get('status'),
            })
        await self.send(text_data=json.dumps(payload))

    async def chat_message_comment(self, event):
        """Broadcast message comment"""
        await self.send(text_data=json.dumps({
            'type': 'receive_message_comment',
            'id': event.get('id'),
            'messageId': event.get('messageId'),
            'text': event.get('text'),
            'username': event.get('username'),
            'parentId': event.get('parentId'),
            'chatId': event.get('chatId'),
            'is_edited': event.get('is_edited', False),
        }))

    async def poll_vote_update(self, event):
        """Broadcast poll vote updates"""
        await self.send(text_data=json.dumps({
            'type': 'update_poll_vote',
            'poll_id': event.get('poll_id'),
            'message_id': event.get('message_id'),
            'votes_a': event.get('votes_a'),
            'votes_b': event.get('votes_b'),
            'voters_a': event.get('voters_a'),
            'voters_b': event.get('voters_b'),
            'chatId': event.get('chatId')
        }))

    async def sponsorship_update(self, event):
        """Broadcast sponsorship updates"""
        await self.send(text_data=json.dumps({
            'type': 'update_sponsorship',
            'sponsorship': event.get('sponsorship'),
            'chatId': event.get('chatId')
        }))

