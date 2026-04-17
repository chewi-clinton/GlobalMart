from django.db import models


class NotificationLog(models.Model):
    STATUS_CHOICES = [
        ("sent", "Sent"),
        ("failed", "Failed"),
        ("pending", "Pending"),
    ]

    log_id = models.BigAutoField(primary_key=True)
    user_id = models.IntegerField(db_index=True)
    event_type = models.CharField(max_length=50)
    recipient_email = models.EmailField(max_length=255)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notification_log"
        indexes = [
            models.Index(fields=["user_id"]),
            models.Index(fields=["event_type"]),
            models.Index(fields=["status"]),
        ]
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.event_type} → {self.recipient_email} — {self.status}"