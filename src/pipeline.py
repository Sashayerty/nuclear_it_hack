import json
from src.config import DEBUG_MODE
from src.ai import ai_client
from src.data_processor import filter_logs
from src.agents.classification import classify_request
from src.ml.embeddings import get_embeddings
from src.ml.clustering import cluster_requests
from src.agents.naming import name_cluster
from src.agents.summary import summarize_cluster
from src.agents.recommendation import generate_recommendations

def run_analysis_pipeline(raw_logs: list[str]) -> list[dict]:
    """
    Полный цикл: от сырых логов до готового аналитического отчета по ИИ-агентам.
    """
    if DEBUG_MODE:
        print("1. Очистка данных...")
    valid_logs = filter_logs(raw_logs)

    if DEBUG_MODE:
        print(f"2. Макро-классификация запросов (всего {len(valid_logs)} шт.)...")
    categorized_logs = {}

    for log in valid_logs:
        classification = classify_request(ai_client, log)
        if DEBUG_MODE:
            print(f"  -> Классификация: {classification.categories}")
        main_category = classification.categories[0] if classification.categories else "Другое"

        if main_category not in categorized_logs:
            categorized_logs[main_category] = []
        categorized_logs[main_category].append(log)

    final_report = []
    if DEBUG_MODE:
        print("3. Поиск use-cases и генерация инсайтов...")

    for category, logs_in_category in categorized_logs.items():
        if DEBUG_MODE:
            print(f"  -> Анализ категории: [{category}] (запросов: {len(logs_in_category)})")

        # if len(logs_in_category) < 2:
        #     continue

        embeddings = get_embeddings(logs_in_category)
        clusters = cluster_requests(logs_in_category, embeddings, distance_threshold=0.5)

        category_data = {
            "category_name": category,
            "total_requests": len(logs_in_category),
            "use_cases": []
        }

        for cluster in clusters:
            # if len(cluster.texts) < 2:
            #     continue
            naming_res = name_cluster(ai_client, cluster.texts)
            summary_res = summarize_cluster(ai_client, naming_res.use_case_name, cluster.texts)
            rec_res = generate_recommendations(ai_client, naming_res.use_case_name, summary_res.description)

            use_case_data = {
                "use_case_name": naming_res.use_case_name,
                "queries_count": len(cluster.texts),
                "examples": cluster.texts[:3],
                "description": summary_res.description,
                "typical_phrases": summary_res.typical_phrases,
                "pain_points": summary_res.pain_points,
                "broken_queries": summary_res.broken_queries,
                "automation_potential": rec_res.automation_potential,
                "suggested_actions": rec_res.suggested_actions
            }
            category_data["use_cases"].append(use_case_data)

        final_report.append(category_data)
    if DEBUG_MODE:
        print("Пайплайн успешно завершен!")
    return final_report
