from datetime import datetime, timezone

from fastapi.encoders import jsonable_encoder

from celery_app import celery_app
from database import SessionLocal
from dataset_reader import extract_logs
from redis_cache import (
    invalidate_dashboard,
    set_job_status,
)
from storage import (
    MINIO_BUCKET,
    minio_client,
)


def now():
    return datetime.now(
        timezone.utc
    ).replace(tzinfo=None)


@celery_app.task(
    bind=True,
    name="analysis.process_dataset",
)
def process_dataset_analysis_task(
    self,
    dataset_id: int,
    analysis_run_id: int,
    job_id: int,
):
    from models import (
        AnalysisJob,
        AnalysisRun,
        AnalysisStatus,
        Dataset,
        DatasetStatus,
        JobStatus,
    )

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

        if (
            dataset is None
            or analysis_run is None
            or job is None
        ):
            raise RuntimeError(
                "Не найдены Dataset, AnalysisRun или AnalysisJob"
            )

        if not job.external_task_id:
            job.external_task_id = self.request.id

        dataset.status = DatasetStatus.processing

        analysis_run.status = (
            AnalysisStatus.processing
        )

        analysis_run.started_at = now()

        job.status = JobStatus.processing
        job.progress = 10
        job.started_at = now()
        job.error_message = None

        db.commit()

        set_job_status(
            job.id,
            "processing",
            10,
        )

        prefix = f"s3://{MINIO_BUCKET}/"

        if not dataset.file_uri.startswith(prefix):
            raise RuntimeError(
                "Некорректный file_uri датасета"
            )

        object_name = dataset.file_uri[
            len(prefix):
        ]

        response = minio_client.get_object(
            MINIO_BUCKET,
            object_name,
        )

        try:
            file_bytes = response.read()

        finally:
            response.close()
            response.release_conn()

        job.progress = 25
        db.commit()

        set_job_status(
            job.id,
            "processing",
            25,
        )


        text_column = (
            dataset.column_mapping or {}
        ).get(
            "text_column",
            "text",
        )

        raw_logs = extract_logs(
            data=file_bytes,
            file_format=dataset.file_format,
            text_column=text_column,
        )

        if not raw_logs:
            raise RuntimeError(
                "В датасете нет запросов для анализа"
            )

        dataset.rows_count = len(raw_logs)

        job.progress = 35

        db.commit()

        set_job_status(
            job.id,
            "processing",
            35,
        )


        from src.pipeline import (
            run_analysis_pipeline,
        )

        report = run_analysis_pipeline(
            raw_logs
        )

        job.progress = 90

        db.commit()

        set_job_status(
            job.id,
            "processing",
            90,
        )


        job.result_data = jsonable_encoder(
            report
        )

        job.status = JobStatus.completed
        job.progress = 100
        job.finished_at = now()

        analysis_run.status = (
            AnalysisStatus.completed
        )

        analysis_run.finished_at = now()

        dataset.status = DatasetStatus.completed
        dataset.processed_at = now()

        organization_id = (
            dataset.organization_id
        )

        db.commit()

        set_job_status(
            job.id,
            "completed",
            100,
        )

        invalidate_dashboard(
            organization_id
        )

        return {
            "job_id": job.id,
            "analysis_run_id":
                analysis_run.id,
            "status": "completed",
        }

    except Exception as exc:
        db.rollback()

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

        if dataset is not None:
            dataset.status = DatasetStatus.failed

        if analysis_run is not None:
            analysis_run.status = (
                AnalysisStatus.failed
            )

            analysis_run.finished_at = now()

        if job is not None:
            job.status = JobStatus.failed
            job.error_message = str(exc)
            job.finished_at = now()

        db.commit()

        set_job_status(
            job_id,
            "failed",
            job.progress if job else 0,
            str(exc),
        )

        raise

    finally:
        db.close()