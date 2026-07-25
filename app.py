from contextlib import asynccontextmanager

from fastapi import FastAPI

import models

from database import Base, engine

import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException
from pwdlib import PasswordHash

from database import SessionLocal
from models import Admin

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, File, Form, UploadFile

from storage import (
    ensure_bucket,
    MINIO_BUCKET,
    minio_client,
)
from typing import Any


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_bucket()

    yield


app = FastAPI(
    lifespan=lifespan
)

class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=128)

admin_bearer = HTTPBearer()

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(admin_bearer),
):
    jwt_secret = os.getenv("JWT_SECRET_KEY")

    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY не указан в .env")

    credentials_exception = HTTPException(
        status_code=401,
        detail="Недействительный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials,
            jwt_secret,
            algorithms=["HS256"],
        )

        admin_id = payload.get("sub")
        role = payload.get("role")

        if admin_id is None or role != "admin":
            raise credentials_exception

        admin_id = int(admin_id)

    except (jwt.InvalidTokenError, ValueError):
        raise credentials_exception

    db = SessionLocal()

    try:
        admin = (
            db.query(Admin)
            .filter(Admin.id == admin_id)
            .first()
        )

        if admin is None:
            raise credentials_exception

        return admin

    finally:
        db.close()

@app.post("/admin/login")
def admin_login(data: dict):
    login = data.get("login")
    password = data.get("password")

    if not isinstance(login, str) or not isinstance(password, str):
        raise HTTPException(
            status_code=400,
            detail="login и password обязательны",
        )

    jwt_secret = os.getenv("JWT_SECRET_KEY")

    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY не указан в .env")

    password_hash = PasswordHash.recommended()

    db = SessionLocal()

    try:
        admin = (
            db.query(Admin)
            .filter(Admin.login == login)
            .first()
        )

        if admin is None:
            raise HTTPException(
                status_code=401,
                detail="Неверный логин или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not password_hash.verify(
                password,
                admin.password_hash,
        ):
            raise HTTPException(
                status_code=401,
                detail="Неверный логин или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=30)

        access_token = jwt.encode(
            {
                "sub": str(admin.id),
                "role": "admin",
                "iat": now,
                "exp": expires_at,
                "jti": secrets.token_hex(16),
            },
            jwt_secret,
            algorithm="HS256",
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 1800,
        }

    finally:
        db.close()

@app.post("/admin/organizations", status_code=201)
def create_organization(
    data: OrganizationCreate,
    admin=Depends(get_current_admin),
):
    from fastapi import HTTPException
    from pwdlib import PasswordHash

    from database import SessionLocal
    from models import Organization

    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Название организации обязательно",
        )

    db = SessionLocal()

    try:
        existing_organization = (
            db.query(Organization)
            .filter(Organization.name == name)
            .first()
        )

        if existing_organization:
            raise HTTPException(
                status_code=409,
                detail="Организация с таким названием уже существует",
            )

        password_hash = PasswordHash.recommended()

        organization = Organization(
            name=name,
            password_hash=password_hash.hash(data.password),
        )

        db.add(organization)
        db.commit()
        db.refresh(organization)

        return {
            "id": organization.id,
            "name": organization.name,
            "created_at": organization.created_at,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

@app.delete(
    "/admin/organizations/{organization_id}",
    status_code=204,
)
def delete_organization(
    organization_id: int,
    admin=Depends(get_current_admin),
):
    from fastapi import HTTPException, Response

    from database import SessionLocal
    from models import Organization

    db = SessionLocal()

    try:
        organization = db.get(
            Organization,
            organization_id,
        )

        if organization is None:
            raise HTTPException(
                status_code=404,
                detail="Организация не найдена",
            )

        if (
            organization.departments
            or organization.users
            or organization.agents
            or organization.datasets
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Нельзя удалить организацию, "
                    "пока с ней связаны данные"
                ),
            )

        db.delete(organization)
        db.commit()

        return Response(status_code=204)

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

class OrganizationLogin(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)


organization_bearer = HTTPBearer()

def get_current_organization(
    credentials: HTTPAuthorizationCredentials = Depends(organization_bearer),
):
    from models import Organization

    jwt_secret = os.getenv("JWT_SECRET_KEY")

    if not jwt_secret:
        raise RuntimeError("JWT_SECRET_KEY не указан в .env")

    credentials_exception = HTTPException(
        status_code=401,
        detail="Недействительный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials,
            jwt_secret,
            algorithms=["HS256"],
        )

        organization_id = payload.get("sub")
        role = payload.get("role")

        if organization_id is None or role != "organization":
            raise credentials_exception

        organization_id = int(organization_id)

    except (jwt.InvalidTokenError, ValueError):
        raise credentials_exception

    db = SessionLocal()

    try:
        organization = db.get(
            Organization,
            organization_id,
        )

        if organization is None:
            raise credentials_exception

        return organization

    finally:
        db.close()


@app.post("/organization/login")
def organization_login(data: OrganizationLogin):
    from models import Organization

    db = SessionLocal()

    try:
        organization = (
            db.query(Organization)
            .filter(Organization.name == data.name.strip())
            .first()
        )

        password_hash = PasswordHash.recommended()

        if (
            organization is None
            or not password_hash.verify(
                data.password,
                organization.password_hash,
            )
        ):
            raise HTTPException(
                status_code=401,
                detail="Неверный логин или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        jwt_secret = os.getenv("JWT_SECRET_KEY")

        if not jwt_secret:
            raise RuntimeError("JWT_SECRET_KEY не указан в .env")

        now = datetime.now(timezone.utc)

        token = jwt.encode(
            {
                "sub": str(organization.id),
                "role": "organization",
                "iat": now,
                "exp": now + timedelta(hours=1),
                "jti": secrets.token_hex(16),
            },
            jwt_secret,
            algorithm="HS256",
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 3600,
        }

    finally:
        db.close()

@app.post("/datasets", status_code=201)
def upload_dataset(
    file: UploadFile = File(...),
    name: str | None = Form(None),
    text_column: str = Form("text"),
    organization=Depends(get_current_organization),
):
    from models import Dataset, DatasetStatus

    filename = Path(
        file.filename or "dataset"
    ).name

    extension = (
        Path(filename)
        .suffix
        .lower()
        .lstrip(".")
    )

    allowed_formats = {
        "csv",
        "json",
        "jsonl",
        "txt",
    }

    if extension not in allowed_formats:
        raise HTTPException(
            status_code=400,
            detail="Разрешены CSV, JSON, JSONL и TXT",
        )

    # Узнаём размер файла
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    # Уникальный путь внутри MinIO
    object_name = (
        f"organizations/"
        f"{organization.id}/"
        f"datasets/"
        f"{uuid4().hex}/"
        f"{filename}"
    )

    try:
        minio_client.put_object(
            bucket_name=MINIO_BUCKET,
            object_name=object_name,
            data=file.file,
            length=file_size,
            content_type=(
                file.content_type
                or "application/octet-stream"
            ),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Ошибка MinIO: {exc}",
        )

    db = SessionLocal()

    try:
        dataset = Dataset(
            organization_id=organization.id,
            name=(
                name.strip()
                if name and name.strip()
                else filename
            ),
            file_uri=(
                f"s3://{MINIO_BUCKET}/{object_name}"
            ),
            file_format=extension,
            file_size_bytes=file_size,
            status=DatasetStatus.uploaded,
            column_mapping={
                "text_column": text_column,
            },
        )

        db.add(dataset)
        db.commit()
        db.refresh(dataset)

        return {
            "id": dataset.id,
            "name": dataset.name,
            "file_format": dataset.file_format,
            "file_size_bytes": dataset.file_size_bytes,
            "status": dataset.status.value,
        }

    except Exception:
        db.rollback()

        try:
            minio_client.remove_object(
                MINIO_BUCKET,
                object_name,
            )
        except Exception:
            pass

        raise

    finally:
        db.close()


def process_dataset_analysis(
    dataset_id: int,
    analysis_run_id: int,
    job_id: int,
):
    from datetime import datetime, timezone

    from dataset_reader import extract_logs

    from models import (
        AnalysisJob,
        AnalysisRun,
        AnalysisStatus,
        Dataset,
        DatasetStatus,
        JobStatus,
    )

    def now():
        return datetime.now(
            timezone.utc
        ).replace(tzinfo=None)

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
            return

        # Начинаем обработку

        dataset.status = DatasetStatus.processing

        analysis_run.status = AnalysisStatus.processing
        analysis_run.started_at = now()

        job.status = JobStatus.processing
        job.progress = 10
        job.started_at = now()

        db.commit()


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


        from src.pipeline import run_analysis_pipeline

        report = run_analysis_pipeline(
            raw_logs
        )

        job.progress = 90
        db.commit()

        job.result_data = report

        job.status = JobStatus.completed
        job.progress = 100
        job.finished_at = now()

        analysis_run.status = AnalysisStatus.completed
        analysis_run.finished_at = now()

        dataset.status = DatasetStatus.completed
        dataset.processed_at = now()

        db.commit()

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
            analysis_run.status = AnalysisStatus.failed
            analysis_run.finished_at = now()

        if job is not None:
            job.status = JobStatus.failed
            job.error_message = str(exc)
            job.finished_at = now()

        db.commit()

    finally:
        db.close()

@app.post(
    "/datasets/{dataset_id}/analyze",
    status_code=202,
)
def analyze_dataset(
    dataset_id: int,
    background_tasks: BackgroundTasks,
    organization=Depends(get_current_organization),
):
    from models import (
        AnalysisJob,
        AnalysisRun,
        AnalysisStatus,
        Dataset,
        JobStatus,
        JobType,
    )

    db = SessionLocal()

    try:
        dataset = db.get(
            Dataset,
            dataset_id,
        )

        if (
            dataset is None
            or dataset.organization_id != organization.id
        ):
            raise HTTPException(
                status_code=404,
                detail="Датасет не найден",
            )

        # Проверяем, не идёт ли анализ уже сейчас
        active_run = (
            db.query(AnalysisRun)
            .filter(
                AnalysisRun.dataset_id == dataset.id,
                AnalysisRun.status.in_([
                    AnalysisStatus.pending,
                    AnalysisStatus.processing,
                ]),
            )
            .first()
        )

        if active_run is not None:
            raise HTTPException(
                status_code=409,
                detail="Этот датасет уже анализируется",
            )

        analysis_run = AnalysisRun(
            dataset_id=dataset.id,
            status=AnalysisStatus.pending,
            embedding_model="cointegrated/rubert-tiny2",
            clustering_algorithm="AgglomerativeClustering",
            config={
                "distance_threshold": 0.5,
            },
        )

        db.add(analysis_run)

        # Нужен ID до commit
        db.flush()

        job = AnalysisJob(
            analysis_run_id=analysis_run.id,
            job_type=JobType.full_analysis,
            status=JobStatus.pending,
            progress=0,
        )

        db.add(job)
        db.commit()

        db.refresh(analysis_run)
        db.refresh(job)

        background_tasks.add_task(
            process_dataset_analysis,
            dataset.id,
            analysis_run.id,
            job.id,
        )

        return {
            "analysis_run_id": analysis_run.id,
            "job_id": job.id,
            "dataset_id": dataset.id,
            "status": "pending",
            "progress": 0,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

@app.get("/analysis-runs/{analysis_run_id}")
def get_analysis_status(
    analysis_run_id: int,
    organization=Depends(get_current_organization),
):
    from models import (
        AnalysisJob,
        AnalysisRun,
        Dataset,
        JobType,
    )

    db = SessionLocal()

    try:
        analysis_run = db.get(
            AnalysisRun,
            analysis_run_id,
        )

        if analysis_run is None:
            raise HTTPException(
                status_code=404,
                detail="Анализ не найден",
            )

        dataset = db.get(
            Dataset,
            analysis_run.dataset_id,
        )

        # Не даём компании смотреть
        # чужой анализ
        if (
            dataset is None
            or dataset.organization_id != organization.id
        ):
            raise HTTPException(
                status_code=404,
                detail="Анализ не найден",
            )

        job = (
            db.query(AnalysisJob)
            .filter(
                AnalysisJob.analysis_run_id
                == analysis_run.id,

                AnalysisJob.job_type
                == JobType.full_analysis,
            )
            .first()
        )

        return {
            "analysis_run_id": analysis_run.id,
            "dataset_id": dataset.id,
            "status": analysis_run.status.value,

            "job": {
                "id": job.id if job else None,

                "status": (
                    job.status.value
                    if job
                    else None
                ),

                "progress": (
                    job.progress
                    if job
                    else None
                ),

                "error": (
                    job.error_message
                    if job
                    else None
                ),
            },

            "started_at": analysis_run.started_at,
            "finished_at": analysis_run.finished_at,
        }

    finally:
        db.close()


@app.get("/datasets/{dataset_id}/report")
def get_dataset_report(
    dataset_id: int,
    organization=Depends(get_current_organization),
):
    from models import (
        AnalysisJob,
        AnalysisRun,
        AnalysisStatus,
        Dataset,
        JobStatus,
        JobType,
    )

    db = SessionLocal()

    try:
        dataset = db.get(
            Dataset,
            dataset_id,
        )

        if (
            dataset is None
            or dataset.organization_id != organization.id
        ):
            raise HTTPException(
                status_code=404,
                detail="Датасет не найден",
            )

        # Последний успешно завершённый анализ
        analysis_run = (
            db.query(AnalysisRun)
            .filter(
                AnalysisRun.dataset_id
                == dataset.id,

                AnalysisRun.status
                == AnalysisStatus.completed,
            )
            .order_by(
                AnalysisRun.id.desc()
            )
            .first()
        )

        if analysis_run is None:
            raise HTTPException(
                status_code=404,
                detail="Готового анализа ещё нет",
            )

        job = (
            db.query(AnalysisJob)
            .filter(
                AnalysisJob.analysis_run_id
                == analysis_run.id,

                AnalysisJob.job_type
                == JobType.full_analysis,

                AnalysisJob.status
                == JobStatus.completed,
            )
            .first()
        )

        if (
            job is None
            or job.result_data is None
        ):
            raise HTTPException(
                status_code=404,
                detail="Отчёт ещё не готов",
            )

        return {
            "dataset": {
                "id": dataset.id,
                "name": dataset.name,
                "rows_count": dataset.rows_count,
            },

            "analysis": {
                "id": analysis_run.id,
                "started_at": analysis_run.started_at,
                "finished_at": analysis_run.finished_at,
            },

            "report": job.result_data,
        }

    finally:
        db.close()

@app.get("/datasets")
def get_datasets(
    organization=Depends(get_current_organization),
):
    from models import Dataset

    db = SessionLocal()

    try:
        datasets = (
            db.query(Dataset)
            .filter(
                Dataset.organization_id
                == organization.id
            )
            .order_by(
                Dataset.created_at.desc()
            )
            .all()
        )

        return [
            {
                "id": dataset.id,
                "name": dataset.name,
                "status": dataset.status.value,
                "file_format": dataset.file_format,
                "file_size_bytes": dataset.file_size_bytes,
                "rows_count": dataset.rows_count,
                "created_at": dataset.created_at,
                "processed_at": dataset.processed_at,
            }
            for dataset in datasets
        ]

    finally:
        db.close()

def build_dashboard(
    reports: list[list[dict]],
) -> dict[str, Any]:
    from collections import Counter

    category_counts = Counter()
    use_case_counts = Counter()
    pain_points = Counter()

    broken_queries_count = 0
    automation_candidates = []

    for report in reports:

        for category in report:

            category_name = category.get(
                "category_name",
                "Другое",
            )

            requests_count = category.get(
                "total_requests",
                0,
            )

            category_counts[
                category_name
            ] += requests_count

            for use_case in category.get(
                "use_cases",
                [],
            ):
                use_case_name = use_case.get(
                    "use_case_name",
                    "Без названия",
                )

                queries_count = use_case.get(
                    "queries_count",
                    0,
                )

                use_case_counts[
                    use_case_name
                ] += queries_count

                broken_queries_count += len(
                    use_case.get(
                        "broken_queries",
                        [],
                    )
                )

                for pain in use_case.get(
                    "pain_points",
                    [],
                ):
                    pain_points[pain] += 1

                automation = use_case.get(
                    "automation_potential",
                    "",
                )

                if automation.lower().startswith(
                    "высок"
                ):
                    automation_candidates.append({
                        "name": use_case_name,
                        "requests": queries_count,
                        "automation_potential":
                            automation,
                        "suggested_actions":
                            use_case.get(
                                "suggested_actions",
                                [],
                            ),
                    })

    total_requests = sum(
        category_counts.values()
    )

    categories = []

    for name, count in category_counts.most_common():

        percentage = 0

        if total_requests:
            percentage = round(
                count / total_requests * 100,
                2,
            )

        categories.append({
            "name": name,
            "requests": count,
            "percentage": percentage,
        })

    automation_candidates.sort(
        key=lambda item: item["requests"],
        reverse=True,
    )

    return {
        "total_requests": total_requests,

        "categories": categories,

        "top_use_cases": [
            {
                "name": name,
                "requests": count,
            }
            for name, count
            in use_case_counts.most_common(10)
        ],

        "top_pain_points": [
            {
                "text": text,
                "mentions": count,
            }
            for text, count
            in pain_points.most_common(10)
        ],

        "broken_queries_count":
            broken_queries_count,

        "automation_candidates":
            automation_candidates[:10],
    }

@app.get("/dashboard")
def get_dashboard(
    organization=Depends(get_current_organization),
):
    from models import (
        AnalysisJob,
        AnalysisRun,
        AnalysisStatus,
        Dataset,
        JobStatus,
        JobType,
    )

    db = SessionLocal()

    try:
        rows = (
            db.query(
                Dataset,
                AnalysisRun,
                AnalysisJob,
            )
            .join(
                AnalysisRun,
                AnalysisRun.dataset_id
                == Dataset.id,
            )
            .join(
                AnalysisJob,
                AnalysisJob.analysis_run_id
                == AnalysisRun.id,
            )
            .filter(
                Dataset.organization_id
                == organization.id,

                AnalysisRun.status
                == AnalysisStatus.completed,

                AnalysisJob.status
                == JobStatus.completed,

                AnalysisJob.job_type
                == JobType.full_analysis,
            )
            .order_by(
                AnalysisRun.id.desc()
            )
            .all()
        )

        seen_datasets = set()
        reports = []

        for dataset, analysis_run, job in rows:

            if dataset.id in seen_datasets:
                continue

            if job.result_data is None:
                continue

            seen_datasets.add(
                dataset.id
            )

            reports.append(
                job.result_data
            )

        dashboard: dict[str, Any] = build_dashboard(
            reports
        )

        dashboard["organization"] = {
            "id": organization.id,
            "name": organization.name,
        }

        dashboard["analyzed_datasets"] = len(
            seen_datasets
        )

        return dashboard

    finally:
        db.close()

@app.get("/")
def root():
    return "Okay"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )