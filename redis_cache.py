import json
import os
from typing import Any

from dotenv import load_dotenv
from redis import Redis
from redis.exceptions import RedisError


load_dotenv()


REDIS_CACHE_URL = os.getenv(
    "REDIS_CACHE_URL",
    "redis://localhost:6379/2",
)


redis_client = Redis.from_url(
    REDIS_CACHE_URL,
    decode_responses=True,
)


JOB_STATUS_TTL = 60 * 60 * 24
DASHBOARD_TTL = 60 * 5


def set_job_status(
    job_id: int,
    status: str,
    progress: int,
    error: str | None = None,
):
    mapping = {
        "status": status,
        "progress": str(progress),
    }

    if error is not None:
        mapping["error"] = error

    try:
        key = f"analysis_job:{job_id}"

        redis_client.hset(
            key,
            mapping=mapping,
        )

        redis_client.expire(
            key,
            JOB_STATUS_TTL,
        )

    except RedisError:
        pass


def get_job_status(
    job_id: int,
) -> dict[str, Any] | None:

    try:
        data = redis_client.hgetall(
            f"analysis_job:{job_id}"
        )

    except RedisError:
        return None

    if not data:
        return None

    return {
        "status": data.get("status"),
        "progress": int(
            data.get("progress", 0)
        ),
        "error": data.get("error"),
    }


def cache_dashboard(
    organization_id: int,
    dashboard: dict[str, Any],
):
    try:
        redis_client.setex(
            f"dashboard:{organization_id}",
            DASHBOARD_TTL,
            json.dumps(
                dashboard,
                ensure_ascii=False,
                default=str,
            ),
        )

    except RedisError:
        pass


def get_cached_dashboard(
    organization_id: int,
) -> dict[str, Any] | None:

    try:
        value = redis_client.get(
            f"dashboard:{organization_id}"
        )

    except RedisError:
        return None

    if value is None:
        return None

    return json.loads(value)


def invalidate_dashboard(
    organization_id: int,
):
    try:
        redis_client.delete(
            f"dashboard:{organization_id}"
        )

    except RedisError:
        pass