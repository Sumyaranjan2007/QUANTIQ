import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.models.schemas import AttributionRequest, AttributionResponse, BacktestRequest
from app.services.market_data import get_market_data_provider
from app.services.indicators import calculate_technical_indicators
from app.services.backtest_engine import run_backtest_simulation

def analyze_event_attribution(req: AttributionRequest) -> AttributionResponse:
    provider = get_market_data_provider()
    df = provider.get_historical_data(req.symbol)
    
    # Run backtest to get equity curve and signals
    bt_req = BacktestRequest(symbol=req.symbol, strategy=req.strategy)
    bt_res = run_backtest_simulation(bt_req, df)
    
    # Indicators
    ind_res = calculate_technical_indicators(df)
    ind_df = ind_res["dataframe"]
    
    curve_df = pd.DataFrame([p.model_dump() for p in bt_res.equity_curve])
    
    # Identify target date based on event_type
    if req.target_date:
        target_dt = req.target_date
    elif req.event_type == "max_drawdown":
        worst_idx = curve_df["drawdown_pct"].idxmin()
        target_dt = curve_df.iloc[worst_idx]["date"]
    elif req.event_type == "biggest_gain":
        curve_df["daily_ret"] = curve_df["strategy_equity"].pct_change()
        best_idx = curve_df["daily_ret"].idxmax()
        target_dt = curve_df.iloc[best_idx]["date"]
    elif req.event_type == "biggest_loss":
        curve_df["daily_ret"] = curve_df["strategy_equity"].pct_change()
        loss_idx = curve_df["daily_ret"].idxmin()
        target_dt = curve_df.iloc[loss_idx]["date"]
    elif req.event_type == "volatility_spike":
        ind_df["v_diff"] = ind_df["rolling_volatility"].diff()
        spike_idx = ind_df["v_diff"].idxmax()
        target_dt = str(ind_df.iloc[spike_idx]["date"])
    else: # regime_flip
        target_dt = curve_df.iloc[len(curve_df) // 2]["date"]
        
    # Match the row in ind_df and curve_df
    ind_match = ind_df[ind_df["date"] == target_dt]
    curve_match = curve_df[curve_df["date"] == target_dt]
    
    if ind_match.empty or curve_match.empty:
        ind_match = ind_df.iloc[-1:]
        curve_match = curve_df.iloc[-1:]
        target_dt = str(ind_match["date"].values[0])
        
    row_ind = ind_match.iloc[0]
    row_cur = curve_match.iloc[0]
    
    price = float(row_ind["close"])
    daily_ret = float(row_ind["daily_return"]) * 100.0
    vol = float(row_ind["rolling_volatility"]) * 100.0
    sma20 = float(row_ind["sma20"])
    sma50 = float(row_ind["sma50"])
    sma200 = float(row_ind["sma200"])
    
    signal_val = int(row_cur["signal"])
    pos_val = int(row_cur["position"])
    dd_val = float(row_cur["drawdown_pct"])
    
    regime = "Bull" if price > sma200 else ("High Volatility" if vol > 35 else "Bear")
    signal_str = "LONG / BUY" if signal_val == 1 else "CASH / EXIT"
    pos_str = "Invested 100%" if pos_val == 1 else "Flat (Cash 100%)"
    
    event_titles = {
        "max_drawdown": f"Maximum Strategy Drawdown Event ({dd_val:.1f}%)",
        "biggest_gain": f"Highest Single-Day Gain ({daily_ret:+.2f}%)",
        "biggest_loss": f"Largest Adverse Move ({daily_ret:.2f}%)",
        "volatility_spike": f"Volatility Shock Event ({vol:.1f}% Annualized)",
        "regime_flip": f"Macro Trend Transition Event"
    }
    title = event_titles.get(req.event_type, "Quantitative Event Attribution")
    
    # Contextual Narrative
    if req.event_type == "max_drawdown":
        narrative = (
            f"On {target_dt}, the {req.symbol} strategy suffered its deepest peak-to-trough decline of {dd_val:.1f}%. "
            f"Asset price dropped to {price:.2f} with 1-day change of {daily_ret:+.2f}%. "
            f"Fast SMA20 ({sma20:.2f}) lagged below Slow SMA50 ({sma50:.2f}), causing the crossover logic to incur "
            f"whipsaw losses during trend deceleration before derisking to cash."
        )
        drivers = [
            f"Asset retraced from recent highs with annualized volatility spiking to {vol:.1f}%.",
            f"Trend indicator crossover lagged by several bars, taking adverse excursion before the exit signal fired.",
            f"Transaction fee (0.10%) and slippage (0.05%) added friction during the rebalancing bar.",
            f"Market regime classification at event date was '{regime}'."
        ]
    elif req.event_type == "biggest_gain":
        narrative = (
            f"On {target_dt}, the strategy captured a {daily_ret:+.2f}% upward thrust in {req.symbol}. "
            f"The system was already positioned in {pos_str}, allowing full capital compounding without slippage drag on that specific bar."
        )
        drivers = [
            f"Upward momentum impulse pushed price ({price:.2f}) cleanly above SMA20 ({sma20:.2f}).",
            "Strategy had established a long position prior to the expansion bar.",
            f"Volatility expanded favorably to {vol:.1f}%."
        ]
    else:
        narrative = (
            f"On {target_dt}, an anomalous quantitative shock occurred in {req.symbol}. "
            f"Price settled at {price:.2f} amidst {vol:.1f}% rolling volatility. The strategy signal stood at {signal_str}."
        )
        drivers = [
            f"Rolling 21-day volatility measured {vol:.1f}%.",
            f"Price vs SMA200 distance indicated a '{regime}' phase.",
            f"Strategy drawdown at this exact moment stood at {dd_val:.1f}%."
        ]
        
    return AttributionResponse(
        event_type=req.event_type,
        event_title=title,
        date=str(target_dt),
        symbol=req.symbol,
        price_level=round(price, 2),
        price_change_pct=round(daily_ret, 2),
        rolling_volatility_pct=round(vol, 2),
        market_regime=regime,
        strategy_signal=signal_str,
        strategy_position=pos_str,
        drawdown_at_moment_pct=round(dd_val, 2),
        fast_indicator_value=round(sma20, 2),
        slow_indicator_value=round(sma50, 2),
        narrative_explanation=narrative,
        key_drivers=drivers
    )
