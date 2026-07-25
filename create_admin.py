import argparse
import os
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql+psycopg://app:app_password@localhost:5433/ai_analytics"

from database import Base, SessionLocal, engine
from models import Admin
from pwdlib import PasswordHash


def create_admin(login: str | None = None, password: str | None = None):
    Base.metadata.create_all(bind=engine)

    login = login or os.getenv("DEFAULT_ADMIN_LOGIN", "admin")
    password = password or os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")

    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.login == login).first()
        if existing:
            print(f"Администратор '{login}' уже существует.")
            return

        password_hash_helper = PasswordHash.recommended()
        hashed = password_hash_helper.hash(password)

        admin = Admin(login=login, password_hash=hashed)
        db.add(admin)
        db.commit()
        print(f"Успех! Администратор '{login}' успешно зарегистрирован (пароль: '{password}').")
    except Exception as e:
        db.rollback()
        print(f"Ошибка при создании администратора: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Регистрация пользователя admin через консоль")
    parser.add_argument("--login", "-u", type=str, help="Логин администратора (по умолчанию: admin)")
    parser.add_argument("--password", "-p", type=str, help="Пароль администратора (по умолчанию: admin123)")
    args = parser.parse_args()

    create_admin(login=args.login, password=args.password)
