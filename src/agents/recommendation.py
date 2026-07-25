from pydantic import BaseModel, Field
from src.ai import AI

class RecommendationResult(BaseModel):
    automation_potential: str = Field(
        description="Оценка потенциала автоматизации сценария (Высокий / Средний / Низкий) с кратким обоснованием."
    )
    suggested_actions: str = Field(
        description="Список конкретных шагов для СТО (например, интеграция с Jira). Напиши в виде единого текста с Markdown-списком."
    )
    estimated_time_saved: str = Field(
        description="Примерная оценка сэкономленного времени с учетом реального количества запросов. Объясни логику расчета."
    )
    estimated_money_saved: str = Field(
        description="Расчет чистой экономии (Сэкономленное время * 1500 руб) МИНУС (Затраты на токены ИИ). Покажи эту математику."
    )

def generate_recommendations(
    ai_client: AI,
    use_case_name: str,
    summary_description: str,
    queries_count: int,
    total_ai_cost_rub: float,
    department: str = "Общий"
) -> RecommendationResult:
    """
    Предлагает продуктовые решения и считает ЧИСТУЮ экономию (ROI), учитывая затраты на ИИ.
    """
    system_prompt = """
    Ты — Chief Technology Officer (CTO) и эксперт по автоматизации бизнес-процессов.
    Твоя задача: на основе описания сценария оценить его потенциал для автоматизации.

    ОБЯЗАТЕЛЬНО рассчитывай экономический эффект:
    1. Время: Оцени, сколько минут/часов экономит ИИ на 1 таком запросе. Умножь это на общее количество запросов, чтобы получить общую экономию времени.
    2. Деньги: 1 час работы специалиста стоит 1500 рублей. Посчитай сэкономленные деньги. Затем ВЫЧТИ из них реальные затраты на токены ИИ, чтобы получить ЧИСТУЮ ЭКОНОМИЮ.

    Запрещено писать про: ELK, Prometheus, HTTP-ошибки, падения серверов, DevOps.
    Пиши исключительно про: автоматизацию рабочих процессов сотрудников, интеграции с бизнес-системами.
    """

    user_content = f"""
    Сценарий: {use_case_name}
    Отдел: {department}
    Описание задачи: {summary_description}

    Статистика из логов (Вводные для расчета):
    - Сценарий использован раз: {queries_count}
    - Потрачено на токены ИИ: {total_ai_cost_rub} руб.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    return ai_client.ask_parsed(
        messages=messages,
        response_model=RecommendationResult,
        temperature=0.3
    )
