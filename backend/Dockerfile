# Production Dockerfile for CCHAT Django Backend
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files into STATIC_ROOT using WhiteNoise.  A failure here must
# fail the image build rather than silently producing an incomplete release.
RUN DJANGO_DEBUG=False \
    DJANGO_SECRET_KEY=build-time-secret-key-that-is-long-and-unique-for-static-build-only \
    DJANGO_ALLOWED_HOSTS=localhost \
    python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "cchat_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60"]
