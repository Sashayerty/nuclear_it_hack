'''
Рекомендация, что можно сделать для улучшения сервиса
'''
from pydantic import BaseModel, Field
from src.ai import AI

class RecommendationResult(BaseModel):
    automation_potential: str = Field(
        description="Оценка потенциала автоматизации сценария (Высокий / Средний / Низкий) с кратким обоснованием."
    )
    suggested_actions: list[str] = Field(
        description="Список из 1-3 конкретных шагов для СТО или владельцев продукта (например: 'создать отдельного агента', 'сделать интеграцию с Jira', 'добавить шаблон промпта')."
    )

def generate_recommendations(ai_client: AI, use_case_name: str, summary_description: str) -> RecommendationResult:
    """
    Предлагает продуктовые решения и оценивает потенциал автоматизации сценария.
    """
    system_prompt = """
    Ты — Chief Technology Officer (CTO) и эксперт по автоматизации бизнес-процессов.
    Твоя задача: на основе описания сценария использования ИИ-агента оценить его потенциал для системной автоматизации.
    Предложи конкретные управленческие или технические шаги для улучшения пользовательского опыта.
    Ты анализируешь СЫРЫЕ ЛОГИ (ТЕКСТОВЫЕ ЗАПРОСЫ СОТРУДНИКОВ К ИИ-АГЕНТУ).
    ЭТО НЕ СЕРВЕРНЫЕ ЛОГИ. Это то, что сотрудники пишут корпоративному ассистенту в чате (например: "сделай саммари писем", "собери инфо по клиенту из CRM", "найди свободное время в календаре").

    Запрещено писать про: ELK, Prometheus, HTTP-ошибки, падения серверов, DevOps и системное администрирование.
    Пиши исключительно про: автоматизацию рабочих процессов сотрудников, интеграции с бизнес-системами (CRM, Jira, ИСУП, почта, календари) и улучшение пользовательского опыта (UX).
    """

    user_content = f"""
    Сценарий: {use_case_name}
    Описание проблемы/задачи пользователей: {summary_description}
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    return ai_client.ask_parsed(
        messages=messages,
        response_model=RecommendationResult,
        temperature=0.4
    )
