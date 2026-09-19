from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.models.schemas import AIChatRequest, AIChatResponse
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Quant"])

@router.post("/insights")
def get_ai_insights(payload: Dict[str, Any] = Body(...)):
    """
    Generate structured, multi-section quantitative insight reports
    analyzing return profile, risk characteristics, strategy behavior, and regime context.
    """
    service = get_ai_service()
    return service.generate_insights_summary(payload)

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(req: AIChatRequest):
    """
    Interactive quantitative conversational assistant. Analyzes the current dashboard state
    and answers questions regarding drawdowns, volatility, strategy comparisons, or correlation.
    """
    service = get_ai_service()
    return service.answer_chat_query(req)
