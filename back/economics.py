def calculate_finops_and_roi(
    queries_count: int, 
    total_tokens: int, 
    total_price_from_csv: float, 
    minutes_per_task: float = 15.0
) -> dict:
    """
    Рассчитывает затраты на ИИ и чистый ROI на основе строгих вводных от жюри.
    """
    if total_price_from_csv == 0 and total_tokens > 0:
        actual_cost = (total_tokens / 1_000_000.0) * 139.0
    else:
        actual_cost = total_price_from_csv
        
    avg_cost_per_query = actual_cost / queries_count if queries_count > 0 else 0

    FTE_MIN_COST = 400_000 / 9600
    
    VALIDATION_COEF = 0.8 
    
    minutes_saved_gross = queries_count * minutes_per_task
    minutes_saved_net = minutes_saved_gross * VALIDATION_COEF
    
    money_saved_gross = minutes_saved_net * FTE_MIN_COST
    net_roi = money_saved_gross - actual_cost
    
    return {
        "total_ai_cost_rub": actual_cost,
        "avg_cost_per_query_rub": avg_cost_per_query,
        "minutes_saved_net": minutes_saved_net,
        "net_roi": net_roi
    }
