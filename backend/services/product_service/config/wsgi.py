import os
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()
application = WhiteNoise(application, static_prefix="/media/", root=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "media"))