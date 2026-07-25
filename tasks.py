from datetime import datetime, timezone
from io import StringIO
import csv
import json

from celery_app import celery_app

from database import SessionLocal
from models import (
    AnalysisJob,
    AnalysisRun,
    AnalysisStatus,
    Dataset,
    DatasetStatus,
    JobStatus,
)
from redis_cache import set_job_status
from storage import MINIO_BUCKET, minio_client

from src.pipeline import run_analysis_pipeline


def load_logs_from_minio(dataset: Dataset) -> list[str]:

    prefix = f"s3://{MINIO_BUCKET}/"

    if not dataset.file_uri.startswith(prefix):
        raise ValueError(
            f"Некорректный file_uri: {dataset.file_uri}"
        )

    object_name = dataset.file_uri[len(prefix):]

    response = minio_client.get_object(
        MINIO_BUCKET,
        object_name,
    )

    try:
        raw_bytes = response.read()
    finally:
        response.close()
        response.release_conn()

    text = raw_bytes.decode("utf-8-sig")

    text_column = "text"

    if dataset.column_mapping:
        text_column = dataset.column_mapping.get(
            "text_column",
            "text",
        )

    # TXT
    if dataset.file_format == "txt":
        return [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

    # CSV
    if dataset.file_format == "csv":
        reader = csv.DictReader(
            StringIO(text)
        )

        logs = []

        for row in reader:
            value = row.get(text_column)

            if value:
                logs.append(str(value))

        return logs

    if dataset.file_format == "jsonl":
        logs = []

        for line in text.splitlines():
            if not line.strip():
                continue

            item = json.loads(line)

            value = item.get(text_column)

            if value:
                logs.append(str(value))

        return logs

    if dataset.file_format == "json":
        data = json.loads(text)

        if not isinstance(data, list):
            raise ValueError(
                "JSON должен содержать массив объектов"
            )

        logs = []

        for item in data:
            if not isinstance(item, dict):
                continue

            value = item.get(text_column)

            if value:
                logs.append(str(value))

        return logs

    raise ValueError(
        f"Формат {dataset.file_format} не поддерживается"
    )


@celery_app.task(
    name="process_dataset_analysis_task"
)
def process_dataset_analysis_task(
    dataset_id: int,
    analysis_run_id: int,
    job_id: int,
):
    db = SessionLocal()

    try:
        dataset = db.get(
            Dataset,
            dataset_id,
        )

        analysis_run = db.get(
            AnalysisRun,
            analysis_run_id,
        )

        job = db.get(
            AnalysisJob,
            job_id,
        )

        if dataset is None:
            raise ValueError("Dataset не найден")

        if analysis_run is None:
            raise ValueError("AnalysisRun не найден")

        if job is None:
            raise ValueError("AnalysisJob не найден")

        dataset.status = DatasetStatus.processing
        analysis_run.status = AnalysisStatus.processing
        analysis_run.started_at = datetime.now(
            timezone.utc
        )

        job.status = JobStatus.processing
        job.progress = 5

        db.commit()

        set_job_status(
            job.id,
            "processing",
            5,
        )

        raw_logs = load_logs_from_minio(
            dataset
        )

        dataset.rows_count = len(raw_logs)

        job.progress = 15
        db.commit()

        set_job_status(
            job.id,
            "processing",
            15,
        )

        report = run_analysis_pipeline(
            raw_logs
        )

        job.result_data = report
        job.status = JobStatus.completed
        job.progress = 100
        job.finished_at = datetime.now(
            timezone.utc
        )

        analysis_run.status = (
            AnalysisStatus.completed
        )
        analysis_run.finished_at = (
            datetime.now(timezone.utc)
        )

        dataset.status = DatasetStatus.completed
        dataset.processed_at = (
            datetime.now(timezone.utc)
        )

        db.commit()

        set_job_status(
            job.id,
            "completed",
            100,
        )

        return {
            "dataset_id": dataset.id,
            "analysis_run_id": analysis_run.id,
            "job_id": job.id,
            "status": "completed",
        }

    except Exception as exc:
        db.rollback()

        job = db.get(
            AnalysisJob,
            job_id,
        )

        analysis_run = db.get(
            AnalysisRun,
            analysis_run_id,
        )

        dataset = db.get(
            Dataset,
            dataset_id,
        )

        if job:
            job.status = JobStatus.failed
            job.error_message = str(exc)

        if analysis_run:
            analysis_run.status = (
                AnalysisStatus.failed
            )

        if dataset:
            dataset.status = DatasetStatus.failed

        db.commit()

        set_job_status(
            job_id,
            "failed",
            100,
            str(exc),
        )

        raise

    finally:
        db.close()
