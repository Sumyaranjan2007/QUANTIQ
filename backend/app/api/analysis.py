from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services.market_data import get_market_data_provider
from app.services.indicators import calculate_technical_indicators

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

@router.post("", response_model=AnalysisResponse)
def analyze_asset(req: AnalysisRequest):
    """
    Calculate quantitative technical indicators (SMA20, SMA50, SMA200, EMA20, EMA50,
    daily/cumulative/log returns, rolling volatility, rolling Sharpe, and max drawdown).
    """
    provider = get_market_data_provider()
    df = provider.get_historical_data(req.symbol.upper(), req.start_date, req.end_date)
    if df.empty or len(df) < 5:
        raise HTTPException(status_code=400, detail="Insufficient historical data for analysis.")
        
    calc_res = calculate_technical_indicators(df, risk_free_rate=req.risk_free_rate)
    summary = calc_res["summary"]
    series = calc_res["series"]
    
    start_dt = str(df["date"].iloc[0])
    end_dt = str(df["date"].iloc[-1])
    
    return AnalysisResponse(
        symbol=req.symbol.upper(),
        start_date=start_dt,
        end_date=end_dt,
        current_price=summary["current_price"],
        daily_return_pct=summary["daily_return_pct"],
        annual_return_pct=summary["annual_return_pct"],
        annual_volatility_pct=summary["annual_volatility_pct"],
        sharpe_ratio=summary["sharpe_ratio"],
        max_drawdown_pct=summary["max_drawdown_pct"],
        sma20=summary["sma20"],
        sma50=summary["sma50"],
        sma200=summary["sma200"],
        ema20=summary["ema20"],
        ema50=summary["ema50"],
        series=series
    )
