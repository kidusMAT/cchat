# Deployment Guide: Vercel & Neon PostgreSQL

This guide explains how to deploy **CChat** (Django backend + React Vite frontend) to **Vercel** with a **Neon PostgreSQL** serverless database.

---

## 1. Setup Neon PostgreSQL Database

1. Sign up or log into [Neon Console](https://console.neon.tech/).
2. Create a new project (e.g. `cchat-db`).
3. Copy the **Pooled Connection String** (or Direct Connection String) provided in your dashboard. It looks like:
   ```text
   postgresql://neondb_owner:<password>@ep-<id>-pooler.<region>.aws.neon.tech/neondb?sslmode=require
   ```
4. Run migrations against your Neon database from your local machine (or CI):
   ```bash
   # Set your DATABASE_URL temporarily or in your .env
   python manage.py migrate
   python manage.py createsuperuser
   ```

---

## 2. Deploying to Vercel

### Option A: Monorepo Deployment (Recommended - 1 Project for Both Frontend & Backend)

The project includes `vercel.json` configured with `@vercel/python` for the backend and `@vercel/static-build` for the Vite frontend.

1. Push your code to GitHub / GitLab / Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
3. Import your `cchat` repository.
4. In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string (with `?sslmode=require`).
   - `DJANGO_SECRET_KEY`: A strong, secure random string.
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.vercel.app,localhost` (or `*`)
   - `CORS_ALLOW_ALL_ORIGINS`: `True` (or your production frontend URL)
5. Click **Deploy**.

---

### Option B: Separate Frontend & Backend Projects

If you prefer two separate Vercel projects (or hosting Django on Render/Railway and Frontend on Vercel):

#### 1. Backend Project:
- Root Directory: `./`
- Environment Variables: `DATABASE_URL`, `DJANGO_SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.

#### 2. Frontend Project:
- Root Directory: `frontend`
- Framework Preset: `Vite`
- Environment Variables:
  - `VITE_API_URL`: Your backend URL (e.g. `https://cchat-backend.vercel.app` or `https://cchat-backend.onrender.com`)
  - `VITE_WS_URL`: (Optional) Your WebSocket endpoint if using Daphne/Channels.

---

## 3. Environment Variables Reference

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL pooled connection URI | `postgresql://user:pass@ep-xyz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `DJANGO_SECRET_KEY` | Secret key for cryptographic signing | `django-insecure-...` |
| `DEBUG` | Enable/Disable debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames | `.vercel.app,localhost` |
| `CORS_ALLOWED_ORIGINS`| Whitelisted frontend domains | `https://your-frontend.vercel.app` |
| `CSRF_TRUSTED_ORIGINS`| Whitelisted CSRF domains | `https://*.vercel.app` |
| `REDIS_URL` | (Optional) Redis connection for real-time channels | `rediss://default:pass@...upstash.io:6379` |

---

## 4. Static Files & Production Assets

- **WhiteNoise** is integrated into `cchat/settings.py` for serving Django admin and API static assets.
- `collectstatic` runs automatically during build or can be triggered via `python manage.py collectstatic --no-input`.
