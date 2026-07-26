import json
from back.config import DEBUG_MODE
from back.ai import ai_client
from back.data_processor import filter_logs
from back.agents.classification import classify_request
from back.ml.embeddings import get_embeddings
from back.ml.clustering import cluster_requests
from back.agents.naming import name_cluster
from back.agents.summary import summarize_cluster
from back.agents.recommendation import generate_recommendations
from back.economics import calculate_finops_and_roi

def run_analysis_pipeline(raw_logs: list) -> list[dict]:
    if DEBUG_MODE:
        print("1. Очистка данных...")

    valid_logs = filter_logs(raw_logs)

    if DEBUG_MODE:
        print(f"2. Макро-классификация запросов (всего {len(valid_logs)} шт.)...")
    categorized_logs = {}
    for log_obj in valid_logs:
        text = log_obj.get("user_query", "")
        if not text:
            continue
        classification = classify_request(ai_client, text)
        if DEBUG_MODE:
            print(f"  -> Классификация: {classification.categories}")
        main_category = classification.categories[0] if classification.categories else "Другое"
        if main_category not in categorized_logs:
            categorized_logs[main_category] = []
        categorized_logs[main_category].append(log_obj)
    final_report = []
    if DEBUG_MODE:
        print("3. Поиск use-cases, агрегация FinOps и генерация инсайтов...")
    for category, log_objects_in_category in categorized_logs.items():
        if DEBUG_MODE:
            print(f"  -> Анализ категории: [{category}] (запросов: {len(log_objects_in_category)})")
        texts_only = [obj.get("user_query", "") for obj in log_objects_in_category]
        embeddings = get_embeddings(texts_only)
        clusters = cluster_requests(texts_only, embeddings, distance_threshold=0.5)
        category_data = {
            "category_name": category,
            "total_requests": len(log_objects_in_category),
            "use_cases": []
        }
        for cluster in clusters:
            sample_texts = cluster.texts[:30]
            naming_res = name_cluster(ai_client, sample_texts)
            summary_res = summarize_cluster(ai_client, naming_res.use_case_name, sample_texts)
            cluster_metadata = [
                obj for obj in log_objects_in_category 
                if obj.get("user_query", "") in cluster.texts
            ]
            total_tokens = sum(int(obj.get("tokens_count", 0)) for obj in cluster_metadata)
            total_price_csv = sum(float(obj.get("price_rub", 0.0)) for obj in cluster_metadata)
            departments = [obj.get("department") for obj in cluster_metadata if obj.get("department")]
            top_department = max(set(departments), key=departments.count) if departments else "Общий"
            eco_metrics = calculate_finops_and_roi(
                queries_count=len(cluster.texts),
                total_tokens=total_tokens,
                total_price_from_csv=total_price_csv
            )
            rec_res = generate_recommendations(
                ai_client=ai_client,
                use_case_name=naming_res.use_case_name,
                summary_description=summary_res.description,
                queries_count=len(cluster.texts),
                total_tokens=total_tokens,
                total_ai_cost_rub=eco_metrics["total_ai_cost_rub"],
                net_roi=eco_metrics["net_roi"],
                minutes_saved_net=eco_metrics["minutes_saved_net"]
            )

            use_case_data = {
                "use_case_name": naming_res.use_case_name,
                "queries_count": len(cluster.texts),
                "total_tokens_used": total_tokens,
                "total_cost_rub": round(eco_metrics["total_ai_cost_rub"], 2),
                "avg_cost_per_query_rub": round(eco_metrics["avg_cost_per_query_rub"], 2),
                "dominant_department": top_department,
                "examples": cluster.texts,
                "description": summary_res.description,
                "typical_phrases": summary_res.typical_phrases,
                "pain_points": summary_res.pain_points,
                "broken_queries": summary_res.broken_queries,
                "automation_potential": rec_res.automation_potential,
                "suggested_actions": rec_res.suggested_actions,
                "estimated_time_saved": rec_res.estimated_time_saved,
                "estimated_money_saved": rec_res.estimated_money_saved
            }
            category_data["use_cases"].append(use_case_data)
        final_report.append(category_data)
    if DEBUG_MODE:
        print("Пайплайн успешно завершен!")

    return final_report
