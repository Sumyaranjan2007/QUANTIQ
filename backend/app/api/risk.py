from fastapi import APIRouter, HTTPException
from app.models.schemas import RiskRequest, RiskResponse
from app.services.market_data import get_market_data_provider
from app.services.risk_engine import calculate_risk_analytics

router = APIRouter(prefix="/api/risk", tags=["Risk"])

@router.post("", response_model=RiskResponse)
def get_risk_metrics(req: RiskRequest):
    """
    Compute institutional risk metrics including Historical VaR (95%/99%),
    Expected Shortfall (CVaR), Sortino Ratio, Drawdown Duration, and Risk Classification.
    """
    provider = get_market_data_provider()
    df = provider.get_historical_data(req.symbol.upper(), req.start_date, req.end_date)
    if df.empty or len(df) < 20:
        raise HTTPException(status_code=400, detail="Insufficient bars for risk evaluation.")
        
    try:
        return calculate_risk_analytics(req, df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
