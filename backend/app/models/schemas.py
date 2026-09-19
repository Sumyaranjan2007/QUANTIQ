from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class AssetInfo(BaseModel):
    symbol: str
    name: str
    category: str
    currency: str
    currency_symbol: str
    base_price: float
    current_price: float
    daily_change_pct: float
    total_return_pct: float
    annualized_volatility_pct: float
    description: str

class HistoricalBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class AssetHistoryResponse(BaseModel):
    symbol: str
    name: str
    currency: str
    currency_symbol: str
    count: int
    data: List[HistoricalBar]

class AnalysisRequest(BaseModel):
    symbol: str = "BTC"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    risk_free_rate: float = 0.04

class IndicatorPoint(BaseModel):
    date: str
    close: float
    sma20: Optional[float] = None
    sma50: Optional[float] = None
    sma200: Optional[float] = None
    ema20: Optional[float] = None
    ema50: Optional[float] = None
    daily_return: Optional[float] = None
    cumulative_return: Optional[float] = None
    log_return: Optional[float] = None
    rolling_volatility: Optional[float] = None
    rolling_sharpe: Optional[float] = None

class AnalysisResponse(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    current_price: float
    daily_return_pct: float
    annual_return_pct: float
    annual_volatility_pct: float
    sharpe_ratio: float
    max_drawdown_pct: float
    sma20: float
    sma50: float
    sma200: float
    ema20: float
    ema50: float
    series: List[IndicatorPoint]

class BacktestRequest(BaseModel):
    symbol: str = "BTC"
    strategy: str = "sma_crossover"  # sma_crossover, ema_crossover, momentum, mean_reversion
    initial_capital: float = 100000.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    fast_period: int = 20
    slow_period: int = 50
    momentum_lookback: int = 20
    momentum_threshold: float = 0.02
    mean_reversion_lookback: int = 20
    mean_reversion_std_dev: float = 1.5
    transaction_cost: float = 0.0010  # 0.10%
    slippage: float = 0.0005          # 0.05%
    position_size: float = 1.0        # 100%
    risk_free_rate: float = 0.04

class Trade(BaseModel):
    id: int
    entry_date: str
    exit_date: str
    entry_price: float
    exit_price: float
    position_type: str = "LONG"
    shares: float
    gross_return_pct: float
    net_return_pct: float
    profit_loss: float
    holding_days: int
    exit_reason: str

class EquityPoint(BaseModel):
    date: str
    close: float
    strategy_equity: float
    benchmark_equity: float
    strategy_return_pct: float
    benchmark_return_pct: float
    drawdown_pct: float
    benchmark_drawdown_pct: float
    signal: int = 0
    position: int = 0

class BacktestMetrics(BaseModel):
    initial_capital: float
    final_capital: float
    total_return_pct: float
    benchmark_return_pct: float
    cagr_pct: float
    benchmark_cagr_pct: float
    sharpe_ratio: float
    benchmark_sharpe: float
    sortino_ratio: float
    max_drawdown_pct: float
    benchmark_max_drawdown_pct: float
    annual_volatility_pct: float
    benchmark_volatility_pct: float
    win_rate_pct: float
    profit_factor: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    avg_trade_return_pct: float
    avg_holding_period_days: float
    total_transaction_costs: float
    total_slippage_cost: float

class StrategyDNA(BaseModel):
    trading_frequency: float     # 0-100 score
    trend_sensitivity: float     # 0-100 score
    volatility_sensitivity: float# 0-100 score
    drawdown_resilience: float   # 0-100 score
    holding_duration: float      # 0-100 score
    signal_precision: float      # 0-100 score

class BacktestResponse(BaseModel):
    symbol: str
    strategy: str
    strategy_name: str
    parameters: Dict[str, Any]
    metrics: BacktestMetrics
    equity_curve: List[EquityPoint]
    trades: List[Trade]
    strategy_dna: StrategyDNA

class BenchmarkComparisonRow(BaseModel):
    strategy_key: str
    strategy_name: str
    total_return_pct: float
    cagr_pct: float
    sharpe_ratio: float
    volatility_pct: float
    max_drawdown_pct: float
    win_rate_pct: float
    total_trades: int
    profit_factor: float

class RiskRequest(BaseModel):
    symbol: str = "BTC"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    confidence_level: float = 0.95
    risk_free_rate: float = 0.04

class RiskDrawdownPoint(BaseModel):
    date: str
    drawdown_pct: float
    underwater_duration_days: int
    rolling_volatility_pct: float

class RiskResponse(BaseModel):
    symbol: str
    annualized_volatility_pct: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown_pct: float
    var_95_pct: float
    var_99_pct: float
    expected_shortfall_95_pct: float
    expected_shortfall_99_pct: float
    current_drawdown_pct: float
    risk_level: str  # "Low Risk", "Moderate Risk", "High Risk"
    risk_summary_text: str
    timeline: List[RiskDrawdownPoint]

class CorrelationRequest(BaseModel):
    symbols: List[str] = ["XAU", "BTC", "NVDA", "^NSEI"]
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class CorrelationResponse(BaseModel):
    symbols: List[str]
    matrix: Dict[str, Dict[str, float]]
    insight_text: str
    highest_pair: Dict[str, Any]
    lowest_pair: Dict[str, Any]

class PortfolioAllocation(BaseModel):
    symbol: str
    weight: float  # e.g. 0.25

class PortfolioRequest(BaseModel):
    allocations: List[PortfolioAllocation]
    initial_capital: float = 100000.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    risk_free_rate: float = 0.04

class PortfolioPoint(BaseModel):
    date: str
    portfolio_equity: float
    portfolio_return_pct: float
    drawdown_pct: float

class AssetContribution(BaseModel):
    symbol: str
    name: str
    weight_pct: float
    individual_return_pct: float
    individual_volatility_pct: float
    weighted_contribution_pct: float

class PortfolioResponse(BaseModel):
    initial_capital: float
    final_capital: float
    portfolio_return_pct: float
    portfolio_cagr_pct: float
    portfolio_volatility_pct: float
    portfolio_sharpe: float
    portfolio_sortino: float
    max_drawdown_pct: float
    equity_curve: List[PortfolioPoint]
    contributions: List[AssetContribution]
    rebalance_frequency: str = "Buy & Hold Initial Allocation"

class RegimeTimelinePoint(BaseModel):
    date: str
    close: float
    regime: str  # "Bull", "Bear", "Sideways", "High Volatility"
    color: str
    volatility_percentile: float

class RegimePerformance(BaseModel):
    regime: str
    days_count: int
    share_of_time_pct: float
    average_daily_return_pct: float
    annualized_return_pct: float
    annualized_volatility_pct: float
    max_drawdown_pct: float

class RegimeRequest(BaseModel):
    symbol: str = "BTC"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class RegimeResponse(BaseModel):
    symbol: str
    current_regime: str
    timeline: List[RegimeTimelinePoint]
    performances: List[RegimePerformance]
    explanation: str

class AttributionRequest(BaseModel):
    symbol: str = "BTC"
    strategy: str = "sma_crossover"
    event_type: str = "max_drawdown"  # max_drawdown, biggest_gain, biggest_loss, volatility_spike, regime_flip
    target_date: Optional[str] = None

class AttributionResponse(BaseModel):
    event_type: str
    event_title: str
    date: str
    symbol: str
    price_level: float
    price_change_pct: float
    rolling_volatility_pct: float
    market_regime: str
    strategy_signal: str
    strategy_position: str
    drawdown_at_moment_pct: float
    fast_indicator_value: float
    slow_indicator_value: float
    narrative_explanation: str
    key_drivers: List[str]

class AIChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AIChatRequest(BaseModel):
    messages: List[AIChatMessage]
    context: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    message: str
    provider: str  # "deterministic_engine", "gemini", or "groq"
    confidence: float
