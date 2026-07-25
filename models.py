from __future__ import annotations

import enum
from datetime import date, datetime
from typing import Any

from pgvector.sqlalchemy import VECTOR
from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


# ============================================================
# ENUMS
# ============================================================


class DatasetStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class AnalysisStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class JobStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class JobType(str, enum.Enum):
    validation = "validation"
    normalization = "normalization"
    chunking = "chunking"
    intent_extraction = "intent_extraction"
    embeddings = "embeddings"
    classification = "classification"
    clustering = "clustering"
    use_case_naming = "use_case_naming"
    summarization = "summarization"
    analytics = "analytics"
    full_analysis = "full_analysis"


dataset_status_enum = SQLEnum(
    DatasetStatus,
    name="dataset_status",
)

analysis_status_enum = SQLEnum(
    AnalysisStatus,
    name="analysis_status",
)

job_status_enum = SQLEnum(
    JobStatus,
    name="job_status",
)

job_type_enum = SQLEnum(
    JobType,
    name="job_type",
)


# ============================================================
# ORGANIZATIONS
# ============================================================


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    departments: Mapped[list["Department"]] = relationship(
        back_populates="organization"
    )

    users: Mapped[list["User"]] = relationship(
        back_populates="organization"
    )

    agents: Mapped[list["Agent"]] = relationship(
        back_populates="organization"
    )

    datasets: Mapped[list["Dataset"]] = relationship(
        back_populates="organization"
    )


# ============================================================
# DEPARTMENTS
# ============================================================


class Department(Base):
    __tablename__ = "departments"

    __table_args__ = (
        Index(
            "ix_departments_organization_id",
            "organization_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    organization_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("organizations.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="departments"
    )

    users: Mapped[list["User"]] = relationship(
        back_populates="department"
    )


# ============================================================
# USERS
# ============================================================


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        Index("ix_users_organization_id", "organization_id"),
        Index("ix_users_department_id", "department_id"),
        Index("ix_users_external_id", "external_id"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    organization_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("organizations.id"),
        nullable=False,
    )

    department_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("departments.id"),
    )

    external_id: Mapped[str | None] = mapped_column(
        String(255)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="users"
    )

    department: Mapped["Department | None"] = relationship(
        back_populates="users"
    )

    requests: Mapped[list["Request"]] = relationship(
        back_populates="user"
    )


# ============================================================
# AGENTS
# ============================================================


class Agent(Base):
    __tablename__ = "agents"

    __table_args__ = (
        Index(
            "ix_agents_organization_id",
            "organization_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    organization_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("organizations.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    agent_type: Mapped[str | None] = mapped_column(
        String(100)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="agents"
    )

    requests: Mapped[list["Request"]] = relationship(
        back_populates="agent"
    )


# ============================================================
# DATASETS
# ============================================================


class Dataset(Base):
    __tablename__ = "datasets"

    __table_args__ = (
        Index("ix_datasets_organization_id", "organization_id"),
        Index("ix_datasets_status", "status"),
        Index("ix_datasets_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    organization_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("organizations.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_uri: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    file_format: Mapped[str | None] = mapped_column(
        String(30)
    )

    file_size_bytes: Mapped[int | None] = mapped_column(
        BigInteger
    )

    rows_count: Mapped[int | None] = mapped_column(
        BigInteger
    )

    status: Mapped[DatasetStatus] = mapped_column(
        dataset_status_enum,
        nullable=False,
        default=DatasetStatus.uploaded,
        server_default=text("'uploaded'"),
    )

    source_schema: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB
    )

    column_mapping: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="datasets"
    )

    requests: Mapped[list["Request"]] = relationship(
        back_populates="dataset"
    )

    analysis_runs: Mapped[list["AnalysisRun"]] = relationship(
        back_populates="dataset"
    )


# ============================================================
# REQUESTS
# ============================================================


class Request(Base):
    __tablename__ = "requests"

    __table_args__ = (
        Index("ix_requests_dataset_id", "dataset_id"),
        Index("ix_requests_user_id", "user_id"),
        Index("ix_requests_agent_id", "agent_id"),
        Index("ix_requests_requested_at", "requested_at"),
        Index("ix_requests_external_id", "external_id"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    dataset_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("datasets.id"),
        nullable=False,
    )

    user_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.id"),
    )

    agent_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("agents.id"),
    )

    external_id: Mapped[str | None] = mapped_column(
        String(255)
    )

    raw_text: Mapped[str | None] = mapped_column(
        Text
    )

    raw_text_uri: Mapped[str | None] = mapped_column(
        Text
    )

    requested_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    source_metadata: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    dataset: Mapped["Dataset"] = relationship(
        back_populates="requests"
    )

    user: Mapped["User | None"] = relationship(
        back_populates="requests"
    )

    agent: Mapped["Agent | None"] = relationship(
        back_populates="requests"
    )

    results: Mapped[list["RequestResult"]] = relationship(
        back_populates="request"
    )

    analyses: Mapped[list["RequestAnalysis"]] = relationship(
        back_populates="request"
    )


# ============================================================
# REQUEST RESULTS
# ============================================================


class RequestResult(Base):
    __tablename__ = "request_results"

    __table_args__ = (
        Index("ix_request_results_request_id", "request_id"),
        Index("ix_request_results_success", "success"),
        Index("ix_request_results_error_type", "error_type"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    request_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("requests.id"),
        nullable=False,
    )

    success: Mapped[bool | None] = mapped_column(
        Boolean
    )

    error_type: Mapped[str | None] = mapped_column(
        String(255)
    )

    error_message: Mapped[str | None] = mapped_column(
        Text
    )

    latency_ms: Mapped[int | None] = mapped_column(
        Integer
    )

    response_uri: Mapped[str | None] = mapped_column(
        Text
    )

    user_feedback: Mapped[float | None] = mapped_column(
        Float
    )

    # metadata — зарезервированное имя SQLAlchemy,
    # поэтому Python-атрибут называем result_metadata,
    # но в PostgreSQL колонка будет называться metadata.
    result_metadata: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata",
        JSONB,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    request: Mapped["Request"] = relationship(
        back_populates="results"
    )


# ============================================================
# ANALYSIS RUNS
# ============================================================


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    __table_args__ = (
        Index("ix_analysis_runs_dataset_id", "dataset_id"),
        Index("ix_analysis_runs_status", "status"),
        Index("ix_analysis_runs_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    dataset_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("datasets.id"),
        nullable=False,
    )

    status: Mapped[AnalysisStatus] = mapped_column(
        analysis_status_enum,
        nullable=False,
        default=AnalysisStatus.pending,
        server_default=text("'pending'"),
    )

    embedding_model: Mapped[str | None] = mapped_column(
        String(255)
    )

    classification_model: Mapped[str | None] = mapped_column(
        String(255)
    )

    clustering_algorithm: Mapped[str | None] = mapped_column(
        String(100)
    )

    llm_model: Mapped[str | None] = mapped_column(
        String(255)
    )

    config: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    dataset: Mapped["Dataset"] = relationship(
        back_populates="analysis_runs"
    )

    jobs: Mapped[list["AnalysisJob"]] = relationship(
        back_populates="analysis_run"
    )

    request_analyses: Mapped[list["RequestAnalysis"]] = relationship(
        back_populates="analysis_run"
    )

    use_cases: Mapped[list["UseCase"]] = relationship(
        back_populates="analysis_run"
    )


# ============================================================
# ANALYSIS JOBS
# ============================================================


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    __table_args__ = (
        Index("ix_analysis_jobs_analysis_run_id", "analysis_run_id"),
        Index("ix_analysis_jobs_status", "status"),
        Index("ix_analysis_jobs_job_type", "job_type"),
        Index("ix_analysis_jobs_external_task_id", "external_task_id"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    analysis_run_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("analysis_runs.id"),
        nullable=False,
    )

    job_type: Mapped[JobType] = mapped_column(
        job_type_enum,
        nullable=False,
    )

    status: Mapped[JobStatus] = mapped_column(
        job_status_enum,
        nullable=False,
        default=JobStatus.pending,
        server_default=text("'pending'"),
    )

    progress: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    external_task_id: Mapped[str | None] = mapped_column(
        String(255)
    )

    error_message: Mapped[str | None] = mapped_column(
        Text
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    analysis_run: Mapped["AnalysisRun"] = relationship(
        back_populates="jobs"
    )


# ============================================================
# REQUEST ANALYSES
# ============================================================


class RequestAnalysis(Base):
    __tablename__ = "request_analyses"

    __table_args__ = (
        UniqueConstraint(
            "analysis_run_id",
            "request_id",
            name="uq_request_analyses_analysis_run_request",
        ),
        Index(
            "ix_request_analyses_analysis_run_id",
            "analysis_run_id",
        ),
        Index(
            "ix_request_analyses_request_id",
            "request_id",
        ),
        Index(
            "ix_request_analyses_status",
            "status",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    analysis_run_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("analysis_runs.id"),
        nullable=False,
    )

    request_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("requests.id"),
        nullable=False,
    )

    normalized_text: Mapped[str | None] = mapped_column(
        Text
    )

    intent_summary: Mapped[str | None] = mapped_column(
        Text
    )

    intent_data: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB
    )

    language: Mapped[str | None] = mapped_column(
        String(20)
    )

    token_count: Mapped[int | None] = mapped_column(
        Integer
    )

    status: Mapped[AnalysisStatus] = mapped_column(
        analysis_status_enum,
        nullable=False,
        default=AnalysisStatus.pending,
        server_default=text("'pending'"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    analysis_run: Mapped["AnalysisRun"] = relationship(
        back_populates="request_analyses"
    )

    request: Mapped["Request"] = relationship(
        back_populates="analyses"
    )

    chunks: Mapped[list["RequestChunk"]] = relationship(
        back_populates="request_analysis"
    )

    embeddings: Mapped[list["RequestEmbedding"]] = relationship(
        back_populates="request_analysis"
    )

    category_assignments: Mapped[list["CategoryAssignment"]] = relationship(
        back_populates="request_analysis"
    )

    use_case_memberships: Mapped[list["UseCaseMembership"]] = relationship(
        back_populates="request_analysis"
    )


# ============================================================
# REQUEST CHUNKS
# ============================================================


class RequestChunk(Base):
    __tablename__ = "request_chunks"

    __table_args__ = (
        UniqueConstraint(
            "request_analysis_id",
            "chunk_index",
            name="uq_request_chunks_analysis_chunk",
        ),
        Index(
            "ix_request_chunks_request_analysis_id",
            "request_analysis_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    request_analysis_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("request_analyses.id"),
        nullable=False,
    )

    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    chunk_text: Mapped[str | None] = mapped_column(
        Text
    )

    chunk_uri: Mapped[str | None] = mapped_column(
        Text
    )

    token_count: Mapped[int | None] = mapped_column(
        Integer
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    request_analysis: Mapped["RequestAnalysis"] = relationship(
        back_populates="chunks"
    )


# ============================================================
# REQUEST EMBEDDINGS
# ============================================================


class RequestEmbedding(Base):
    __tablename__ = "request_embeddings"

    __table_args__ = (
        Index(
            "ix_request_embeddings_request_analysis_id",
            "request_analysis_id",
        ),
        Index(
            "ix_request_embeddings_model",
            "model",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    request_analysis_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("request_analyses.id"),
        nullable=False,
    )

    model: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    dimensions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1024,
        server_default=text("1024"),
    )

    embedding: Mapped[list[float] | None] = mapped_column(
        VECTOR(1024)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    request_analysis: Mapped["RequestAnalysis"] = relationship(
        back_populates="embeddings"
    )


# ============================================================
# CATEGORIES
# ============================================================


class Category(Base):
    __tablename__ = "categories"

    __table_args__ = (
        Index("ix_categories_parent_id", "parent_id"),
        Index("ix_categories_name", "name"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    parent_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("categories.id"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    parent: Mapped["Category | None"] = relationship(
        "Category",
        remote_side="Category.id",
        back_populates="children",
    )

    children: Mapped[list["Category"]] = relationship(
        "Category",
        back_populates="parent",
    )

    assignments: Mapped[list["CategoryAssignment"]] = relationship(
        back_populates="category"
    )


# ============================================================
# CATEGORY ASSIGNMENTS
# ============================================================


class CategoryAssignment(Base):
    __tablename__ = "category_assignments"

    __table_args__ = (
        UniqueConstraint(
            "request_analysis_id",
            "category_id",
            name="uq_category_assignments_analysis_category",
        ),
        Index(
            "ix_category_assignments_category_id",
            "category_id",
        ),
        Index(
            "ix_category_assignments_request_analysis_id",
            "request_analysis_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    request_analysis_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("request_analyses.id"),
        nullable=False,
    )

    category_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("categories.id"),
        nullable=False,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float
    )

    classification_method: Mapped[str | None] = mapped_column(
        String(100)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    request_analysis: Mapped["RequestAnalysis"] = relationship(
        back_populates="category_assignments"
    )

    category: Mapped["Category"] = relationship(
        back_populates="assignments"
    )


# ============================================================
# USE CASES
# ============================================================


class UseCase(Base):
    __tablename__ = "use_cases"

    __table_args__ = (
        Index(
            "ix_use_cases_analysis_run_id",
            "analysis_run_id",
        ),
        Index(
            "ix_use_cases_cluster_label",
            "cluster_label",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    analysis_run_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("analysis_runs.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    summary: Mapped[str | None] = mapped_column(
        Text
    )

    cluster_label: Mapped[int | None] = mapped_column(
        Integer
    )

    request_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    centroid: Mapped[list[float] | None] = mapped_column(
        VECTOR(1024)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    analysis_run: Mapped["AnalysisRun"] = relationship(
        back_populates="use_cases"
    )

    memberships: Mapped[list["UseCaseMembership"]] = relationship(
        back_populates="use_case"
    )

    metrics: Mapped[list["UseCaseMetric"]] = relationship(
        back_populates="use_case"
    )


# ============================================================
# USE CASE MEMBERSHIPS
# ============================================================


class UseCaseMembership(Base):
    __tablename__ = "use_case_memberships"

    __table_args__ = (
        UniqueConstraint(
            "request_analysis_id",
            "use_case_id",
            name="uq_use_case_memberships_analysis_use_case",
        ),
        Index(
            "ix_use_case_memberships_use_case_id",
            "use_case_id",
        ),
        Index(
            "ix_use_case_memberships_request_analysis_id",
            "request_analysis_id",
        ),
        Index(
            "ix_use_case_memberships_is_outlier",
            "is_outlier",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    request_analysis_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("request_analyses.id"),
        nullable=False,
    )

    use_case_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("use_cases.id"),
        nullable=False,
    )

    membership_score: Mapped[float | None] = mapped_column(
        Float
    )

    is_outlier: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    request_analysis: Mapped["RequestAnalysis"] = relationship(
        back_populates="use_case_memberships"
    )

    use_case: Mapped["UseCase"] = relationship(
        back_populates="memberships"
    )


# ============================================================
# USE CASE METRICS
# ============================================================


class UseCaseMetric(Base):
    __tablename__ = "use_case_metrics"

    __table_args__ = (
        UniqueConstraint(
            "use_case_id",
            "metric_date",
            name="uq_use_case_metrics_use_case_date",
        ),
        Index(
            "ix_use_case_metrics_metric_date",
            "metric_date",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    use_case_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("use_cases.id"),
        nullable=False,
    )

    metric_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    request_count: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    percentage: Mapped[float | None] = mapped_column(
        Float
    )

    growth_rate: Mapped[float | None] = mapped_column(
        Float
    )

    failure_rate: Mapped[float | None] = mapped_column(
        Float
    )

    automation_score: Mapped[float | None] = mapped_column(
        Float
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("now()"),
    )

    use_case: Mapped["UseCase"] = relationship(
        back_populates="metrics"
    )