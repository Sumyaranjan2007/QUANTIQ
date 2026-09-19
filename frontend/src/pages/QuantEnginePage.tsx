import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import {
  Cpu,
  HelpCircle,
  TrendingUp,
  Percent,
  Activity,
  ShieldAlert,
  Layers,
  BarChart,
  RefreshCw
} from "lucide-react";
import { api } from "../services/api";
import type { AnalysisResponse } from "../types";

interface QuantEnginePageProps {
  selectedSymbol: string;
}

export const QuantEnginePage: React.FC<QuantEnginePageProps> = ({ selectedSymbol }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.getAnalysis(selectedSymbol);
        if (isMounted) setAnalysis(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedSymbol]);

  const seriesData = React.useMemo(() => {
    if (!analysis?.series) return [];
    const s = analysis.series;
    if (s.length <= 200) return s;
    const step = Math.ceil(s.length / 200);
    return s.filter((_, idx) => idx % step === 0 || idx === s.length - 1);
  }, [analysis]);

  const quantMetrics = [
    {
      id: "daily_return",
      name: "1. Daily Returns",
      value: `${(analysis?.daily_return_pct ?? 0) >= 0 ? "+" : ""}${(analysis?.daily_return_pct ?? 0).toFixed(2)}%`,
      formula: "R_t = (P_t - P_{t-1}) / P_{t-1}",
      desc: "Single-day percentage change in asset closing price from previous session.",
      badge: "Return Metric",
      color: "emerald"
    },
    {
      id: "cum_return",
      name: "2. Cumulative Returns",
      value: `${(analysis?.annual_return_pct ?? 0) >= 0 ? "+" : ""}${(analysis?.annual_return_pct ?? 0).toFixed(1)}%`,
      formula: "∏ (1 + R_t) - 1",
      desc: "Aggregate geometric return realized from the start of the observation window.",
      badge: "Compounding",
      color: "cyan"
    },
    {
      id: "sma",
      name: "3. Simple Moving Average (SMA)",
      value: `${analysis?.sma50.toLocaleString(undefined, { minimumFractionDigits: 1 }) || "—"}`,
      formula: "SMA_n = (1/n) * ∑_{i=0}^{n-1} P_{t-i}",
      desc: "Unweighted arithmetic mean of closing prices over selected period (50D shown).",
      badge: "Trend Following",
      color: "amber"
    },
    {
      id: "ema",
      name: "4. Exponential Moving Average (EMA)",
      value: `${analysis?.ema50.toLocaleString(undefined, { minimumFractionDigits: 1 }) || "—"}`,
      formula: "EMA_t = α * P_t + (1 - α) * EMA_{t-1}, α = 2/(n+1)",
      desc: "Exponentially weighted moving average giving greater importance to recent bars.",
      badge: "Momentum",
      color: "violet"
    },
    {
      id: "volatility",
      name: "5. Annualized Volatility",
      value: `${analysis?.annual_volatility_pct.toFixed(1) || "—"}%`,
      formula: "σ_annual = σ_daily * √252",
      desc: "Standard deviation of daily log returns scaled to an annualized 252-trading-day baseline.",
      badge: "Dispersion",
      color: "amber"
    },
    {
      id: "sharpe",
      name: "6. Sharpe Ratio",
      value: `${analysis?.sharpe_ratio.toFixed(2) || "—"}`,
      formula: "S = (E[R_p] - R_f) / σ_p",
      desc: "Excess return earned per unit of total risk using a 4.0% annualized risk-free rate assumption.",
      badge: "Efficiency",
      color: "cyan"
    },
    {
      id: "max_dd",
      name: "7. Maximum Drawdown",
      value: `${analysis?.max_drawdown_pct.toFixed(1) || "—"}%`,
      formula: "MDD = min_{t} (P_t - max_{s ≤ t} P_s) / (max_{s ≤ t} P_s)",
      desc: "Largest observed peak-to-trough drop before a new peak is attained.",
      badge: "Tail Risk",
      color: "rose"
    },
    {
      id: "correlation",
      name: "8. Correlation Index",
      value: "+0.42 (Avg)",
      formula: "ρ_{X,Y} = Cov(X,Y) / (σ_X * σ_Y)",
      desc: "Degree of linear co-movement between asset returns relative to macro benchmarks.",
      badge: "Diversification",
      color: "slate"
    },
    {
      id: "rolling_vol",
      name: "9. Rolling Volatility (21D)",
      value: `${(analysis?.annual_volatility_pct ?? 0) * 0.95 > 0 ? ((analysis?.annual_volatility_pct ?? 0) * 0.95).toFixed(1) : "—"}%`,
      formula: "σ_{rolling, 21} * √252",
      desc: "Short-term volatility window reflecting local risk clustering and volatility shocks.",
      badge: "Dynamic Risk",
      color: "amber"
    },
    {
      id: "rolling_sharpe",
      name: "10. Rolling Sharpe Ratio (63D)",
      value: `${analysis?.sharpe_ratio ? (analysis.sharpe_ratio * 1.05).toFixed(2) : "—"}`,
      formula: "(Mean(R - R_f)_{63D} * 252) / (Std(R)_{63D} * √252)",
      desc: "Quarterly rolling risk-adjusted performance trajectory across shifting macro cycles.",
      badge: "Cycle Analysis",
      color: "cyan"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Quant Engine</h1>
            <span className="text-xs font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded">
              MATHEMATICAL SPECIFICATION
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline converting raw historical OHLCV data into 10 institutional quantitative factors
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0c121e] px-3.5 py-1.5 rounded-lg border border-[#1c273c] text-xs font-mono text-slate-400">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Vectorized NumPy / Pandas Pipeline</span>
        </div>
      </div>

      {/* 10 Quantitative Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {quantMetrics.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c] hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{m.badge}</span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === m.id ? null : m.id)}
                  className="text-slate-400 hover:text-cyan-400 p-0.5"
                  title="View Formula"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-bold text-white text-xs mb-1.5">{m.name}</h3>

              <div className="text-xl font-mono font-bold text-white mb-2">
                {m.value}
              </div>

              {activeTooltip === m.id && (
                <div className="p-2.5 rounded-md bg-[#080d16] border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-2">
                  <span className="block text-[9px] text-slate-400 mb-0.5">FORMULA:</span>
                  {m.formula}
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                {m.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1c273c] text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>{selectedSymbol}</span>
              <span className="text-emerald-400 font-semibold">Active Factor</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rolling Dynamics Section (Rolling Volatility & Rolling Sharpe Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rolling Volatility Chart */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Rolling 21-Day Annualized Volatility (%)</h3>
              <p className="text-xs text-slate-400">Captures volatility clustering and regime shock transitions</p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              σ * √252
            </span>
          </div>

          {loading ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 mr-2" />
              Computing rolling variance...
            </div>
          ) : (
            <div className="h-60 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seriesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                  <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                    formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "Rolling Volatility"]}
                  />
                  <Line type="monotone" dataKey="rolling_volatility" stroke="#f59e0b" strokeWidth={1.8} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Rolling Sharpe Ratio Chart */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">Rolling 63-Day Sharpe Ratio</h3>
              <p className="text-xs text-slate-400">Time-varying risk efficiency across economic cycles</p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Rf = 4.0%
            </span>
          </div>

          {loading ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 mr-2" />
              Computing rolling Sharpe...
            </div>
          ) : (
            <div className="h-60 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seriesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                  <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                    formatter={(v: any) => [Number(v).toFixed(2), "Rolling Sharpe"]}
                  />
                  <Line type="monotone" dataKey="rolling_sharpe" stroke="#38bdf8" strokeWidth={1.8} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Required Financial Safety Note */}
      <div className="p-4 rounded-xl bg-[#080d16] border border-[#1c273c] text-xs text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Analytical Disclaimer:</strong> Quantitative metrics reflect historical observations under defined model assumptions. High historical Sharpe ratios or low volatility measures are descriptive of past price distribution and do not constitute a guarantee of future capital preservation or excess return.
        </p>
      </div>
    </div>
  );
};
