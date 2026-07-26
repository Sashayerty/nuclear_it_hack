from database import SessionLocal
from models import AnalysisJob, Dataset

db = SessionLocal()
jobs = db.query(AnalysisJob).all()
print(f"Total jobs: {len(jobs)}")
for job in jobs:
    if job.result_data:
        total = sum(cat.get("total_requests", 0) for cat in job.result_data)
        print(f"Job {job.id}: dataset={job.analysis_run.dataset_id}, result_data categories: {len(job.result_data)}, total_requests: {total}")

db.close()
