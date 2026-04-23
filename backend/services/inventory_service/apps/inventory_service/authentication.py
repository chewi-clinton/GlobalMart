from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class TokenPayload:
    """Dict-like wrapper around JWT payload claims; no DB lookup required."""

    is_authenticated = True

    def __init__(self, payload):
        self._payload = payload

    def get(self, key, default=None):
        return self._payload.get(key, default)

    def __getitem__(self, key):
        return self._payload[key]

    def __contains__(self, key):
        return key in self._payload

    def __str__(self):
        return f"TokenPayload(user_id={self._payload.get('user_id')})"


class JWTPayloadAuthentication(BaseAuthentication):
    """
    Validates a Bearer JWT token and exposes its payload as request.user.
    No database lookup — the user record lives only in the auth service.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        raw_token = auth_header.split(" ", 1)[1]

        try:
            token = UntypedToken(raw_token)
        except (InvalidToken, TokenError) as exc:
            raise AuthenticationFailed(str(exc))

        return TokenPayload(token.payload), raw_token

    def authenticate_header(self, request):
        return "Bearer"
