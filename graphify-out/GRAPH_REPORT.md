# Graph Report - cchat  (2026-10-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 434 nodes · 861 edges · 34 communities (17 shown, 17 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 137 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d85192bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- views.py
- ChatConsumer
- models.py
- serializers.py
- App.jsx
- CChatAPITestCase
- Conversation
- devDependencies
- dependencies
- admin.py
- JWTAuthMiddleware
- ConversationSerializer
- ChatConfig
- main
- graphify.js
- settings.py
- wsgi.py
- 0001_initial.py
- 0002_message_views_count.py
- 0003_alter_message_options_remove_message_comments_count_and_more.py
- 0004_conversation_caps_conversation_dislikes_and_more.py
- 0005_message_smiles_alter_messagereaction_reaction_type.py
- 0006_messagecomment_parent.py
- 0007_message_is_edited_messagecomment_is_edited.py
- 0008_alter_conversationreaction_options_and_more.py
- 0009_conversation_is_removed_message_is_removed_and_more.py
- 0010_profile_verification_reviewed_at_and_more.py
- 0011_conversationbookmark.py
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `ChatConsumer` - 45 edges
2. `CChatAPITestCase` - 34 edges
3. `Conversation` - 32 edges
4. `Message` - 26 edges
5. `ChatVisibility` - 21 edges
6. `AnonymousProfile` - 20 edges
7. `SponsorshipRequest` - 19 edges
8. `ConversationSerializer` - 17 edges
9. `MessageSerializer` - 16 edges
10. `Follow` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ChatConsumer` --uses--> `Message`  [INFERRED]
  chat/consumers.py → chat/models.py
- `MessageSerializer` --uses--> `Message`  [INFERRED]
  chat/serializers.py → chat/models.py
- `CChatAPITestCase` --uses--> `Message`  [INFERRED]
  chat/tests.py → chat/models.py
- `ProfileSerializer` --uses--> `Profile`  [INFERRED]
  chat/serializers.py → chat/models.py
- `ChatConsumer` --uses--> `AnonymousProfile`  [INFERRED]
  chat/consumers.py → chat/models.py

## Import Cycles
- None detected.

## Communities (34 total, 17 thin omitted)

### Community 0 - "views.py"
Cohesion: 0.05
Nodes (85): api_view, Block, Message, Individual message in a conversation, Get the dominant reaction type for background color, Get existing or create new anonymous profile, ProfileSerializer, Serializer for User model (+77 more)

### Community 1 - "ChatConsumer"
Cohesion: 0.08
Nodes (15): AsyncWebsocketConsumer, ChatConsumer, database_sync_to_async, Save/toggle a conversation-level reaction in the database., Save a message comment to the database., Save a message to the database and return its serialized form., Look up a user ID from a username., Save/toggle a message reaction in the database. Returns updated counts. (+7 more)

### Community 2 - "models.py"
Cohesion: 0.08
Nodes (26): AnonymousProfile, ChatVisibility, ConversationBookmark, ConversationReaction, create_user_profile(), Follow, MessageComment, MessagePoll (+18 more)

### Community 3 - "serializers.py"
Cohesion: 0.07
Nodes (26): MessageReaction, Post, Track individual user reactions to messages, User posts for profile display, AnonymousProfileSerializer, ChatterProfileSerializer, ChatVisibilitySerializer, FollowSerializer (+18 more)

### Community 4 - "App.jsx"
Cohesion: 0.11
Nodes (25): AccountPage(), App(), authConfig(), Avatar(), ChatPage(), clearSession(), CreateThreadModal(), displayName() (+17 more)

### Community 5 - "CChatAPITestCase"
Cohesion: 0.12
Nodes (5): CChatAPITestCase, JWTBlacklistConfigurationTest, TestCase, The detail endpoint must not expose a private room by guessed id., patch

### Community 6 - "Conversation"
Cohesion: 0.09
Nodes (13): Conversation, Get the other participant in a 2-person conversation, Ad sponsorship request for a conversation, Derive overall status: PENDING / ACCEPTED / REJECTED, Chat conversation between users, Get the last message in this conversation, Check if this conversation is public for a specific user, SponsorshipRequest (+5 more)

### Community 7 - "devDependencies"
Cohesion: 0.08
Nodes (24): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+16 more)

### Community 8 - "dependencies"
Cohesion: 0.10
Nodes (21): axios, framer-motion, dependencies, axios, framer-motion, lucide-react, react, react-dom (+13 more)

### Community 9 - "admin.py"
Cohesion: 0.15
Nodes (17): AnonymousProfileAdmin, ChatVisibilityAdmin, ConversationAdmin, ConversationReactionAdmin, FollowAdmin, MessageAdmin, MessageCommentAdmin, MessagePollAdmin (+9 more)

### Community 10 - "JWTAuthMiddleware"
Cohesion: 0.18
Nodes (7): BaseMiddleware, get_user_from_token(), JWTAuthMiddleware, database_sync_to_async, JWT Authentication Middleware for Django Channels WebSocket connections. The…, Validate a JWT access token and return the corresponding User., Extracts JWT token from the WebSocket query string and attaches the…

### Community 11 - "ConversationSerializer"
Cohesion: 0.17
Nodes (6): ConversationSerializer, Serializer for Conversation model, Check if conversation is public for current user or anyone, Get the other participant's info, Get current user's reactions that were made AFTER the last message, Return the conversation status relative to other chats

## Knowledge Gaps
- **38 isolated node(s):** `Migration`, `Migration`, `Migration`, `Migration`, `Migration` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ChatConsumer` connect `ChatConsumer` to `views.py`, `models.py`, `serializers.py`, `CChatAPITestCase`, `Conversation`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `CChatAPITestCase` connect `CChatAPITestCase` to `views.py`, `ChatConsumer`, `models.py`, `Conversation`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `Conversation` connect `Conversation` to `views.py`, `ChatConsumer`, `models.py`, `serializers.py`, `CChatAPITestCase`, `admin.py`, `ConversationSerializer`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `ChatConsumer` (e.g. with `AnonymousProfile` and `ChatVisibility`) actually correct?**
  _`ChatConsumer` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `CChatAPITestCase` (e.g. with `ChatConsumer` and `AnonymousProfile`) actually correct?**
  _`CChatAPITestCase` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `Conversation` (e.g. with `ChatConsumer` and `ConversationSerializer`) actually correct?**
  _`Conversation` has 18 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Migration`, `Migration`, `Migration` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._