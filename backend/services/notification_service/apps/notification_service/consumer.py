import json
import logging
import pika
from django.conf import settings

logger = logging.getLogger(__name__)

EXCHANGE = "globalmart.events"
QUEUE = "notification_service_queue"

ROUTING_KEYS = [
    "order.placed",
    "payment.completed",
    "payment.failed",
    "inventory.low_stock",
    "kyc.submitted",
    "kyc.approved",
    "kyc.rejected",
    "customer.tier_upgraded",
]


def handle_event(routing_key, payload):
    from .email_sender import send_notification

    logger.info(f"Handling event: {routing_key}")

    try:
        if routing_key == "order.placed":
            send_notification(
                user_id=payload.get("customer_id", 0),
                recipient_email=payload.get("customer_email", settings.ADMIN_EMAIL),
                subject="Your GlobalMart Order Has Been Placed!",
                message=f"Thank you for your order!\n\nOrder ID: #{payload.get('order_id')}\nTotal: {payload.get('currency_code')} {payload.get('total_amount')}\n\nWe will notify you once your order is confirmed.",
                event_type="order.placed",
            )

        elif routing_key == "payment.completed":
            send_notification(
                user_id=payload.get("customer_id", 0),
                recipient_email=payload.get("customer_email", settings.ADMIN_EMAIL),
                subject="Payment Successful — GlobalMart",
                message=f"Your payment was successful!\n\nOrder ID: #{payload.get('order_id')}\nAmount: {payload.get('currency_code')} {payload.get('amount')}\n\nYour order is now being processed.",
                event_type="payment.completed",
            )

        elif routing_key == "payment.failed":
            send_notification(
                user_id=payload.get("customer_id", 0),
                recipient_email=payload.get("customer_email", settings.ADMIN_EMAIL),
                subject="Payment Failed — GlobalMart",
                message=f"Unfortunately your payment failed.\n\nOrder ID: #{payload.get('order_id')}\n\nPlease try again or contact support.",
                event_type="payment.failed",
            )

        elif routing_key == "inventory.low_stock":
            send_notification(
                user_id=0,
                recipient_email=settings.ADMIN_EMAIL,
                subject="Low Stock Alert — GlobalMart",
                message=f"Product ID {payload.get('product_id')} is running low.\n\nCurrent stock: {payload.get('quantity_on_hand')}\nReorder threshold: {payload.get('reorder_threshold')}\nWarehouse ID: {payload.get('warehouse_id')}",
                event_type="inventory.low_stock",
            )

        elif routing_key == "kyc.submitted":
            send_notification(
                user_id=0,
                recipient_email=settings.ADMIN_EMAIL,
                subject="New KYC Submission — GlobalMart",
                message=f"A new KYC document has been submitted.\n\nSeller ID: {payload.get('seller_id')}\nBusiness: {payload.get('business_name')}\n\nPlease review in the admin dashboard.",
                event_type="kyc.submitted",
            )

        elif routing_key == "kyc.approved":
            send_notification(
                user_id=payload.get("user_id", 0),
                recipient_email=payload.get("seller_email", settings.ADMIN_EMAIL),
                subject="KYC Approved — GlobalMart",
                message=f"Congratulations! Your KYC has been approved.\n\nBusiness: {payload.get('business_name')}\n\nYour seller account is now active.",
                event_type="kyc.approved",
            )

        elif routing_key == "kyc.rejected":
            send_notification(
                user_id=payload.get("user_id", 0),
                recipient_email=payload.get("seller_email", settings.ADMIN_EMAIL),
                subject="KYC Rejected — GlobalMart",
                message=f"Your KYC submission was rejected.\n\nBusiness: {payload.get('business_name')}\nNotes: {payload.get('notes', 'No notes provided')}\n\nPlease resubmit with valid documents.",
                event_type="kyc.rejected",
            )

        elif routing_key == "customer.tier_upgraded":
            send_notification(
                user_id=payload.get("user_id", 0),
                recipient_email=payload.get("customer_email", settings.ADMIN_EMAIL),
                subject="Congratulations! You've Been Upgraded — GlobalMart",
                message=f"Great news! Your loyalty tier has been upgraded.\n\nNew Tier: {payload.get('new_tier')}\nDiscount: {payload.get('discount_pct')}%\n\nEnjoy your new benefits!",
                event_type="customer.tier_upgraded",
            )

    except Exception as e:
        logger.error(f"Error handling event {routing_key}: {e}")


def start_consuming():
    try:
        params = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(
            exchange=EXCHANGE,
            exchange_type="topic",
            durable=True,
        )

        channel.queue_declare(queue=QUEUE, durable=True)

        for routing_key in ROUTING_KEYS:
            channel.queue_bind(
                exchange=EXCHANGE,
                queue=QUEUE,
                routing_key=routing_key,
            )

        def callback(ch, method, properties, body):
            try:
                payload = json.loads(body)
                handle_event(method.routing_key, payload)
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE, on_message_callback=callback)

        logger.info("Notification service consumer started. Waiting for events...")
        channel.start_consuming()

    except Exception as e:
        logger.error(f"Consumer error: {e}")
        raise