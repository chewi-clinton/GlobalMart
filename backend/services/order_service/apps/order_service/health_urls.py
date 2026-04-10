from django.urls import path
from django.http import JsonResponse
from django.db import connection


def health_check(request):
    try:
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "error"

    return JsonResponse({
        "service": "order_service",
        "status": "ok",
        "database": db_status,
    })


urlpatterns = [
    path("", health_check, name="health"),
]