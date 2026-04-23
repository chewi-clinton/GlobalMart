import os
import ssl
import logging
import urllib3.util.ssl_ as _urllib3_ssl
import urllib3.connection as _urllib3_conn

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

_orig_create_urllib3_context = _urllib3_ssl.create_urllib3_context

def _patched_create_urllib3_context(*args, **kwargs):
    ctx = _orig_create_urllib3_context(*args, **kwargs)
    try:
        ctx.set_ciphers('DEFAULT:@SECLEVEL=1')
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        logger.debug("SSL patch applied: SECLEVEL=1, verify_mode=CERT_NONE")
    except Exception as e:
        logger.warning(f"SSL patch warning: {e}")
    return ctx

_urllib3_ssl.create_urllib3_context = _patched_create_urllib3_context
_urllib3_conn.create_urllib3_context = _patched_create_urllib3_context

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

logger.info("WSGI loaded with SSL patches active")