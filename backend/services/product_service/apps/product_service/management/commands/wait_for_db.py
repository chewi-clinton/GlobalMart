import time
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Polls the database until it is ready to accept connections."

    def handle(self, *args, **options):
        self.stdout.write("Waiting for database...")
        max_retries = 30
        for attempt in range(1, max_retries + 1):
            try:
                connection.ensure_connection()
                self.stdout.write(self.style.SUCCESS("Database ready!"))
                return
            except OperationalError:
                self.stdout.write(
                    f"  Attempt {attempt}/{max_retries} — not ready, retrying in 2s..."
                )
                time.sleep(2)

        self.stderr.write(self.style.ERROR("Database never became ready. Exiting."))
        raise SystemExit(1)