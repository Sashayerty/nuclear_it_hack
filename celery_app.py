import os

from celery import Celery
from dotenv import load_dotenv


load_dotenv()


BROKER_URL = os.getenv(
    "CELERY_BROKER_URL",
    "redis://localhost:6379/0",
)

RESULT_BACKEND = os.getenv(
    "CELERY_RESULT_BACKEND",
    "redis://localhost:6379/1",
)


REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:6379/0",
)

celery_app = Celery(
    "ai_analytics",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "tasks",
    ],
)


celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    timezone="UTC",
    enable_utc=True,

    task_track_started=True,

    broker_connection_retry_on_startup=True,

    result_expires=3600,
)