import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  Activity,
  Percent,
  RefreshCw,
  Info
} from "lucide-react";
import { api } from "../services/api";
import type { RiskResponse } from "../types";

interface RiskAnalysisPageProps {
  selectedSymbol: string;
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({ selectedSymbol }) => {
  const [riskData, setRiskData] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getRiskAnalysis(selectedSymbol);
        if (isMounted) setRiskData(res);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load risk analysis.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedSymbol]);

  // Downsample timeline
  const timelineData = React.useMemo(() => {
    if (!riskData?.timeline) return [];
    const t = riskData.timeline;
    if (t.length <= 250) return t;
    const step = Math.ceil(t.length / 250);
    return t.filter((_, idx) => idx % step === 0 || idx === t.length - 1);
  }, [riskData]);

  const getRiskBadgeColor = (level: string) => {
    if (level === "Low Risk") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (level === "Moderate Risk") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Risk Analysis</h1>
            <span className="text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded">
              TAIL RISK & DRAWDOWN DECK
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Historical Value at Risk (VaR), Expected Shortfall, Sortino ratio, and underwater duration tracking
          </p>
        </div>

        {riskData && (
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${getRiskBadgeColor(riskData.risk_level)}`}>
            <ShieldAlert className="w-4 h-4" />
            <span>Classification: {riskData.risk_level.toUpperCase()}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Risk KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <span className="text-slate-400 text-xs block mb-1">Max Drawdown</span>
          <div className="text-xl font-mono font-bold text-rose-400">
            {riskData?.max_drawdown_pct.toFixed(1) || "—"}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Historical worst peak-to-trough</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <span className="text-slate-400 text-xs block mb-1">Annual Volatility</span>
          <div className="text-xl font-mono font-bold text-amber-300">
            {riskData?.annualized_volatility_pct.toFixed(1) || "—"}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">σ * √252</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <span className="text-slate-400 text-xs block mb-1">Historical VaR (95%)</span>
          <div className="text-xl font-mono font-bold text-cyan-400">
            {riskData?.var_95_pct.toFixed(2) || "—"}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">1-Day 95% Loss Threshold</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <span className="text-slate-400 text-xs block mb-1">Historical VaR (99%)</span>
          <div className="text-xl font-mono font-bold text-rose-400">
            {riskData?.var_99_pct.toFixed(2) || "—"}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">1-Day 99% Tail Threshold</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <span className="text-slate-400 text-xs block mb-1">Expected Shortfall (95%)</span>
          <div className="text-xl font-mono font-bold text-rose-300">
            {riskData?.expected_shortfall_95_pct.toFixed(2) || "—"}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Conditional VaR (CVaR)</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <span className="text-slate-400 text-xs block mb-1">Sortino Ratio</span>
          <div className="text-xl font-mono font-bold text-emerald-400">
            {riskData?.sortino_ratio.toFixed(2) || "—"}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Downside deviation penalizer</span>
        </div>
      </div>

      {/* Risk Summary Card */}
      {riskData && (
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Risk Environment Summary:</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getRiskBadgeColor(riskData.risk_level)}`}>
                {riskData.risk_level}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {riskData.risk_summary_text}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400 shrink-0">
            <div className="text-right">
              <span className="text-[10px] block text-slate-400">CURRENT DRAWDOWN</span>
              <span className={riskData.current_drawdown_pct < -0.1 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {riskData.current_drawdown_pct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Underwater Drawdown Chart */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Underwater Drawdown Curve (%)</h2>
            <p className="text-xs text-slate-400">Continuous peak-to-trough distance tracking capital recovery speed</p>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Worst Trough: {riskData?.max_drawdown_pct.toFixed(1)}%
          </span>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-rose-400 mr-2" />
            Computing drawdown history...
          </div>
        ) : (
          <div className="h-72 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} domain={["auto", 0]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                  formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "Drawdown"]}
                />
                <Area type="monotone" dataKey="drawdown_pct" stroke="#f43f5e" strokeWidth={1.8} fill="url(#drawdownGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Volatility Evolution Timeline */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Rolling Volatility Evolution (Annualized %)</h2>
            <p className="text-xs text-slate-400">Historical turbulence patterns and stress expansion periods</p>
          </div>
          <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            21-Day Window
          </span>
        </div>

        {loading ? (
          <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400 mr-2" />
            Computing volatility timeline...
          </div>
        ) : (
          <div className="h-60 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                  formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "Rolling Volatility"]}
                />
                <Line type="monotone" dataKey="rolling_volatility_pct" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
