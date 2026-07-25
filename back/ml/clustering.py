'''
Поиск похожих запросов
'''
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from pydantic import BaseModel
from back.config import CLUSTER_DISTANCE_THRESHOLD


class Cluster(BaseModel):
    cluster_id: int
    texts: list[str]

def cluster_requests(texts: list[str], embeddings: np.ndarray, distance_threshold: float = CLUSTER_DISTANCE_THRESHOLD) -> list[Cluster]:
    """
    Группирует запросы на основе их векторной близости.
    distance_threshold регулирует "строгость" объединения (чем меньше, тем больше мелких кластеров).
    """
    if len(texts) == 0:
        return []

    if len(texts) < 2:
        return [Cluster(cluster_id=0, texts=texts)]

    clustering_model = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=distance_threshold,
        metric='cosine',
        linkage='average'
    )

    cluster_labels = clustering_model.fit_predict(embeddings)

    clustered_data = {}
    for text, label in zip(texts, cluster_labels):
        if label not in clustered_data:
            clustered_data[label] = []
        clustered_data[label].append(text)

    results = [
        Cluster(cluster_id=int(cid), texts=cluster_texts)
        for cid, cluster_texts in clustered_data.items()
    ]

    return results
