import logging
from django.core.mail import send_mail
from django.conf import settings
from .models import NotificationLog

logger = logging.getLogger(__name__)


def send_notification(user_id, recipient_email, subject, message, event_type):
    """
    Sends an email and logs it to the notification_log table.
    """
    log = NotificationLog.objects.create(
        user_id=user_id,
        event_type=event_type,
        recipient_email=recipient_email,
        subject=subject,
        message=message,
        status="pending",
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        log.status = "sent"
        log.save()
        logger.info(f"Email sent: {event_type} → {recipient_email}")
    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.save()
        logger.error(f"Email failed: {event_type} → {recipient_email}: {e}")