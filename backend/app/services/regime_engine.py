import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.models.schemas import RegimeRequest, RegimeResponse, RegimeTimelinePoint, RegimePerformance

def classify_market_regimes(req: RegimeRequest, df: pd.DataFrame) -> RegimeResponse:
    data = df.copy().reset_index(drop=True)
    if len(data) < 50:
        raise ValueError("Insufficient history for regime classification.")
        
    data["close"] = data["close"].astype(float)
    data["daily_return"] = data["close"].pct_change().fillna(0.0)
    
    # Calculate 200-day trend moving average
    data["sma200"] = data["close"].rolling(window=200, min_periods=30).mean()
    # 21-day annualized rolling volatility
    data["rolling_vol"] = (data["daily_return"].rolling(window=21, min_periods=5).std() * np.sqrt(252) * 100.0).fillna(0.0)
    
    # 75th percentile of volatility for High Volatility regime definition
    vol_75th = float(np.percentile(data["rolling_vol"].dropna(), 75))
    
    regimes = []
    colors = []
    vol_percentiles = []
    
    all_vols = data["rolling_vol"].values
    
    for i in range(len(data)):
        c = data["close"].iloc[i]
        sma = data["sma200"].iloc[i]
        vol = data["rolling_vol"].iloc[i]
        
        # Percentile rank of current vol
        pctile = float((all_vols <= vol).mean() * 100.0)
        vol_percentiles.append(round(pctile, 1))
        
        diff_pct = ((c - sma) / sma) if sma and pd.notna(sma) else 0.0
        
        # High volatility shock regime
        if vol >= vol_75th:
            regime = "High Volatility"
            color = "#A855F7" # Violet
        elif diff_pct > 0.03:
            regime = "Bull"
            color = "#10B981" # Emerald
        elif diff_pct < -0.03:
            regime = "Bear"
            color = "#F43F5E" # Rose
        else:
            regime = "Sideways"
            color = "#F59E0B" # Amber
            
        regimes.append(regime)
        colors.append(color)
        
    data["regime"] = regimes
    data["color"] = colors
    data["vol_percentile"] = vol_percentiles
    
    # Build timeline points
    timeline: List[RegimeTimelinePoint] = []
    for i in range(len(data)):
        timeline.append(RegimeTimelinePoint(
            date=str(data["date"].iloc[i]),
            close=round(float(data["close"].iloc[i]), 2),
            regime=str(data["regime"].iloc[i]),
            color=str(data["color"].iloc[i]),
            volatility_percentile=float(data["vol_percentile"].iloc[i])
        ))
        
    # Calculate performance per regime
    total_days = len(data)
    performances: List[RegimePerformance] = []
    
    for r_name in ["Bull", "Bear", "Sideways", "High Volatility"]:
        sub = data[data["regime"] == r_name]
        days = len(sub)
        if days == 0:
            continue
            
        share_time = (days / total_days) * 100.0
        r_daily = sub["daily_return"]
        avg_daily = float(r_daily.mean() * 100.0)
        ann_ret = float(((1.0 + avg_daily / 100.0) ** 252 - 1.0) * 100.0) if avg_daily > -0.5 else -99.9
        ann_vol = float(r_daily.std() * np.sqrt(252) * 100.0) if days > 2 else 0.0
        
        # Max drawdown in this regime
        cum_ret = (1.0 + r_daily).cumprod()
        peak = cum_ret.cummax()
        dd = (cum_ret - peak) / peak
        max_dd = float(dd.min() * 100.0) if not dd.empty else 0.0
        
        performances.append(RegimePerformance(
            regime=r_name,
            days_count=days,
            share_of_time_pct=round(share_time, 1),
            average_daily_return_pct=round(avg_daily, 2),
            annualized_return_pct=round(ann_ret, 1),
            annualized_volatility_pct=round(ann_vol, 1),
            max_drawdown_pct=round(max_dd, 1)
        ))
        
    current_regime = regimes[-1]
    explanation = (
        f"Currently in a {current_regime} state. In this classification, Bull/Bear phases are determined by price positioning "
        f"relative to the 200-day Simple Moving Average (SMA200) with a ±3% neutral corridor, overlaid with an annualized volatility "
        f"trigger at the 75th percentile ({vol_75th:.1f}%)."
    )
    
    return RegimeResponse(
        symbol=req.symbol,
        current_regime=current_regime,
        timeline=timeline,
        performances=performances,
        explanation=explanation
    )
