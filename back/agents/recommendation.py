from pydantic import BaseModel, Field
from back.ai import AI

class RecommendationResult(BaseModel):
    automation_potential: str = Field(
        description="Оценка потенциала автоматизации сценария (Высокий / Средний / Низкий) с кратким обоснованием."
    )
    suggested_actions: str = Field(
        description="Список конкретных шагов для СТО (например, интеграция с Jira). Напиши в виде единого текста с Markdown-списком."
    )
    estimated_time_saved: str = Field(
        description="Красиво опиши сэкономленное время, строго используя переданную цифру минут и пояснив про коэффициент валидации 0.8."
    )
    estimated_money_saved: str = Field(
        description="Красиво опиши чистую выгоду (Net ROI), строго используя переданную цифру в рублях. Упомяни FTE 400к и стоимость токенов."
    )

def generate_recommendations(
    ai_client: AI,
    use_case_name: str,
    summary_description: str,
    queries_count: int,
    total_tokens: int,
    total_ai_cost_rub: float,
    net_roi: float,
    minutes_saved_net: float
) -> RecommendationResult:
    """
    Формирует финальные рекомендации для бизнеса, используя строгие математические расчеты из вне.
    """
    system_prompt = """
    Ты — Chief Technology Officer (CTO) и эксперт по автоматизации бизнес-процессов.
    Твоя задача: на основе описания сценария использования ИИ-агента оценить его потенциал для системной автоматизации и предложить продуктовые решения.

    ВАЖНЫЙ КОНТЕКСТ:
    Ты анализируешь СЫРЫЕ ЛОГИ диалогов сотрудников с корпоративным ИИ-ассистентом.
    ЭТО НЕ СЕРВЕРНЫЕ ЛОГИ. Запрещено писать про: ELK, Prometheus, HTTP-ошибки, падения серверов, DevOps и системное администрирование.
    Пиши исключительно про: автоматизацию рабочих процессов, интеграции с бизнес-системами (CRM, Jira, ИСУП, почта, календари) и улучшение UX.

    ЭКОНОМИКА И ROI:
    Тебе уже даны ГОТОВЫЕ РАСЧЕТЫ экономического эффекта. Ничего не считай сам, просто красиво вставь их в текст!
    - Правила описания времени (estimated_time_saved): Укажи, что с учетом понижающего коэффициента на ручную валидацию результатов ИИ (K=0.8), чистая экономия времени составила переданное число минут.
    - Правила описания денег (estimated_money_saved): Укажи, что при FTE = 400 000 руб (41.6 руб/мин) и стоимости 139 руб за 1М токенов, чистая выгода (Net ROI) составила переданное число рублей (сэкономленное время минус затраты на инференс).
    """

    user_content = f"""
    Сценарий: {use_case_name}
    Описание задачи: {summary_description}
    
    --- ГОТОВЫЕ ВВОДНЫЕ ДЛЯ ОТВЕТА ---
    Задач решено ИИ: {queries_count}
    Потрачено токенов: {total_tokens}
    Затраты на ИИ (Cost): {total_ai_cost_rub:.2f} руб.
    
    ЧИСТАЯ ЭКОНОМИЯ ВРЕМЕНИ: {minutes_saved_net:.1f} минут
    ЧИСТАЯ ВЫГОДА (NET ROI): {net_roi:.2f} руб.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    return ai_client.ask_parsed(
        messages=messages,
        response_model=RecommendationResult,
        temperature=0.2
    )