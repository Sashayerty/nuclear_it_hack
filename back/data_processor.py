import re

def clean_text(text: str) -> str:
    """
    Убирает лишние пробелы, переносы строк и странные символы.
    """
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def filter_logs(raw_logs: list) -> list:
    """
    Очищает массив логов. Теперь поддерживает список словарей с метаданными.
    """
    valid_logs = []
    for log in raw_logs:
        if isinstance(log, str):
            log = {"user_query": log}
            
        text = str(log.get("user_query", ""))
        cleaned_text = clean_text(text)
        
        if len(cleaned_text) > 5:
            log["user_query"] = cleaned_text
            valid_logs.append(log)
            
    return valid_logs
