from fastapi import APIRouter, HTTPException
from app.models.schemas import RegimeRequest, RegimeResponse
from app.services.market_data import get_market_data_provider
from app.services.regime_engine import classify_market_regimes

router = APIRouter(prefix="/api/regime", tags=["Market Regimes"])

@router.post("", response_model=RegimeResponse)
def get_regime_analysis(req: RegimeRequest):
    """
    Classify historical regimes into Bull, Bear, Sideways, and High Volatility,
    returning a timeline and regime-by-regime performance statistics.
    """
    provider = get_market_data_provider()
    df = provider.get_historical_data(req.symbol.upper(), req.start_date, req.end_date)
    if df.empty or len(df) < 50:
        raise HTTPException(status_code=400, detail="Insufficient bars for market regime detection.")
        
    try:
        return classify_market_regimes(req, df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
