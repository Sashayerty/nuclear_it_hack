'''
Классификация входящих запросов
'''
from pydantic import BaseModel, Field
from back.ai import AI

class ClassificationResult(BaseModel):
    categories: list[str] = Field(
        description="Список категорий, к которым относится запрос. Например: ['Генерация текста и коммуникация', 'Аналитика и обработка данных']"
    )

def classify_request(ai_client: AI, user_query: str) -> ClassificationResult:
    """
    Классифицирует пользовательский запрос по заданным макро-категориям.
    """
    system_prompt = """
    Ты — строгий ИИ-аналитик. Твоя задача: классифицировать лог-запрос пользователя к внутреннему ИИ-агенту компании.
    Проанализируй текст и выбери одну или несколько наиболее подходящих категорий из списка ниже.
    Никогда не придумывай свои категории, используй только этот список:

    - Поиск и сбор информации
    - Аналитика и обработка данных
    - Генерация текста и коммуникация
    - Управление задачами и проектами
    - Планирование и расписание
    - Автоматизация и триггеры
    - Помощь с кодом и IT-навыки
    - Объяснение и обучение
    - Нерабочие / общие вопросы
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_query}
    ]

    return ai_client.ask_parsed(
        messages=messages,
        response_model=ClassificationResult,
        temperature=0.0
    )
