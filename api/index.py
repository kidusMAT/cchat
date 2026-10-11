import os
import sys
from pathlib import Path

# Ensure project root is in sys.path for serverless execution
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cchat.settings')

app = get_wsgi_application()
application = app
handler = app
