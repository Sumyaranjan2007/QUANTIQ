import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.models.schemas import (
    PortfolioRequest, PortfolioResponse, PortfolioPoint, AssetContribution
)
from app.services.market_data import get_market_data_provider

def calculate_portfolio_simulation(req: PortfolioRequest) -> PortfolioResponse:
    provider = get_market_data_provider()
    
    # 1. Validate weights
    total_weight = sum([a.weight for a in req.allocations])
    if abs(total_weight - 1.0) > 0.01 and abs(total_weight - 100.0) > 1.0:
        raise ValueError(f"Portfolio allocations must sum to 100% (current sum: {total_weight:.1f}%)")
        
    normalized_allocs = {}
    scale = 100.0 if total_weight > 2.0 else 1.0
    for a in req.allocations:
        normalized_allocs[a.symbol] = a.weight / scale

    # 2. Align daily returns across assets
    all_data = {}
    meta_names = {
        "XAU": "Gold",
        "BTC": "Bitcoin",
        "NVDA": "NVIDIA Corp",
        "^NSEI": "NIFTY 50"
    }
    
    for symbol, weight in normalized_allocs.items():
        if weight <= 0.0:
            continue
        df = provider.get_historical_data(symbol, req.start_date, req.end_date)
        if not df.empty:
            df = df.set_index("date")
            all_data[symbol] = df["close"]
            
    comb_prices = pd.DataFrame(all_data).dropna()
    if comb_prices.empty:
        raise ValueError("Insufficient overlapping historical data across selected portfolio assets.")
        
    # Normalized growth of each asset
    norm_growth = comb_prices / comb_prices.iloc[0]
    
    # Weighted portfolio value
    port_growth = pd.Series(0.0, index=norm_growth.index)
    contributions: List[AssetContribution] = []
    
    for symbol, weight in normalized_allocs.items():
        if symbol in norm_growth.columns:
            port_growth += norm_growth[symbol] * weight
            
            # Asset individual metrics
            asset_ret = float((norm_growth[symbol].iloc[-1] - 1.0) * 100.0)
            asset_daily_rets = comb_prices[symbol].pct_change().dropna()
            asset_vol = float(asset_daily_rets.std() * np.sqrt(252) * 100.0)
            weighted_contrib = float(asset_ret * weight)
            
            contributions.append(AssetContribution(
                symbol=symbol,
                name=meta_names.get(symbol, symbol),
                weight_pct=round(weight * 100.0, 1),
                individual_return_pct=round(asset_ret, 2),
                individual_volatility_pct=round(asset_vol, 2),
                weighted_contribution_pct=round(weighted_contrib, 2)
            ))
            
    initial_cap = req.initial_capital
    portfolio_equity = port_growth * initial_cap
    final_cap = float(portfolio_equity.iloc[-1])
    tot_return = ((final_cap - initial_cap) / initial_cap) * 100.0
    
    n_days = len(portfolio_equity)
    years = max(n_days / 252.0, 0.05)
    cagr = ((final_cap / initial_cap) ** (1.0 / years) - 1.0) * 100.0
    
    port_daily_rets = portfolio_equity.pct_change().fillna(0.0)
    port_vol = float(port_daily_rets.std() * np.sqrt(252) * 100.0)
    
    rf_daily = req.risk_free_rate / 252.0
    mean_excess = (port_daily_rets.mean() - rf_daily)
    port_sharpe = float((mean_excess / (port_daily_rets.std() or 1e-6)) * np.sqrt(252))
    
    neg_rets = port_daily_rets[port_daily_rets < 0]
    downside_dev = float(neg_rets.std() * np.sqrt(252)) if len(neg_rets) > 1 else 1e-6
    port_sortino = float(((cagr / 100.0) - req.risk_free_rate) / (downside_dev or 1e-6))
    
    cum_max = portfolio_equity.cummax()
    dd_series = (portfolio_equity - cum_max) / cum_max
    max_dd = float(dd_series.min() * 100.0)
    
    points: List[PortfolioPoint] = []
    for date_val, eq_val in portfolio_equity.items():
        r = ((eq_val - initial_cap) / initial_cap) * 100.0
        dd_val = float(dd_series.loc[date_val]) * 100.0
        points.append(PortfolioPoint(
            date=str(date_val),
            portfolio_equity=round(float(eq_val), 2),
            portfolio_return_pct=round(r, 2),
            drawdown_pct=round(dd_val, 2)
        ))
        
    return PortfolioResponse(
        initial_capital=round(initial_cap, 2),
        final_capital=round(final_cap, 2),
        portfolio_return_pct=round(tot_return, 2),
        portfolio_cagr_pct=round(cagr, 2),
        portfolio_volatility_pct=round(port_vol, 2),
        portfolio_sharpe=round(port_sharpe, 2),
        portfolio_sortino=round(port_sortino, 2),
        max_drawdown_pct=round(max_dd, 2),
        equity_curve=points,
        contributions=contributions,
        rebalance_frequency="Static Initial Allocation (Buy & Hold)"
    )
