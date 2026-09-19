import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.models.schemas import IndicatorPoint, AnalysisResponse

def calculate_technical_indicators(
    df: pd.DataFrame, risk_free_rate: float = 0.04
) -> Dict[str, Any]:
    """
    Computes professional quantitative indicators without lookahead bias.
    """
    data = df.copy()
    data["close"] = data["close"].astype(float)
    
    # Moving Averages
    data["sma20"] = data["close"].rolling(window=20, min_periods=1).mean()
    data["sma50"] = data["close"].rolling(window=50, min_periods=1).mean()
    data["sma200"] = data["close"].rolling(window=200, min_periods=1).mean()
    
    data["ema20"] = data["close"].ewm(span=20, adjust=False).mean()
    data["ema50"] = data["close"].ewm(span=50, adjust=False).mean()
    
    # Returns
    data["daily_return"] = data["close"].pct_change().fillna(0.0)
    data["cumulative_return"] = (1.0 + data["daily_return"]).cumprod() - 1.0
    data["log_return"] = np.log(data["close"] / data["close"].shift(1)).fillna(0.0)
    
    # Rolling Volatility (21 trading days annualized: sqrt(252))
    data["rolling_volatility"] = (
        data["daily_return"].rolling(window=21, min_periods=5).std() * np.sqrt(252)
    ).fillna(0.0)
    
    # Rolling Sharpe (63 trading days ~ 1 quarter)
    rf_daily = risk_free_rate / 252.0
    excess_ret = data["daily_return"] - rf_daily
    rolling_mean_excess = excess_ret.rolling(window=63, min_periods=15).mean() * 252.0
    rolling_std = data["daily_return"].rolling(window=63, min_periods=15).std() * np.sqrt(252.0)
    data["rolling_sharpe"] = (rolling_mean_excess / rolling_std.replace(0, np.nan)).fillna(0.0)
    
    # Drawdown series
    cumulative_max = data["close"].cummax()
    drawdown = (data["close"] - cumulative_max) / cumulative_max
    max_drawdown = float(drawdown.min() * 100.0)
    
    # Overall summary metrics
    n_days = len(data)
    total_ret = float(data["cumulative_return"].iloc[-1])
    # CAGR
    years = max(n_days / 252.0, 0.05)
    cagr = float(((1.0 + total_ret) ** (1.0 / years) - 1.0) * 100.0)
    
    daily_returns_clean = data["daily_return"].iloc[1:]
    annual_vol = float(daily_returns_clean.std() * np.sqrt(252) * 100.0)
    
    # Sharpe
    mean_daily_excess = (daily_returns_clean.mean() - rf_daily)
    sharpe = float((mean_daily_excess / (daily_returns_clean.std() or 1e-6)) * np.sqrt(252))
    
    # Build series
    series: List[IndicatorPoint] = []
    for idx, row in data.iterrows():
        series.append(IndicatorPoint(
            date=str(row["date"]),
            close=round(float(row["close"]), 2),
            sma20=round(float(row["sma20"]), 2) if pd.notna(row["sma20"]) else None,
            sma50=round(float(row["sma50"]), 2) if pd.notna(row["sma50"]) else None,
            sma200=round(float(row["sma200"]), 2) if pd.notna(row["sma200"]) else None,
            ema20=round(float(row["ema20"]), 2) if pd.notna(row["ema20"]) else None,
            ema50=round(float(row["ema50"]), 2) if pd.notna(row["ema50"]) else None,
            daily_return=round(float(row["daily_return"]) * 100.0, 2),
            cumulative_return=round(float(row["cumulative_return"]) * 100.0, 2),
            log_return=round(float(row["log_return"]) * 100.0, 3),
            rolling_volatility=round(float(row["rolling_volatility"]) * 100.0, 2),
            rolling_sharpe=round(float(row["rolling_sharpe"]), 2)
        ))
        
    last_row = data.iloc[-1]
    
    return {
        "summary": {
            "current_price": round(float(last_row["close"]), 2),
            "daily_return_pct": round(float(last_row["daily_return"]) * 100.0, 2),
            "annual_return_pct": round(cagr, 2),
            "annual_volatility_pct": round(annual_vol, 2),
            "sharpe_ratio": round(sharpe, 2),
            "max_drawdown_pct": round(max_drawdown, 2),
            "sma20": round(float(last_row["sma20"]), 2),
            "sma50": round(float(last_row["sma50"]), 2),
            "sma200": round(float(last_row["sma200"]), 2),
            "ema20": round(float(last_row["ema20"]), 2),
            "ema50": round(float(last_row["ema50"]), 2)
        },
        "series": series,
        "dataframe": data
    }
