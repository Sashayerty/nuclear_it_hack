import os

from dotenv import load_dotenv
from minio import Minio


load_dotenv()


MINIO_BUCKET = os.getenv(
    "MINIO_BUCKET",
    "ai-datasets",
)


minio_client = Minio(
    endpoint=os.getenv(
        "MINIO_ENDPOINT",
        "localhost:9000",
    ),
    access_key=os.getenv("MINIO_ACCESS_KEY"),
    secret_key=os.getenv("MINIO_SECRET_KEY"),
    secure=os.getenv(
        "MINIO_SECURE",
        "false",
    ).lower() == "true",
)


def ensure_bucket():
    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)