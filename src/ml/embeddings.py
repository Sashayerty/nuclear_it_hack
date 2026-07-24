'''
Создание эмбеддингов для поиска похожих запросов
'''
from sentence_transformers import SentenceTransformer
import numpy as np

MODEL_NAME = "cointegrated/rubert-tiny2"
print(f"Загрузка модели эмбеддингов: {MODEL_NAME}...")
encoder = SentenceTransformer(MODEL_NAME)

def get_embeddings(texts: list[str]) -> np.ndarray:
    """
    Превращает список текстов в матрицу векторов (эмбеддингов).
    """
    if not texts:
        return np.array([])

    embeddings = encoder.encode(texts, show_progress_bar=False)
    return embeddings
