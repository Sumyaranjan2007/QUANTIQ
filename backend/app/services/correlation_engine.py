import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.models.schemas import CorrelationRequest, CorrelationResponse
from app.services.market_data import get_market_data_provider

def calculate_correlation_matrix(req: CorrelationRequest) -> CorrelationResponse:
    provider = get_market_data_provider()
    symbols = req.symbols if req.symbols else ["XAU", "BTC", "NVDA", "^NSEI"]
    
    # Align returns across all requested symbols on matching dates
    series_dict = {}
    for sym in symbols:
        df = provider.get_historical_data(sym, req.start_date, req.end_date)
        if not df.empty:
            df = df.set_index("date")
            series_dict[sym] = df["close"].pct_change().dropna()
            
    comb_df = pd.DataFrame(series_dict).dropna()
    if comb_df.empty:
        raise ValueError("No overlapping historical dates found for correlation calculation.")
        
    corr_df = comb_df.corr(method="pearson")
    
    matrix: Dict[str, Dict[str, float]] = {}
    pairs = []
    
    for s1 in symbols:
        matrix[s1] = {}
        for s2 in symbols:
            val = float(corr_df.loc[s1, s2]) if (s1 in corr_df.index and s2 in corr_df.columns) else 0.0
            matrix[s1][s2] = round(val, 2)
            if s1 < s2: # unique pairs
                pairs.append({
                    "pair": f"{s1} / {s2}",
                    "asset1": s1,
                    "asset2": s2,
                    "correlation": round(val, 2)
                })
                
    # Sort pairs to find highest and lowest
    pairs.sort(key=lambda x: x["correlation"], reverse=True)
    highest = pairs[0] if pairs else {"pair": "N/A", "correlation": 0.0}
    lowest = pairs[-1] if pairs else {"pair": "N/A", "correlation": 0.0}
    
    # Generate dynamic quantitative narrative
    if highest["correlation"] > 0.4:
        rel_type = "a pronounced co-movement trend"
    elif highest["correlation"] > 0.15:
        rel_type = "moderate positive co-movement"
    else:
        rel_type = "weak correlation"
        
    low_corr_val = lowest["correlation"]
    if low_corr_val < 0.05:
        diversifier_text = f"demonstrating strong portfolio diversification benefits with an inverse/decoupled correlation of {low_corr_val:+.2f}."
    else:
        diversifier_text = f"offering mild diversification with a modest correlation of {low_corr_val:+.2f}."

    insight_text = (
        f"During the selected period, {highest['pair']} exhibited the strongest positive correlation ({highest['correlation']:+.2f}), "
        f"indicating {rel_type}. Conversely, {lowest['pair']} had the lowest co-movement ({lowest['correlation']:+.2f}), {diversifier_text}"
    )

    return CorrelationResponse(
        symbols=symbols,
        matrix=matrix,
        insight_text=insight_text,
        highest_pair=highest,
        lowest_pair=lowest
    )
