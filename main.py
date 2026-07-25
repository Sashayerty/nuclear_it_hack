import pandas as pd
import json
import os
from back.pipeline import run_analysis_pipeline
from back.config import DEBUG_MODE


def main():
    csv_path = "data/raw/1.csv"

    if not os.path.exists(csv_path):
        print(f"Ошибка: Файл {csv_path} не найден!")
        return

    if DEBUG_MODE:
        print(f"Загрузка данных из {csv_path}...")
    df = pd.read_csv(csv_path)

    text_column = "user_query"

    if text_column not in df.columns:
        print(f"Ошибка: Колонки '{text_column}' нет в CSV. Доступные колонки: {list(df.columns)}")
        return

    raw_logs = df[text_column].dropna().astype(str).tolist()[:10]
    if DEBUG_MODE:
        print(f"Подготовлено {len(raw_logs)} запросов для анализа.")

    report_data = run_analysis_pipeline(raw_logs)

    print(f"Отчет: {report_data}")

    output_dir = "data/processed"
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(output_dir, "analysis_report.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(report_data, f, ensure_ascii=False, indent=4)

    if DEBUG_MODE:
        print(f"Успех! Результат сохранен в {output_file}. Теперь можно делать дашборд!")

if __name__ == "__main__":
    main()
