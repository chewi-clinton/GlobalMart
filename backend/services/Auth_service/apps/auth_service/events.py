import json
import logging
import pika
from django.conf import settings

logger = logging.getLogger(__name__)

EXCHANGE = "globalmart.events"


def publish_event(routing_key: str, payload: dict):
    """
    Publish an event to the globalmart.events topic exchange.

    Routing keys used by this service:
      user.registered   — new account created
      user.verified     — email verified
      user.login        — successful login
      user.activated    — admin un-suspended a user
      user.suspended    — admin suspended a user

    Swallows all connection errors so the main request flow is never
    broken by a broker outage.
    """
    try:
        params = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(
            exchange=EXCHANGE,
            exchange_type="topic",
            durable=True,
        )

        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(
                delivery_mode=2,        # persistent — survives broker restart
                content_type="application/json",
            ),
        )

        connection.close()
        logger.info(f"Event published: {routing_key} → {payload}")

    except Exception as exc:
        logger.warning(
            f"RabbitMQ publish failed ({routing_key}): {exc}. "
            "Continuing without event."
        )