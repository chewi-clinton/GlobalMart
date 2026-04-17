from django.core.management.base import BaseCommand
from apps.notification_service.consumer import start_consuming


class Command(BaseCommand):
    help = "Starts the RabbitMQ event consumer for the notification service."

    def handle(self, *args, **options):
        self.stdout.write("Starting notification service consumer...")
        start_consuming()