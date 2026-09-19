from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import (
    BacktestRequest, BacktestResponse, BenchmarkComparisonRow,
    AttributionRequest, AttributionResponse
)
from app.services.market_data import get_market_data_provider
from app.services.backtest_engine import run_backtest_simulation, run_all_strategies_comparison
from app.services.attribution_engine import analyze_event_attribution

router = APIRouter(prefix="/api/backtest", tags=["Backtest"])

@router.post("", response_model=BacktestResponse)
def execute_backtest(req: BacktestRequest):
    """
    Simulate quantitative strategy execution without lookahead bias,
    incorporating transaction fees and slippage friction.
    """
    provider = get_market_data_provider()
    df = provider.get_historical_data(req.symbol.upper(), req.start_date, req.end_date)
    if df.empty or len(df) < 30:
        raise HTTPException(status_code=400, detail="Insufficient bars to execute backtest (minimum 30 required).")
        
    try:
        response = run_backtest_simulation(req, df)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare", response_model=List[BenchmarkComparisonRow])
def compare_strategies(req: BacktestRequest):
    """
    Run all 4 strategies (SMA Crossover, EMA Crossover, Momentum, Mean Reversion)
    and Buy & Hold benchmark across identical data for side-by-side evaluation.
    """
    provider = get_market_data_provider()
    df = provider.get_historical_data(req.symbol.upper(), req.start_date, req.end_date)
    if df.empty or len(df) < 30:
        raise HTTPException(status_code=400, detail="Insufficient bars to run strategy comparison.")
        
    try:
        comparison = run_all_strategies_comparison(req.symbol.upper(), df, req.risk_free_rate)
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/attribution", response_model=AttributionResponse)
def get_event_attribution(req: AttributionRequest):
    """
    'WHY DID THIS HAPPEN?' contextual forensic explanation engine.
    Analyzes specific historical anomalies (drawdown, gain spike, regime shift).
    """
    try:
        return analyze_event_attribution(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
