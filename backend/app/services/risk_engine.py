import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.models.schemas import RiskRequest, RiskResponse, RiskDrawdownPoint

def calculate_risk_analytics(req: RiskRequest, df: pd.DataFrame) -> RiskResponse:
    data = df.copy().reset_index(drop=True)
    if len(data) < 20:
        raise ValueError("Insufficient data for risk metrics calculation.")
        
    data["close"] = data["close"].astype(float)
    data["daily_return"] = data["close"].pct_change().fillna(0.0)
    returns = data["daily_return"].iloc[1:]
    
    # 1. Volatility (annualized)
    annual_vol = float(returns.std() * np.sqrt(252) * 100.0)
    
    # 2. Sharpe Ratio
    rf_daily = req.risk_free_rate / 252.0
    excess_ret = returns - rf_daily
    sharpe = float((excess_ret.mean() / (returns.std() or 1e-6)) * np.sqrt(252))
    
    # 3. Sortino Ratio (Downside deviation)
    neg_rets = returns[returns < 0]
    downside_dev = float(neg_rets.std() * np.sqrt(252)) if len(neg_rets) > 1 else 1e-6
    n_days = len(data)
    years = max(n_days / 252.0, 0.05)
    total_ret = float((data["close"].iloc[-1] / data["close"].iloc[0]) - 1.0)
    cagr = float(((1.0 + total_ret) ** (1.0 / years) - 1.0))
    sortino = float((cagr - req.risk_free_rate) / (downside_dev or 1e-6))
    
    # 4. Maximum Drawdown & Drawdown series
    cum_max = data["close"].cummax()
    drawdown = (data["close"] - cum_max) / cum_max
    max_dd = float(drawdown.min() * 100.0)
    curr_dd = float(drawdown.iloc[-1] * 100.0)
    
    # 5. Historical Value at Risk (VaR)
    # 95% 1-day historical VaR is the 5th percentile of daily losses
    var_95 = float(-np.percentile(returns, 5) * 100.0)
    var_99 = float(-np.percentile(returns, 1) * 100.0)
    
    # 6. Expected Shortfall (CVaR) - average of returns beyond VaR threshold
    tail_returns_95 = returns[returns <= np.percentile(returns, 5)]
    es_95 = float(-tail_returns_95.mean() * 100.0) if len(tail_returns_95) > 0 else var_95
    
    tail_returns_99 = returns[returns <= np.percentile(returns, 1)]
    es_99 = float(-tail_returns_99.mean() * 100.0) if len(tail_returns_99) > 0 else var_99
    
    # 7. Risk Level categorization (Transparent, quantitative rule)
    if annual_vol < 18.0 and abs(max_dd) < 20.0:
        risk_level = "Low Risk"
        summary_text = (
            f"Asset shows moderate annualized volatility ({annual_vol:.1f}%) and disciplined drawdown profile "
            f"({max_dd:.1f}% max trough). Suitable for capital preservation strategies under current macro conditions."
        )
    elif annual_vol < 35.0 and abs(max_dd) < 38.0:
        risk_level = "Moderate Risk"
        summary_text = (
            f"Balanced risk envelope with {annual_vol:.1f}% annualized volatility and {abs(max_dd):.1f}% historical max drawdown. "
            f"Typical of large-cap growth equity indices."
        )
    else:
        risk_level = "High Risk"
        summary_text = (
            f"High-beta profile characterized by {annual_vol:.1f}% volatility and historical drawdowns reaching {max_dd:.1f}%. "
            f"Active risk management and strict position sizing are essential."
        )
        
    # 8. Timeline Series
    rolling_vol = (data["daily_return"].rolling(window=21, min_periods=5).std() * np.sqrt(252) * 100.0).fillna(0.0)
    
    # Underwater duration calculation
    underwater_days = 0
    timeline: List[RiskDrawdownPoint] = []
    for i in range(len(data)):
        dd_val = float(drawdown.iloc[i]) * 100.0
        if dd_val < -0.1:
            underwater_days += 1
        else:
            underwater_days = 0
            
        timeline.append(RiskDrawdownPoint(
            date=str(data["date"].iloc[i]),
            drawdown_pct=round(dd_val, 2),
            underwater_duration_days=underwater_days,
            rolling_volatility_pct=round(float(rolling_vol.iloc[i]), 2)
        ))
        
    return RiskResponse(
        symbol=req.symbol,
        annualized_volatility_pct=round(annual_vol, 2),
        sharpe_ratio=round(sharpe, 2),
        sortino_ratio=round(sortino, 2),
        max_drawdown_pct=round(max_dd, 2),
        var_95_pct=round(var_95, 2),
        var_99_pct=round(var_99, 2),
        expected_shortfall_95_pct=round(es_95, 2),
        expected_shortfall_99_pct=round(es_99, 2),
        current_drawdown_pct=round(curr_dd, 2),
        risk_level=risk_level,
        risk_summary_text=summary_text,
        timeline=timeline
    )
