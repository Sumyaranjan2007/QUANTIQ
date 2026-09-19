import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.models.schemas import (
    BacktestRequest, BacktestResponse, BacktestMetrics,
    EquityPoint, Trade, StrategyDNA, BenchmarkComparisonRow
)

def run_backtest_simulation(req: BacktestRequest, df: pd.DataFrame) -> BacktestResponse:
    data = df.copy().reset_index(drop=True)
    n = len(data)
    if n < 30:
        raise ValueError("Insufficient historical bars for quantitative backtesting.")
        
    data["close"] = data["close"].astype(float)
    
    # 1. Generate Signal series (1 = Long, 0 = Cash/Flat) based on strategy rules
    signals = np.zeros(n, dtype=int)
    strat_key = req.strategy.lower()
    
    if strat_key == "sma_crossover":
        strat_name = f"SMA Crossover ({req.fast_period}/{req.slow_period})"
        fast_sma = data["close"].rolling(window=req.fast_period, min_periods=req.fast_period).mean()
        slow_sma = data["close"].rolling(window=req.slow_period, min_periods=req.slow_period).mean()
        # Signal is 1 when fast > slow
        valid_idx = ~(fast_sma.isna() | slow_sma.isna())
        signals[valid_idx] = np.where(fast_sma[valid_idx] > slow_sma[valid_idx], 1, 0)
        
    elif strat_key == "ema_crossover":
        strat_name = f"EMA Crossover ({req.fast_period}/{req.slow_period})"
        fast_ema = data["close"].ewm(span=req.fast_period, adjust=False).mean()
        slow_ema = data["close"].ewm(span=req.slow_period, adjust=False).mean()
        signals = np.where(fast_ema > slow_ema, 1, 0)
        # warm-up period
        signals[:req.slow_period] = 0
        
    elif strat_key == "momentum":
        strat_name = f"Momentum ({req.momentum_lookback}D, >{req.momentum_threshold*100:.1f}%)"
        lookback = req.momentum_lookback
        mom_ret = data["close"].pct_change(periods=lookback)
        valid = ~mom_ret.isna()
        signals[valid] = np.where(mom_ret[valid] > req.momentum_threshold, 1, 0)
        
    elif strat_key == "mean_reversion":
        strat_name = f"Mean Reversion (Rolling {req.mean_reversion_lookback}D, Band {req.mean_reversion_std_dev}σ)"
        lb = req.mean_reversion_lookback
        rolling_mean = data["close"].rolling(window=lb, min_periods=lb).mean()
        rolling_std = data["close"].rolling(window=lb, min_periods=lb).std()
        lower_band = rolling_mean - (req.mean_reversion_std_dev * rolling_std)
        
        # State machine for mean reversion
        pos = 0
        for i in range(lb, n):
            c = data["close"].iloc[i]
            mean_val = rolling_mean.iloc[i]
            low_val = lower_band.iloc[i]
            if pos == 0 and c < low_val:
                pos = 1 # Enter when price falls sufficiently below mean
            elif pos == 1 and c >= mean_val:
                pos = 0 # Exit when price returns toward mean
            signals[i] = pos
            
    else:
        # Default to Buy & Hold
        strat_name = "Buy & Hold Benchmark"
        signals[:] = 1

    # 2. Execution simulation to avoid look-ahead bias
    # Signal decided at end of bar t is acted on for bar t+1
    positions = np.zeros(n, dtype=int)
    positions[1:] = signals[:-1] # Shift by 1 bar
    
    # Capital tracking
    initial_cap = req.initial_capital
    cash = initial_cap
    shares = 0.0
    equity = np.zeros(n)
    benchmark_equity = np.zeros(n)
    
    base_price = data["close"].iloc[0]
    benchmark_shares = (initial_cap * (1.0 - req.transaction_cost - req.slippage)) / base_price
    
    trades: List[Trade] = []
    trade_id = 1
    entry_idx = None
    entry_price_executed = 0.0
    
    total_tx_costs = 0.0
    total_slip_costs = 0.0
    
    for i in range(n):
        curr_price = data["close"].iloc[i]
        curr_pos = positions[i]
        prev_pos = positions[i-1] if i > 0 else 0
        
        # Check Entry
        if prev_pos == 0 and curr_pos == 1:
            # Entering position
            slippage_price = curr_price * (1.0 + req.slippage) # buy higher
            cost_factor = 1.0 + req.transaction_cost
            alloc_capital = cash * req.position_size
            shares = alloc_capital / (slippage_price * cost_factor)
            
            tx_cost = shares * slippage_price * req.transaction_cost
            slip_cost = shares * curr_price * req.slippage
            total_tx_costs += tx_cost
            total_slip_costs += slip_cost
            
            cash -= (shares * slippage_price + tx_cost)
            entry_idx = i
            entry_price_executed = slippage_price
            
        # Check Exit
        elif prev_pos == 1 and curr_pos == 0:
            # Exiting position
            slippage_price = curr_price * (1.0 - req.slippage) # sell lower
            tx_cost = shares * slippage_price * req.transaction_cost
            slip_cost = shares * curr_price * req.slippage
            total_tx_costs += tx_cost
            total_slip_costs += slip_cost
            
            proceeds = (shares * slippage_price) - tx_cost
            gross_ret = ((curr_price - entry_price_executed) / entry_price_executed) * 100.0
            net_ret = ((slippage_price * (1.0 - req.transaction_cost) - entry_price_executed) / entry_price_executed) * 100.0
            pnl = proceeds - (shares * entry_price_executed)
            
            entry_date = str(data["date"].iloc[entry_idx])
            exit_date = str(data["date"].iloc[i])
            holding_days = i - entry_idx
            
            trades.append(Trade(
                id=trade_id,
                entry_date=entry_date,
                exit_date=exit_date,
                entry_price=round(entry_price_executed, 2),
                exit_price=round(slippage_price, 2),
                position_type="LONG",
                shares=round(shares, 4),
                gross_return_pct=round(gross_ret, 2),
                net_return_pct=round(net_ret, 2),
                profit_loss=round(pnl, 2),
                holding_days=holding_days,
                exit_reason="Strategy Exit Signal"
            ))
            trade_id += 1
            cash += proceeds
            shares = 0.0
            entry_idx = None
            
        # End of bar valuation
        equity[i] = cash + (shares * curr_price)
        benchmark_equity[i] = benchmark_shares * curr_price
        
    # If still in open trade at the end, close it for reporting metrics
    if shares > 0 and entry_idx is not None:
        last_price = data["close"].iloc[-1]
        slip_p = last_price * (1.0 - req.slippage)
        net_ret = ((slip_p * (1.0 - req.transaction_cost) - entry_price_executed) / entry_price_executed) * 100.0
        pnl = (shares * slip_p * (1.0 - req.transaction_cost)) - (shares * entry_price_executed)
        trades.append(Trade(
            id=trade_id,
            entry_date=str(data["date"].iloc[entry_idx]),
            exit_date=str(data["date"].iloc[-1]),
            entry_price=round(entry_price_executed, 2),
            exit_price=round(slip_p, 2),
            position_type="LONG",
            shares=round(shares, 4),
            gross_return_pct=round(((last_price - entry_price_executed) / entry_price_executed) * 100.0, 2),
            net_return_pct=round(net_ret, 2),
            profit_loss=round(pnl, 2),
            holding_days=n - 1 - entry_idx,
            exit_reason="End of Backtest Window"
        ))

    # 3. Calculate Performance Curves & Drawdowns
    strat_cum_max = pd.Series(equity).cummax()
    strat_dd = (pd.Series(equity) - strat_cum_max) / strat_cum_max
    
    bench_cum_max = pd.Series(benchmark_equity).cummax()
    bench_dd = (pd.Series(benchmark_equity) - bench_cum_max) / bench_cum_max
    
    final_cap = float(equity[-1])
    tot_return = ((final_cap - initial_cap) / initial_cap) * 100.0
    bench_final = float(benchmark_equity[-1])
    bench_tot_return = ((bench_final - initial_cap) / initial_cap) * 100.0
    
    years = max(n / 252.0, 0.05)
    cagr = ((final_cap / initial_cap) ** (1.0 / years) - 1.0) * 100.0
    bench_cagr = ((bench_final / initial_cap) ** (1.0 / years) - 1.0) * 100.0
    
    # Returns & Volatility
    strat_daily_rets = pd.Series(equity).pct_change().fillna(0.0)
    bench_daily_rets = pd.Series(benchmark_equity).pct_change().fillna(0.0)
    
    strat_vol = float(strat_daily_rets.std() * np.sqrt(252) * 100.0)
    bench_vol = float(bench_daily_rets.std() * np.sqrt(252) * 100.0)
    
    rf_daily = req.risk_free_rate / 252.0
    mean_excess = (strat_daily_rets.mean() - rf_daily)
    sharpe = float((mean_excess / (strat_daily_rets.std() or 1e-6)) * np.sqrt(252))
    
    bench_mean_excess = (bench_daily_rets.mean() - rf_daily)
    bench_sharpe = float((bench_mean_excess / (bench_daily_rets.std() or 1e-6)) * np.sqrt(252))
    
    # Sortino ratio (downside deviation)
    neg_rets = strat_daily_rets[strat_daily_rets < 0]
    downside_dev = float(neg_rets.std() * np.sqrt(252)) if len(neg_rets) > 1 else 1e-6
    sortino = float(((cagr / 100.0) - req.risk_free_rate) / (downside_dev or 1e-6))
    
    max_dd = float(strat_dd.min() * 100.0)
    bench_max_dd = float(bench_dd.min() * 100.0)
    
    # Trade statistics
    total_trades = len(trades)
    winning_trades = len([t for t in trades if t.profit_loss > 0])
    losing_trades = len([t for t in trades if t.profit_loss <= 0])
    win_rate = (winning_trades / total_trades * 100.0) if total_trades > 0 else 0.0
    
    gross_gains = sum([t.profit_loss for t in trades if t.profit_loss > 0])
    gross_losses = abs(sum([t.profit_loss for t in trades if t.profit_loss < 0]))
    profit_factor = round(gross_gains / gross_losses, 2) if gross_losses > 0 else (99.0 if gross_gains > 0 else 0.0)
    
    avg_trade_ret = float(np.mean([t.net_return_pct for t in trades])) if trades else 0.0
    avg_hold = float(np.mean([t.holding_days for t in trades])) if trades else 0.0
    
    # 4. Strategy DNA Radar Scores (0 - 100)
    # Trading frequency: scale based on trades per year
    tpy = total_trades / years
    tf_score = min(100.0, max(10.0, tpy * 4.5))
    
    # Trend sensitivity: higher for moving average / momentum strategies
    if "crossover" in strat_key or "momentum" in strat_key:
        trend_score = 85.0
        vol_score = 65.0
    elif "mean_reversion" in strat_key:
        trend_score = 35.0
        vol_score = 80.0
    else:
        trend_score = 50.0
        vol_score = 50.0
        
    dd_resilience = min(100.0, max(15.0, 100.0 - abs(max_dd) * 1.5))
    hold_duration_score = min(100.0, max(10.0, avg_hold * 1.8))
    signal_prec = min(100.0, max(10.0, win_rate * 1.1 + (profit_factor * 8.0)))
    
    dna = StrategyDNA(
        trading_frequency=round(tf_score, 1),
        trend_sensitivity=round(trend_score, 1),
        volatility_sensitivity=round(vol_score, 1),
        drawdown_resilience=round(dd_resilience, 1),
        holding_duration=round(hold_duration_score, 1),
        signal_precision=round(signal_prec, 1)
    )
    
    metrics = BacktestMetrics(
        initial_capital=round(initial_cap, 2),
        final_capital=round(final_cap, 2),
        total_return_pct=round(tot_return, 2),
        benchmark_return_pct=round(bench_tot_return, 2),
        cagr_pct=round(cagr, 2),
        benchmark_cagr_pct=round(bench_cagr, 2),
        sharpe_ratio=round(sharpe, 2),
        benchmark_sharpe=round(bench_sharpe, 2),
        sortino_ratio=round(sortino, 2),
        max_drawdown_pct=round(max_dd, 2),
        benchmark_max_drawdown_pct=round(bench_max_dd, 2),
        annual_volatility_pct=round(strat_vol, 2),
        benchmark_volatility_pct=round(bench_vol, 2),
        win_rate_pct=round(win_rate, 2),
        profit_factor=round(profit_factor, 2),
        total_trades=total_trades,
        winning_trades=winning_trades,
        losing_trades=losing_trades,
        avg_trade_return_pct=round(avg_trade_ret, 2),
        avg_holding_period_days=round(avg_hold, 1),
        total_transaction_costs=round(total_tx_costs, 2),
        total_slippage_cost=round(total_slip_costs, 2)
    )
    
    # 5. Equity points series
    equity_curve: List[EquityPoint] = []
    for i in range(n):
        s_ret = ((equity[i] - initial_cap) / initial_cap) * 100.0
        b_ret = ((benchmark_equity[i] - initial_cap) / initial_cap) * 100.0
        equity_curve.append(EquityPoint(
            date=str(data["date"].iloc[i]),
            close=round(float(data["close"].iloc[i]), 2),
            strategy_equity=round(float(equity[i]), 2),
            benchmark_equity=round(float(benchmark_equity[i]), 2),
            strategy_return_pct=round(s_ret, 2),
            benchmark_return_pct=round(b_ret, 2),
            drawdown_pct=round(float(strat_dd.iloc[i]) * 100.0, 2),
            benchmark_drawdown_pct=round(float(bench_dd.iloc[i]) * 100.0, 2),
            signal=int(signals[i]),
            position=int(positions[i])
        ))
        
    return BacktestResponse(
        symbol=req.symbol,
        strategy=req.strategy,
        strategy_name=strat_name,
        parameters={
            "initial_capital": req.initial_capital,
            "fast_period": req.fast_period,
            "slow_period": req.slow_period,
            "momentum_lookback": req.momentum_lookback,
            "momentum_threshold": req.momentum_threshold,
            "mean_reversion_lookback": req.mean_reversion_lookback,
            "mean_reversion_std_dev": req.mean_reversion_std_dev,
            "transaction_cost_pct": req.transaction_cost * 100.0,
            "slippage_pct": req.slippage * 100.0,
            "position_size_pct": req.position_size * 100.0,
        },
        metrics=metrics,
        equity_curve=equity_curve,
        trades=trades,
        strategy_dna=dna
    )

def run_all_strategies_comparison(
    symbol: str, df: pd.DataFrame, risk_free_rate: float = 0.04
) -> List[BenchmarkComparisonRow]:
    """Runs all 4 quantitative strategies plus Buy & Hold on the same data and returns comparison."""
    strats = [
        ("sma_crossover", "SMA Crossover (20/50)", 20, 50),
        ("ema_crossover", "EMA Crossover (20/50)", 20, 50),
        ("momentum", "Momentum (20D)", 20, 0),
        ("mean_reversion", "Mean Reversion (20D, 1.5σ)", 20, 0),
        ("buy_and_hold", "Buy & Hold Benchmark", 0, 0),
    ]
    results: List[BenchmarkComparisonRow] = []
    for key, name, fast, slow in strats:
        req = BacktestRequest(
            symbol=symbol,
            strategy=key,
            fast_period=fast,
            slow_period=slow,
            risk_free_rate=risk_free_rate
        )
        bt = run_backtest_simulation(req, df)
        m = bt.metrics
        results.append(BenchmarkComparisonRow(
            strategy_key=key,
            strategy_name=name,
            total_return_pct=m.total_return_pct,
            cagr_pct=m.cagr_pct,
            sharpe_ratio=m.sharpe_ratio,
            volatility_pct=m.annual_volatility_pct,
            max_drawdown_pct=m.max_drawdown_pct,
            win_rate_pct=m.win_rate_pct,
            total_trades=m.total_trades,
            profit_factor=m.profit_factor
        ))
    return results
