import type {
  AssetInfo,
  AssetHistoryResponse,
  AnalysisResponse,
  BacktestResponse,
  BenchmarkComparisonRow,
  RiskResponse,
  CorrelationResponse,
  PortfolioResponse,
  RegimeResponse,
  AttributionResponse,
  AIInsightsSummary,
  AIChatMessage
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; service: string; market_data_mode: string }>("/api/health"),

  // Assets
  getAssets: () => request<AssetInfo[]>("/api/assets"),
  getAsset: (symbol: string) => request<AssetInfo>(`/api/assets/${symbol}`),
  getAssetHistory: (symbol: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    return request<AssetHistoryResponse>(`/api/assets/${symbol}/history?${params.toString()}`);
  },

  // Analysis & Quant Engine
  getAnalysis: (symbol: string, startDate?: string, endDate?: string, riskFreeRate: number = 0.04) =>
    request<AnalysisResponse>("/api/analysis", {
      method: "POST",
      body: JSON.stringify({ symbol, start_date: startDate, end_date: endDate, risk_free_rate: riskFreeRate })
    }),

  // Backtest
  runBacktest: (params: {
    symbol: string;
    strategy: string;
    initial_capital?: number;
    start_date?: string;
    end_date?: string;
    fast_period?: number;
    slow_period?: number;
    momentum_lookback?: number;
    momentum_threshold?: number;
    mean_reversion_lookback?: number;
    mean_reversion_std_dev?: number;
    transaction_cost?: number;
    slippage?: number;
    position_size?: number;
    risk_free_rate?: number;
  }) => request<BacktestResponse>("/api/backtest", {
    method: "POST",
    body: JSON.stringify(params)
  }),

  // Strategy Comparison
  compareStrategies: (symbol: string, startDate?: string, endDate?: string, riskFreeRate: number = 0.04) =>
    request<BenchmarkComparisonRow[]>("/api/backtest/compare", {
      method: "POST",
      body: JSON.stringify({ symbol, start_date: startDate, end_date: endDate, risk_free_rate: riskFreeRate })
    }),

  // Event Attribution ("Why Did This Happen?")
  getAttribution: (symbol: string, strategy: string, eventType: string, targetDate?: string) =>
    request<AttributionResponse>("/api/backtest/attribution", {
      method: "POST",
      body: JSON.stringify({ symbol, strategy, event_type: eventType, target_date: targetDate })
    }),

  // Risk Engine
  getRiskAnalysis: (symbol: string, startDate?: string, endDate?: string, riskFreeRate: number = 0.04) =>
    request<RiskResponse>("/api/risk", {
      method: "POST",
      body: JSON.stringify({ symbol, start_date: startDate, end_date: endDate, risk_free_rate: riskFreeRate })
    }),

  // Correlation Matrix
  getCorrelation: (symbols: string[], startDate?: string, endDate?: string) =>
    request<CorrelationResponse>("/api/correlation", {
      method: "POST",
      body: JSON.stringify({ symbols, start_date: startDate, end_date: endDate })
    }),

  // Portfolio Lab
  simulatePortfolio: (allocations: { symbol: string; weight: number }[], initialCapital: number = 100000, startDate?: string, endDate?: string, riskFreeRate: number = 0.04) =>
    request<PortfolioResponse>("/api/portfolio", {
      method: "POST",
      body: JSON.stringify({ allocations, initial_capital: initialCapital, start_date: startDate, end_date: endDate, risk_free_rate: riskFreeRate })
    }),

  // Market Regimes
  getRegimeAnalysis: (symbol: string, startDate?: string, endDate?: string) =>
    request<RegimeResponse>("/api/regime", {
      method: "POST",
      body: JSON.stringify({ symbol, start_date: startDate, end_date: endDate })
    }),

  // AI Insights
  getAIInsights: (context: Record<string, any>) =>
    request<AIInsightsSummary>("/api/ai/insights", {
      method: "POST",
      body: JSON.stringify(context)
    }),

  // AI Chat
  sendAIChat: (messages: AIChatMessage[], context?: Record<string, any>) =>
    request<{ message: string; provider: string; confidence: number }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages, context })
    })
};
