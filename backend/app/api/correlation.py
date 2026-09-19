from fastapi import APIRouter, HTTPException
from app.models.schemas import CorrelationRequest, CorrelationResponse
from app.services.correlation_engine import calculate_correlation_matrix

router = APIRouter(prefix="/api/correlation", tags=["Correlation"])

@router.post("", response_model=CorrelationResponse)
def get_correlation_matrix(req: CorrelationRequest):
    """
    Calculate multi-asset Pearson correlation matrix and generate dynamic narrative insight.
    """
    try:
        return calculate_correlation_matrix(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
