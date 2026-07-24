from typing import Optional, List, Dict, Type
import requests
from pydantic import BaseModel
from src.config import DEFAULT_MODEL

class AI:
    """
    Класс для общения с локальными моделями Ollama.
    Написан с помощью requests и интегрирован с Pydantic.
    """

    def __init__(
        self,
        model: str,
        url: str = "http://localhost:11434/api/chat"
    ):
        """Инициализация класса"""
        self.model = model
        self.url = url
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def ask_parsed(
        self,
        messages: List[Dict[str, str]],
        response_model: Type[BaseModel],
        timeout: Optional[int] = 300,
        temperature: float = 0.1,
    ) -> BaseModel:
        """
        Отправляет запрос в Ollama, форсирует JSON-режим и возвращает готовый Pydantic-объект.

        Args:
            messages: Список сообщений (история переписки)
            response_model: Класс Pydantic, в который нужно упаковать ответ
            timeout: Таймаут ожидания (по умолчанию 300 сек, т.к. локальные модели могут думать)
            temperature: Температура генерации

        Returns:
            Экземпляр переданного класса response_model
        """
        schema = response_model.model_json_schema()

        augmented_messages = list(messages)
        augmented_messages.append({
            "role": "system",
            "content": "ОБЯЗАТЕЛЬНО: Верни ответ СТРОГО в виде валидного JSON объекта. Никакого текста вокруг, только JSON."
        })

        data = {
            "model": self.model,
            "messages": augmented_messages,
            "options": {
                "temperature": temperature,
            },
            "think": False,
            "stream": False,
            "format": schema,
        }

        try:
            response = requests.post(
                url=self.url,
                json=data,
                headers=self.headers,
                timeout=timeout,
            )
            response.raise_for_status()
            raw_text = response.json()["message"]["content"]
            return response_model.model_validate_json(raw_text)

        except Exception as e:
            print(e)

ai_client = AI(model=DEFAULT_MODEL)
