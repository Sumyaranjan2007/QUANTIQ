import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { Sliders, RefreshCw, BarChart2 } from "lucide-react";
import { api } from "../services/api";
import type { AnalysisResponse } from "../types";

interface MarketAnalysisPageProps {
  selectedSymbol: string;
}

export const MarketAnalysisPage: React.FC<MarketAnalysisPageProps> = ({ selectedSymbol }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Indicator Visibility Toggles
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAnalysis(selectedSymbol);
        if (isMounted) setAnalysis(res);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load market analysis.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedSymbol]);

  // Downsample data points for smooth line rendering
  const seriesData = React.useMemo(() => {
    if (!analysis?.series) return [];
    const s = analysis.series;
    if (s.length <= 250) return s;
    const step = Math.ceil(s.length / 250);
    return s.filter((_, idx) => idx % step === 0 || idx === s.length - 1);
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Market Analysis</h1>
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded">
              {selectedSymbol} INDICATOR WORKBENCH
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dual-overlay technical moving averages, annualized return rates, and volatility trends
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 bg-[#0c121e] px-4 py-2 rounded-xl border border-[#1c273c] font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">DAILY RETURN</span>
            <span className={(analysis?.daily_return_pct ?? 0) >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {(analysis?.daily_return_pct ?? 0) >= 0 ? `+${analysis?.daily_return_pct.toFixed(2)}%` : `${analysis?.daily_return_pct.toFixed(2)}%`}
            </span>
          </div>
          <div className="h-6 w-px bg-[#1c273c]" />
          <div>
            <span className="text-slate-400 block text-[10px]">ANNUALIZED RETURN</span>
            <span className={(analysis?.annual_return_pct ?? 0) >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {(analysis?.annual_return_pct ?? 0) >= 0 ? `+${analysis?.annual_return_pct.toFixed(1)}%` : `${analysis?.annual_return_pct.toFixed(1)}%`}
            </span>
          </div>
          <div className="h-6 w-px bg-[#1c273c]" />
          <div>
            <span className="text-slate-400 block text-[10px]">ANNUAL VOLATILITY</span>
            <span className="text-amber-300 font-bold">{analysis?.annual_volatility_pct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Indicator Controls */}
      <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Toggle Technical Overlays:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all border ${
              showSMA20
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-[#080d16] text-slate-400 border-[#1c273c]"
            }`}
          >
            SMA 20 ({analysis?.sma20.toFixed(1) || "—"})
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all border ${
              showSMA50
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-[#080d16] text-slate-400 border-[#1c273c]"
            }`}
          >
            SMA 50 ({analysis?.sma50.toFixed(1) || "—"})
          </button>
          <button
            onClick={() => setShowSMA200(!showSMA200)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all border ${
              showSMA200
                ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                : "bg-[#080d16] text-slate-400 border-[#1c273c]"
            }`}
          >
            SMA 200 ({analysis?.sma200.toFixed(1) || "—"})
          </button>
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all border ${
              showEMA20
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-[#080d16] text-slate-400 border-[#1c273c]"
            }`}
          >
            EMA 20 ({analysis?.ema20.toFixed(1) || "—"})
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all border ${
              showEMA50
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-[#080d16] text-slate-400 border-[#1c273c]"
            }`}
          >
            EMA 50 ({analysis?.ema50.toFixed(1) || "—"})
          </button>
        </div>
      </div>

      {/* Chart 1: Price + Simple Moving Averages */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Price & Simple Moving Averages (SMA 20 / 50 / 200)</h2>
            <p className="text-xs text-slate-400">Trend regime tracking and dynamic moving average support/resistance</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Close: {analysis?.current_price.toLocaleString()}</span>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Calculating SMA series...</span>
          </div>
        ) : (
          <div className="h-72 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                  formatter={(val: any) => [Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 }), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="close" name="Asset Close" stroke="#f1f5f9" strokeWidth={1.8} dot={false} />
                {showSMA20 && <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="#38bdf8" strokeWidth={1.5} dot={false} />}
                {showSMA50 && <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="#f59e0b" strokeWidth={1.5} dot={false} />}
                {showSMA200 && <Line type="monotone" dataKey="sma200" name="SMA 200" stroke="#a855f7" strokeWidth={1.8} dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart 2: Price + Exponential Moving Averages */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Price & Exponential Moving Averages (EMA 20 / 50)</h2>
            <p className="text-xs text-slate-400">Higher weighting given to recent prices for responsive momentum crossovers</p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400">Exponential Filtering</span>
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Calculating EMA series...</span>
          </div>
        ) : (
          <div className="h-72 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                  formatter={(val: any) => [Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 }), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="close" name="Asset Close" stroke="#f1f5f9" strokeWidth={1.8} dot={false} />
                {showEMA20 && <Line type="monotone" dataKey="ema20" name="EMA 20" stroke="#10b981" strokeWidth={1.5} dot={false} />}
                {showEMA50 && <Line type="monotone" dataKey="ema50" name="EMA 50" stroke="#f43f5e" strokeWidth={1.5} dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
