https://disk.yandex.ru/i/elH7Qbp8AhxMSQ
# 🚀 AI Analytics Platform — Анализ и Кластеризация Обращений

Автоматизированная аналитическая платформа для обработки, кластеризации и суммаризации пользовательских логов, промптов и обращений в техподдержку. Платформа использует машинное обучение для эмбеддингов, векторного поиска и векторизации, а также локальные нейросети (Ollama LLM / RuBERT) для выделения проблематики и формирования рекомендаций по автоматизации.

---

## 🛠 Стек технологий

- **Backend Framework:** Python 3.11+ / FastAPI / Uvicorn
- **База данных:** PostgreSQL 17 + расширение `pgvector` / SQLAlchemy 2.0 ORM
- **Фоновые задачи & Кэширование:** Celery / Redis
- **Хранилище датасетов:** MinIO (S3-compatible Object Storage)
- **ИИ / ML инструменты:**
  - **Ollama LLM:** Модели `gemma2:2b` или аналоги для суммаризации и извлечения сущностей
  - **Embeddings:** `cointegrated/rubert-tiny2` (Transformers / Torch)
  - **Кластеризация:** `scikit-learn` (`AgglomerativeClustering`)
- **Frontend:** React (Vite / TypeScript / Redux Toolkit / TailwindCSS)

---

## 📋 Предварительные требования

Перед запуском проекта убедитесь, что на вашей машине установлены:
1. [Docker](https://www.docker.com/) и Docker Compose.
2. [Python 3.11+](https://www.python.org/) и менеджер пакетов `uv` (или `pip`).
3. [Node.js 18+](https://nodejs.org/) и `npm` (для запуска интерфейса).
4. [Ollama](https://ollama.com/) (для запуска локальной нейросети).

---

## 🚀 Пошаговое руководство по запуску

### 1. Клонирование репозитория и настройка `.env`

Создайте файл `.env` в корневой директории проекта (можно скопировать из `.env.example`):

```bash
cp .env.example .env
```

Пример содержимого `.env`:
```env
DATABASE_URL=postgresql+psycopg://app:app_password@localhost:5433/ai_analytics
JWT_SECRET_KEY=supersecretkey123
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET=datasets
MINIO_SECURE=false
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1
REDIS_CACHE_URL=redis://localhost:6379/2
```

---

### 2. Запуск контейнеров Docker (PostgreSQL, MinIO, Redis)

Поднимите необходимые сервисы в Docker background-режиме:

```bash
docker compose up -d
```

Данная команда запустит:
- **PostgreSQL pgvector** на порту `5433`
- **MinIO S3** на портах `9000` (API) и `9001` (Консоль)
- **Redis** на порту `6379`

---

### 3. Запуск и настройка Ollama (LLM)

1. Установите и запустите приложение **Ollama**.
2. Скачайте модель `gemma2:2b` (или необходимую модель согласно конфигурации):

```bash
ollama pull gemma4:e2b
```

3. Убедитесь, что сервис Ollama запущен и доступен по адресу `http://localhost:11434`.

---

### 4. Установка зависимостей Python

Используя **`uv`** (рекомендуется):
```bash
uv sync
```

Или с использованием классического **`pip`**:
```bash
python -m venv .venv
# На Windows:
.venv\Scripts\activate
# На Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

---

### 5. Инициализация базы данных и создание учётной записи Администратора

Запустите скрипт создания первоначальных таблиц и первого суперпользователя:

```bash
uv run python create_admin.py --login admin --password admin123
```

---

### 6. Запуск воркера фоновых задач Celery

---

### 7. Запуск Backend API (FastAPI)

В основном терминале запустите веб-сервер FastAPI:

```bash
uv run uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

- **Swagger UI документация:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

### 8. Запуск Frontend приложения (React / Vite)

Перейдите в директорию `frontend` (при наличии) и запустите сервер разработки:

```bash
cd frontend
npm install
npm run dev
```

Интерфейс будет доступен по адресу: `http://localhost:5173`

---

## 🔐 Доступы по умолчанию

- **Администратор системы:**
  - Логин: `admin`
  - Пароль: `admin123`
- **Тестовая организация:**
  - Название: `ООО "Цифронит"`
  - Пароль: `12345678`
- **MinIO Web Console:**
  - URL: `http://localhost:9001`
  - Логин: `admin`
  - Пароль: `admin123`

---

## 📡 Основные API Эндпоинты

- `POST /admin/login` — Авторизация администратора
- `POST /organization/login` — Авторизация организации
- `POST /datasets` — Загрузка файла логов (CSV, JSON, JSONL, TXT) в MinIO S3
- `POST /datasets/{id}/analyze` — Запуск асинхронного пайплайна кластеризации
- `GET /analysis-runs/{id}` — Статус выполнения анализа датасета
- `GET /datasets/{id}/report` — Получение итогового структурированного отчета
- `GET /dashboard` — Агрегированный дашборд аналитики компании

---

## ❓ Частые вопросы и решение проблем (Troubleshooting)

1. **Ошибка `ModuleNotFoundError: No module named 'psycopg2'`**
   - Убедитесь, что в `DATABASE_URL` указан драйвер `postgresql+psycopg://` вместо `postgresql://`.

2. **Ошибка `Conflict: container name is already in use`**
   - Очистите старые контейнеры командой `docker rm -f ai-analytics-postgres ai-analytics-minio ai-analytics-redis` и перезапустите `docker compose up -d`.

3. **Celery задачи падают с ошибкой подключения к Ollama**
   - Проверьте, запущен ли Ollama локально (`ollama list`) и выполнена ли команда `ollama pull gemma2:2b`.
