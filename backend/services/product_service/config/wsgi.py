import os
import ssl
import urllib3.util.ssl_ as _urllib3_ssl
import urllib3.connection as _urllib3_conn

_orig_create_urllib3_context = _urllib3_ssl.create_urllib3_context

def _patched_create_urllib3_context(*args, **kwargs):
    ctx = _orig_create_urllib3_context(*args, **kwargs)
    try:
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except ssl.SSLError:
        pass
    return ctx

_urllib3_ssl.create_urllib3_context = _patched_create_urllib3_context
_urllib3_conn.create_urllib3_context = _patched_create_urllib3_context

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()