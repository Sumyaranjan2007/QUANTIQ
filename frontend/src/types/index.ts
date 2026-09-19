export interface AssetInfo {
  symbol: string;
  name: string;
  category: string;
  currency: string;
  currency_symbol: string;
  base_price: number;
  current_price: number;
  daily_change_pct: number;
  total_return_pct: number;
  annualized_volatility_pct: number;
  description: string;
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetHistoryResponse {
  symbol: string;
  name: string;
  currency: string;
  currency_symbol: string;
  count: number;
  data: HistoricalBar[];
}

export interface IndicatorPoint {
  date: string;
  close: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema20?: number;
  ema50?: number;
  daily_return?: number;
  cumulative_return?: number;
  log_return?: number;
  rolling_volatility?: number;
  rolling_sharpe?: number;
}

export interface AnalysisResponse {
  symbol: string;
  start_date: string;
  end_date: string;
  current_price: number;
  daily_return_pct: number;
  annual_return_pct: number;
  annual_volatility_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema20: number;
  ema50: number;
  series: IndicatorPoint[];
}

export interface Trade {
  id: number;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  position_type: string;
  shares: number;
  gross_return_pct: number;
  net_return_pct: number;
  profit_loss: number;
  holding_days: number;
  exit_reason: string;
}

export interface EquityPoint {
  date: string;
  close: number;
  strategy_equity: number;
  benchmark_equity: number;
  strategy_return_pct: number;
  benchmark_return_pct: number;
  drawdown_pct: number;
  benchmark_drawdown_pct: number;
  signal: number;
  position: number;
}

export interface BacktestMetrics {
  initial_capital: number;
  final_capital: number;
  total_return_pct: number;
  benchmark_return_pct: number;
  cagr_pct: number;
  benchmark_cagr_pct: number;
  sharpe_ratio: number;
  benchmark_sharpe: number;
  sortino_ratio: number;
  max_drawdown_pct: number;
  benchmark_max_drawdown_pct: number;
  annual_volatility_pct: number;
  benchmark_volatility_pct: number;
  win_rate_pct: number;
  profit_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  avg_trade_return_pct: number;
  avg_holding_period_days: number;
  total_transaction_costs: number;
  total_slippage_cost: number;
}

export interface StrategyDNA {
  trading_frequency: number;
  trend_sensitivity: number;
  volatility_sensitivity: number;
  drawdown_resilience: number;
  holding_duration: number;
  signal_precision: number;
}

export interface BacktestResponse {
  symbol: string;
  strategy: string;
  strategy_name: string;
  parameters: Record<string, any>;
  metrics: BacktestMetrics;
  equity_curve: EquityPoint[];
  trades: Trade[];
  strategy_dna: StrategyDNA;
}

export interface BenchmarkComparisonRow {
  strategy_key: string;
  strategy_name: string;
  total_return_pct: number;
  cagr_pct: number;
  sharpe_ratio: number;
  volatility_pct: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  total_trades: number;
  profit_factor: number;
}

export interface RiskDrawdownPoint {
  date: string;
  drawdown_pct: number;
  underwater_duration_days: number;
  rolling_volatility_pct: number;
}

export interface RiskResponse {
  symbol: string;
  annualized_volatility_pct: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown_pct: number;
  var_95_pct: number;
  var_99_pct: number;
  expected_shortfall_95_pct: number;
  expected_shortfall_99_pct: number;
  current_drawdown_pct: number;
  risk_level: string;
  risk_summary_text: string;
  timeline: RiskDrawdownPoint[];
}

export interface CorrelationResponse {
  symbols: string[];
  matrix: Record<string, Record<string, number>>;
  insight_text: string;
  highest_pair: {
    pair: string;
    asset1?: string;
    asset2?: string;
    correlation: number;
  };
  lowest_pair: {
    pair: string;
    asset1?: string;
    asset2?: string;
    correlation: number;
  };
}

export interface PortfolioPoint {
  date: string;
  portfolio_equity: number;
  portfolio_return_pct: number;
  drawdown_pct: number;
}

export interface AssetContribution {
  symbol: string;
  name: string;
  weight_pct: number;
  individual_return_pct: number;
  individual_volatility_pct: number;
  weighted_contribution_pct: number;
}

export interface PortfolioResponse {
  initial_capital: number;
  final_capital: number;
  portfolio_return_pct: number;
  portfolio_cagr_pct: number;
  portfolio_volatility_pct: number;
  portfolio_sharpe: number;
  portfolio_sortino: number;
  max_drawdown_pct: number;
  equity_curve: PortfolioPoint[];
  contributions: AssetContribution[];
  rebalance_frequency: string;
}

export interface RegimeTimelinePoint {
  date: string;
  close: number;
  regime: string;
  color: string;
  volatility_percentile: number;
}

export interface RegimePerformance {
  regime: string;
  days_count: number;
  share_of_time_pct: number;
  average_daily_return_pct: number;
  annualized_return_pct: number;
  annualized_volatility_pct: number;
  max_drawdown_pct: number;
}

export interface RegimeResponse {
  symbol: string;
  current_regime: string;
  timeline: RegimeTimelinePoint[];
  performances: RegimePerformance[];
  explanation: string;
}

export interface AttributionResponse {
  event_type: string;
  event_title: string;
  date: string;
  symbol: string;
  price_level: number;
  price_change_pct: number;
  rolling_volatility_pct: number;
  market_regime: string;
  strategy_signal: string;
  strategy_position: string;
  drawdown_at_moment_pct: number;
  fast_indicator_value: number;
  slow_indicator_value: number;
  narrative_explanation: string;
  key_drivers: string[];
}

export interface AIInsightsSummary {
  symbol: string;
  strategy: string;
  performance_summary: string;
  risk_summary: string;
  strategy_behavior: string;
  market_regime: string;
  key_observations: string[];
  provider: string;
}

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  active_agents?: string[];
  critic_confidence?: string;
}
