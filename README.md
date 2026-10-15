# CCHAT — The Plot is Public

> *"Real chats. Main-character energy. A little less posting. A lot more plot."*

CCHAT is a production-grade social conversation platform where users engage in encrypted private messaging and choose to curate and publish dialogue excerpts ("plots") to public discovery feeds with community reactions.

---

## 🏗 Architecture & Tech Stack

```
┌─────────────────────────────────┐        ┌───────────────────────────────────┐
│     Frontend (React 19 + Vite)  │        │   Backend (Django 5.2 + DRF)      │
│ • Tailwind CSS v4               │  HTTP  │ • Token & Session Authentication  │
│ • Lucide Icons                  │ ─────> │ • WhiteNoise Static Compression   │
│ • Vitest Unit Testing           │  /api  │ • Scoped Rate Throttling          │
│ • Reverse-Proxy / Dev Proxy     │        │ • PostgreSQL / SQLite Abstraction │
└─────────────────────────────────┘        └───────────────────────────────────┘
```

- **Backend**: Django 5.2, Django REST Framework, WhiteNoise, `dj-database-url`, Gunicorn, PostgreSQL/SQLite.
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite 8, Vitest.
- **Containerization & CI**: Multi-stage Dockerfiles, Docker Compose, GitHub Actions.

---

## 🔒 Security & Privacy Model

1. **Authentication & Authorization**:
   - All private conversation endpoints require `IsAuthenticated`.
   - Default permission class defaults to `IsAuthenticatedOrReadOnly`.
   - Token authentication via `Authorization: Token <key>` and Django session cookies.

2. **Strict Participant Isolation**:
   - `ConversationViewSet` filters queries strictly by authenticated participant (`participants=request.user.profile`).
   - Non-participants cannot view conversation metadata, read messages, or post new messages.

3. **Public Excerpt Boundaries**:
   - Reactions (`/api/excerpts/messages/<id>/react/`) strictly verify that the target message belongs to an **active public excerpt**. Private messages cannot be reacted to or probed.
   - Unpublished conversation messages remain strictly private.

4. **Production Hardening**:
   - HSTS (`SECURE_HSTS_SECONDS=31536000`), HSTS preload, and include subdomains.
   - `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, and `CSRF_COOKIE_SECURE`.
   - WhiteNoise static asset compression with hash cache-busting.
   - Scoped rate limiting on sensitive operations: message sending (`60/min`), reactions (`240/min`), reports (`10/hr`), and inquiries (`10/hr`).
   - CORS strictly restricted to authorized origins (wildcard CORS with credentials eliminated).

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+ (with npm)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Seed demo users & storylines
python seed_data.py

# Run Django development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be available at [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/).

### 2. Frontend Setup

In the repository root:

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser. API requests to `/api` are automatically proxied to the Django server.

---

## 🧪 Testing & Verification

### Running Backend Tests
The backend test suite verifies authentication, permissions, privacy isolation, reactions, report filing, and moderation:

```bash
cd backend
python manage.py test apps
```
All 27 test cases run against isolated test databases.

### Running Frontend Tests
Frontend unit and contract tests verify API token handling, message dispatching, and form payloads:

```bash
npm test
```

### Running Linter & Production Build

```bash
# Oxlint
npm run lint

# TypeScript verification and optimized chunk build
npm run build
```
Chunks are automatically split into vendor and feature bundles with zero chunk-size warnings.

### Django Deployment Security Verification

```bash
DJANGO_DEBUG=False DJANGO_SECRET_KEY="production-quality-secure-key-longer-than-fifty-characters" python backend/manage.py check --deploy
```

---

## 🐳 Docker & Production Deployment

### Using Docker Compose (Full Stack)
The repository includes a ready-to-run [docker-compose.yml](file:///home/inthesession/cc/cchat/docker-compose.yml) setting up PostgreSQL 16, Django with Gunicorn, and Nginx:

```bash
# 1. Configure environment
cp .env.example .env

# 2. Build and launch containers
docker compose up --build -d

# 3. Apply database migrations
docker compose exec backend python manage.py migrate

# 4. (Optional) Seed initial data
docker compose exec backend python seed_data.py
```

Access the app on port `80` (Nginx frontend) and API on port `8000` (Django).

---

## ⚙️ Environment Variables

See [.env.example](file:///home/inthesession/cc/cchat/.env.example) for a complete list of configurable variables:

| Variable | Default | Description |
|---|---|---|
| `DJANGO_DEBUG` | `False` | Enables or disables Django debug mode |
| `DJANGO_SECRET_KEY` | - | Cryptographic key for Django sessions and signing |
| `DJANGO_ALLOWED_HOSTS` | `127.0.0.1,localhost` | Valid HTTP Host headers |
| `DATABASE_URL` | `sqlite:///backend/db.sqlite3` | PostgreSQL or SQLite connection URI |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Allowed origins for cross-origin requests |
| `SECURE_SSL_REDIRECT` | `True` | Forces HTTPS redirection in production |
| `VITE_API_URL` | `""` (relative `/api`) | Frontend API base URL |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/`: Register a new user account and profile.
- `POST /api/auth/login/`: Obtain Token via username/password.
- `POST /api/auth/demo-login/`: Switch demo account (Maya, Jules, Nina, Leo).
- `POST /api/auth/logout/`: Invalidate authentication token.
- `GET /api/auth/me/`: Retrieve authenticated user profile.

### Conversations & Messages
- `GET /api/chats/`: List conversations where authenticated user is a participant.
- `POST /api/chats/`: Start a new conversation.
- `GET /api/chats/<id>/`: View chat details and messages.
- `POST /api/chats/<id>/send_message/`: Send a message in a private chat.
- `POST /api/chats/<id>/publish/`: Publish dialogue excerpt to public feed.
- `POST /api/chats/<id>/remove_publication/`: Unpublish excerpt.

### Excerpts & Feed
- `GET /api/excerpts/`: Public excerpt feed (supports `?tab=fresh`, `?tab=following`, `?topic=<tag>`).
- `POST /api/excerpts/<id>/toggle_save/`: Bookmark/save public excerpt for user.
- `POST /api/excerpts/messages/<msg_id>/react/`: React to public excerpt message (❤️, 🧢, 💀, 🔥).
- `GET /api/saved/`: List user's saved excerpts.
- `GET /api/topics/`: List trending conversation topics.

### Moderation & Sponsorship
- `POST /api/moderation/report/`: File conversation/content moderation report.
- `POST /api/privacy/request/`: Submit GDPR/CCPA privacy data request.
- `POST /api/sponsorship/inquiry/`: Submit partner brand inquiry.
- `GET /api/sponsorship/after-hours/`: Retrieve After Hours placement details.

---

## 📜 License
© 2026 CCHAT. Keep it human.
