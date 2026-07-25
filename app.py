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


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

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