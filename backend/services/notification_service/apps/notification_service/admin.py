from django.contrib import admin
from .models import NotificationLog


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ["log_id", "event_type", "recipient_email", "status", "sent_at"]
    list_filter = ["status", "event_type"]
    search_fields = ["recipient_email", "event_type"]
    ordering = ["-sent_at"]