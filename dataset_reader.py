import csv
import io
import json


def extract_logs(
    data: bytes,
    file_format: str,
    text_column: str,
) -> list[str]:

    file_format = file_format.lower()

    text = data.decode("utf-8-sig")

    if file_format == "csv":
        reader = csv.DictReader(
            io.StringIO(text)
        )

        if not reader.fieldnames:
            raise ValueError(
                "CSV не содержит заголовков"
            )

        if text_column not in reader.fieldnames:
            raise ValueError(
                f"В CSV нет колонки '{text_column}'"
            )

        return [
            row[text_column]
            for row in reader
            if row.get(text_column)
        ]

    if file_format == "json":
        content = json.loads(text)

        if not isinstance(content, list):
            raise ValueError(
                "JSON должен содержать массив"
            )

        if not content:
            return []

        if isinstance(content[0], str):
            return content

        return [
            row[text_column]
            for row in content
            if isinstance(row, dict)
            and row.get(text_column)
        ]

    if file_format == "jsonl":
        result = []

        for line in text.splitlines():
            if not line.strip():
                continue

            row = json.loads(line)

            if isinstance(row, str):
                result.append(row)

            elif isinstance(row, dict):
                value = row.get(text_column)

                if value:
                    result.append(value)

        return result

    if file_format == "txt":
        return [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

    raise ValueError(
        "Поддерживаются csv, json, jsonl и txt"
    )