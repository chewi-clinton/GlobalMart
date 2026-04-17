from rest_framework import serializers
from .models import NotificationLog


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = [
            "log_id", "user_id", "event_type",
            "recipient_email", "subject", "message",
            "status", "error_message", "sent_at",
        ]