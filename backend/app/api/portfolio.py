from fastapi import APIRouter, HTTPException
from app.models.schemas import PortfolioRequest, PortfolioResponse
from app.services.portfolio_engine import calculate_portfolio_simulation

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

@router.post("", response_model=PortfolioResponse)
def simulate_portfolio(req: PortfolioRequest):
    """
    Simulate user-defined multi-asset portfolio weights and compute aggregate
    portfolio CAGR, volatility, Sharpe, Sortino, max drawdown, and asset return contributions.
    """
    try:
        return calculate_portfolio_simulation(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
