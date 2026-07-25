from contextlib import asynccontextmanager

from fastapi import FastAPI

import models

from database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    yield


app = FastAPI(
    lifespan=lifespan
)

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