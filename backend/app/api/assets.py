from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import AssetInfo, AssetHistoryResponse, HistoricalBar
from app.services.market_data import get_market_data_provider

router = APIRouter(prefix="/api/assets", tags=["Assets"])

@router.get("", response_model=List[AssetInfo])
def list_assets():
    """Retrieve list of available quantitative multi-asset instruments."""
    provider = get_market_data_provider()
    return provider.get_all_assets()

@router.get("/{symbol}", response_model=AssetInfo)
def get_asset(symbol: str):
    """Retrieve metadata and high-level KPIs for a single asset."""
    provider = get_market_data_provider()
    info = provider.get_asset_info(symbol.upper())
    if not info:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found.")
    return info

@router.get("/{symbol}/history", response_model=AssetHistoryResponse)
def get_asset_history(
    symbol: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Retrieve historical daily OHLCV bars for the selected asset."""
    provider = get_market_data_provider()
    info = provider.get_asset_info(symbol.upper())
    if not info:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found.")
        
    df = provider.get_historical_data(symbol.upper(), start_date, end_date)
    bars = [HistoricalBar(**row) for row in df.to_dict(orient="records")]
    
    return AssetHistoryResponse(
        symbol=info.symbol,
        name=info.name,
        currency=info.currency,
        currency_symbol=info.currency_symbol,
        count=len(bars),
        data=bars
    )
