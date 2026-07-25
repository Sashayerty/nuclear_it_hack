'''
Создание имен для запросов
'''
from pydantic import BaseModel, Field
from back.ai import AI

class NamingResult(BaseModel):
    use_case_name: str = Field(
        description="Короткое и емкое название для сценария использования, не более 5-7 слов. Например: 'Написание деловых писем' или 'Поиск контактов в CRM'."
    )

def name_cluster(ai_client: AI, cluster_queries: list[str]) -> NamingResult:
    """
    Анализирует список похожих запросов и придумывает им общее название (use-case).
    """
    queries_text = "\n".join([f"- {q}" for q in cluster_queries])

    system_prompt = """
    Ты — продуктовый аналитик. Твоя задача — проанализировать группу похожих запросов от сотрудников к ИИ-агенту.
    Выдели их главную общую суть и придумай короткое, емкое название для этого сценария использования (use-case).
    Название должно отражать реальное бизнес-действие.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Сгруппированные запросы:\n{queries_text}"}
    ]

    return ai_client.ask_parsed(
        messages=messages,
        response_model=NamingResult,
        temperature=0.3
    )
