import re

def clean_text(text: str) -> str:
    """
    Убирает лишние пробелы, переносы строк и странные символы.
    """
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def filter_logs(raw_logs: list[str]) -> list[str]:
    """
    Очищает массив логов и удаляет бессмысленные/короткие запросы.
    """
    cleaned = [clean_text(log) for log in raw_logs]
    valid_logs = [log for log in cleaned if len(log) > 5]
    return valid_logs
