import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from app.api.assets import router as assets_router
from app.api.analysis import router as analysis_router
from app.api.backtest import router as backtest_router
from app.api.risk import router as risk_router
from app.api.correlation import router as correlation_router
from app.api.portfolio import router as portfolio_router
from app.api.regime import router as regime_router
from app.api.ai import router as ai_router

app = FastAPI(
    title="QUANTIQ API",
    description="Quantitative Multi-Asset Financial Intelligence & Backtesting Platform Engine",
    version="1.0.0"
)

# CORS configuration
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler to return clean JSON errors rather than raw stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "status": "error"}
    )

# Include Routers
app.include_router(assets_router)
app.include_router(analysis_router)
app.include_router(backtest_router)
app.include_router(risk_router)
app.include_router(correlation_router)
app.include_router(portfolio_router)
app.include_router(regime_router)
app.include_router(ai_router)

@app.get("/api/health")
def health_check():
    provider_mode = os.getenv("MARKET_DATA_PROVIDER", "demo")
    ai_provider = os.getenv("AI_PROVIDER", "deterministic")
    return {
        "status": "healthy",
        "service": "QUANTIQ Quantitative Engine",
        "version": "1.0.0",
        "market_data_mode": provider_mode,
        "ai_engine": "Gemini/Groq" if os.getenv("GEMINI_API_KEY") or os.getenv("GROQ_API_KEY") else "Deterministic Quantitative Fallback"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
