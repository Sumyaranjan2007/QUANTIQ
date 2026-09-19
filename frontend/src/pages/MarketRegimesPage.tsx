import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import {
  Layers,
  RefreshCw,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle
} from "lucide-react";
import { api } from "../services/api";
import type { RegimeResponse, RegimeTimelinePoint } from "../types";

interface MarketRegimesPageProps {
  selectedSymbol: string;
}

export const MarketRegimesPage: React.FC<MarketRegimesPageProps> = ({ selectedSymbol }) => {
  const [data, setData] = useState<RegimeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Market Regime Replay state
  const [replayPreset, setReplayPreset] = useState<string>("all");
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getRegimeAnalysis(selectedSymbol);
        if (isMounted) {
          setData(res);
          setPlaybackIndex(res.timeline.length - 1);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load regime analysis.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedSymbol]);

  // Handle Regime Replay Presets (2022 Bear, 2023 Recovery, 2024 Bull, High Volatility)
  const filteredTimeline = React.useMemo(() => {
    if (!data?.timeline) return [];
    if (replayPreset === "2022_bear") {
      return data.timeline.filter((p) => p.date.startsWith("2022"));
    }
    if (replayPreset === "2023_recovery") {
      return data.timeline.filter((p) => p.date.startsWith("2023"));
    }
    if (replayPreset === "2024_bull") {
      return data.timeline.filter((p) => p.date.startsWith("2024"));
    }
    if (replayPreset === "high_vol") {
      return data.timeline.filter((p) => p.regime === "High Volatility" || p.volatility_percentile > 70);
    }
    // Downsample full dataset for chart smoothness
    const t = data.timeline;
    if (t.length <= 250) return t;
    const step = Math.ceil(t.length / 250);
    return t.filter((_, idx) => idx % step === 0 || idx === t.length - 1);
  }, [data, replayPreset]);

  // Auto playback animation timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= filteredTimeline.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, filteredTimeline]);

  const currentReplayPoint = filteredTimeline[playbackIndex] || filteredTimeline[filteredTimeline.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Market Regime Intelligence</h1>
            <span className="text-xs font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded">
              STATE MACHINE & VOLATILITY CLUSTERING
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic detection of Bull, Bear, Sideways, and High Volatility regimes across multi-year cycles
          </p>
        </div>

        {data && (
          <div className="flex items-center gap-2 bg-[#0c121e] px-4 py-2 rounded-xl border border-[#1c273c] font-mono text-xs">
            <span className="text-slate-400">Current Regime:</span>
            <span className="font-bold text-emerald-400">{data.current_regime.toUpperCase()}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Differentiator: Market Regime Replay Controller */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c121e] to-[#111929] border border-cyan-500/30 shadow-xl shadow-cyan-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[#1c273c] pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Market Regime Replay Simulator</h2>
              <p className="text-xs text-slate-400">Isolate historical macroeconomic epochs and replay the strategy execution state</p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#080d16] p-1 rounded-xl border border-[#1c273c]">
            {[
              { id: "all", label: "Full Horizon (2020-2026)" },
              { id: "2022_bear", label: "2022 Bear Market" },
              { id: "2023_recovery", label: "2023 Recovery" },
              { id: "2024_bull", label: "2024 Bull Run" },
              { id: "high_vol", label: "High Vol Shock" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setReplayPreset(p.id);
                  setIsPlaying(false);
                  setPlaybackIndex(0);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  replayPreset === p.id
                    ? "bg-cyan-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Playback Controls & Active Bar Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isPlaying ? "Pause Replay" : "Start Replay"}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setPlaybackIndex(0);
              }}
              className="p-2 rounded-xl bg-[#080d16] hover:bg-[#152037] text-slate-300 border border-[#1c273c]"
              title="Reset Timeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber slider */}
          <div className="md:col-span-2 flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">Scrub:</span>
            <input
              type="range"
              min={0}
              max={Math.max(0, filteredTimeline.length - 1)}
              value={playbackIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setPlaybackIndex(Number(e.target.value));
              }}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Replayed Point Snapshot */}
          <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c] font-mono text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">REPLAY DATE</span>
              <span className="text-white font-bold">{currentReplayPoint?.date || "—"}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">STATE</span>
              <span
                className="font-bold text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: `${currentReplayPoint?.color || "#10b981"}20`, color: currentReplayPoint?.color || "#10b981" }}
              >
                {currentReplayPoint?.regime || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Regime Timeline Chart */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Regime Classification Timeline</h3>
            <p className="text-xs text-slate-400">Color-coded price trajectory (Emerald: Bull, Rose: Bear, Amber: Sideways, Violet: High Vol)</p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Bull</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-slate-300">Bear</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">Sideways</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span className="text-slate-300">High Volatility</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center text-xs font-mono text-cyan-400">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Classifying macro state machine...
          </div>
        ) : (
          <div className="h-72 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredTimeline} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                  formatter={(val: any, name: any) => [
                    name === "Close Price" ? `$${Number(val).toLocaleString()}` : `${val}%`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="close" name="Close Price" stroke="#f1f5f9" strokeWidth={1.8} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Regime Performance Breakdown Table */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Empirical Regime Performance Breakdown</h3>
            <p className="text-xs text-slate-400">How asset returns and volatility behave across distinct detected states</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1c273c] text-slate-400 text-left">
                <th className="p-3">REGIME</th>
                <th className="p-3">DAYS OBSERVED</th>
                <th className="p-3">SHARE OF TIME</th>
                <th className="p-3">AVG DAILY RETURN</th>
                <th className="p-3">ANNUALIZED RETURN</th>
                <th className="p-3">ANNUALIZED VOL</th>
                <th className="p-3">MAX DRAWDOWN</th>
              </tr>
            </thead>
            <tbody>
              {data?.performances.map((perf) => (
                <tr key={perf.regime} className="border-b border-[#1c273c]/50 hover:bg-[#0f172a] transition-colors">
                  <td className="p-3 text-white font-bold flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          perf.regime === "Bull"
                            ? "#10b981"
                            : perf.regime === "Bear"
                            ? "#f43f5e"
                            : perf.regime === "High Volatility"
                            ? "#a855f7"
                            : "#f59e0b"
                      }}
                    />
                    <span>{perf.regime}</span>
                  </td>
                  <td className="p-3 text-slate-300">{perf.days_count} days</td>
                  <td className="p-3 text-cyan-400">{perf.share_of_time_pct}%</td>
                  <td className="p-3">
                    <span className={perf.average_daily_return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {perf.average_daily_return_pct >= 0 ? `+${perf.average_daily_return_pct}%` : `${perf.average_daily_return_pct}%`}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={perf.annualized_return_pct >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {perf.annualized_return_pct >= 0 ? `+${perf.annualized_return_pct}%` : `${perf.annualized_return_pct}%`}
                    </span>
                  </td>
                  <td className="p-3 text-amber-300">{perf.annualized_volatility_pct}%</td>
                  <td className="p-3 text-rose-400">{perf.max_drawdown_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
