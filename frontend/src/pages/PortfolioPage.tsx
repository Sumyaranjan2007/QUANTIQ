import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import {
  PieChart as PieIcon,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  Activity,
  ShieldAlert,
  RotateCcw
} from "lucide-react";
import { api } from "../services/api";
import type { PortfolioResponse } from "../types";

export const PortfolioPage: React.FC = () => {
  // Weights (default equal 25% each)
  const [weights, setWeights] = useState<Record<string, number>>({
    BTC: 25,
    XAU: 25,
    NVDA: 25,
    "^NSEI": 25
  });

  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const assetMeta: Record<string, { name: string; color: string }> = {
    BTC: { name: "Bitcoin", color: "#f59e0b" },
    XAU: { name: "Gold", color: "#eab308" },
    NVDA: { name: "NVIDIA", color: "#10b981" },
    "^NSEI": { name: "NIFTY 50", color: "#38bdf8" }
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.5;

  const simulate = async () => {
    if (!isWeightValid) {
      setError(`Allocation must equal exactly 100% (currently ${totalWeight}%).`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const allocs = Object.entries(weights).map(([sym, w]) => ({
        symbol: sym,
        weight: w / 100
      }));
      const res = await api.simulatePortfolio(allocs, initialCapital);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to simulate portfolio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    simulate();
  }, []);

  const handleWeightChange = (symbol: string, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [symbol]: Math.max(0, Math.min(100, val))
    }));
  };

  const handleEqualWeight = () => {
    setWeights({
      BTC: 25,
      XAU: 25,
      NVDA: 25,
      "^NSEI": 25
    });
  };

  // Pie chart data
  const pieData = Object.entries(weights).map(([sym, val]) => ({
    name: assetMeta[sym].name,
    value: val,
    color: assetMeta[sym].color
  }));

  // Downsample equity curve
  const chartCurve = React.useMemo(() => {
    if (!data?.equity_curve) return [];
    const eq = data.equity_curve;
    if (eq.length <= 250) return eq;
    const step = Math.ceil(eq.length / 250);
    return eq.filter((_, idx) => idx % step === 0 || idx === eq.length - 1);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Portfolio Lab</h1>
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded">
              CROSS-ASSET ALLOCATION ENGINE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Construct custom multi-asset portfolios, simulate joint equity curves, and assess risk diversification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEqualWeight}
            className="px-3.5 py-2 rounded-xl bg-[#0c121e] hover:bg-[#131d30] border border-[#1c273c] text-xs font-mono text-slate-300 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Equal Weight (25% Each)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Allocation Sliders & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1c273c] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Allocation Weight Sliders</h3>
            </div>
            <div className="font-mono text-xs">
              <span className="text-slate-400">Total: </span>
              <span className={`font-bold ${isWeightValid ? "text-emerald-400" : "text-rose-400"}`}>
                {totalWeight}% {isWeightValid ? "✓ Valid" : "(Must equal 100%)"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(weights).map(([sym, w]) => (
              <div key={sym} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: assetMeta[sym].color }} />
                    <span>{assetMeta[sym].name} ({sym})</span>
                  </span>
                  <span className="text-cyan-400 font-bold">{w}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={w}
                    onChange={(e) => handleWeightChange(sym, Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={w}
                    onChange={(e) => handleWeightChange(sym, Number(e.target.value))}
                    className="w-16 bg-[#080d16] border border-[#1c273c] rounded px-2 py-1 text-center font-mono text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#1c273c]">
            <div className="text-xs font-mono text-slate-400">
              Initial Capital: <strong className="text-white">${initialCapital.toLocaleString()}</strong>
            </div>
            <button
              onClick={simulate}
              disabled={!isWeightValid || loading}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow disabled:opacity-40"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              <span>Simulate Portfolio</span>
            </button>
          </div>
        </div>

        {/* Donut Chart (1 Col) */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1c273c] pb-3 mb-2">
            <h3 className="text-sm font-bold text-white">Target Allocation</h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              DONUT VISUALIZER
            </span>
          </div>

          <div className="h-56 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0c121e" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                  formatter={(val: any) => [`${val}%`, "Weight"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-[#1c273c]">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-300 truncate">{d.name}:</span>
                <span className="text-white font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Performance KPIs */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-slate-400 block mb-1">FINAL CAPITAL</span>
            <div className="text-lg font-bold text-white">${data.final_capital.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <span className="text-[10px] text-slate-400">Total portfolio value</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-slate-400 block mb-1">TOTAL RETURN</span>
            <div className={`text-lg font-bold ${data.portfolio_return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {data.portfolio_return_pct >= 0 ? `+${data.portfolio_return_pct}%` : `${data.portfolio_return_pct}%`}
            </div>
            <span className="text-[10px] text-slate-400">Cumulative net growth</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-slate-400 block mb-1">PORTFOLIO CAGR</span>
            <div className="text-lg font-bold text-cyan-400">{data.portfolio_cagr_pct}%</div>
            <span className="text-[10px] text-slate-400">Compounded annual rate</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-slate-400 block mb-1">PORTFOLIO SHARPE</span>
            <div className="text-lg font-bold text-cyan-300">{data.portfolio_sharpe}</div>
            <span className="text-[10px] text-slate-400">Risk-adjusted return</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-slate-400 block mb-1">PORTFOLIO VOLATILITY</span>
            <div className="text-lg font-bold text-amber-300">{data.portfolio_volatility_pct}%</div>
            <span className="text-[10px] text-slate-400">Diversified annual vol</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-slate-400 block mb-1">MAX DRAWDOWN</span>
            <div className="text-lg font-bold text-rose-400">{data.max_drawdown_pct}%</div>
            <span className="text-[10px] text-slate-400">Peak-to-trough decline</span>
          </div>
        </div>
      )}

      {/* Portfolio Growth Curve */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Simulated Portfolio Equity Curve ($)</h3>
            <p className="text-xs text-slate-400">Historical performance with multi-asset rebalancing</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Initial: ${initialCapital.toLocaleString()}
          </span>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs font-mono text-cyan-400">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Computing portfolio trajectory...
          </div>
        ) : (
          <div className="h-64 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartCurve} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                  formatter={(v: any) => [`$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Portfolio Value"]}
                />
                <Line type="monotone" dataKey="portfolio_equity" name="Portfolio Equity" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Contribution to Return Table */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Asset Contribution to Portfolio Return</h3>
            <p className="text-xs text-slate-400">Breakdown of each individual constituent's standalone return and weighted contribution</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1c273c] text-slate-400 text-left">
                <th className="p-3">ASSET</th>
                <th className="p-3">WEIGHT</th>
                <th className="p-3">INDIVIDUAL RETURN</th>
                <th className="p-3">INDIVIDUAL VOLATILITY</th>
                <th className="p-3">WEIGHTED CONTRIBUTION</th>
              </tr>
            </thead>
            <tbody>
              {data?.contributions.map((c) => (
                <tr key={c.symbol} className="border-b border-[#1c273c]/50 hover:bg-[#0f172a] transition-colors">
                  <td className="p-3 text-white font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: assetMeta[c.symbol]?.color || "#38bdf8" }} />
                    <span>{c.name} ({c.symbol})</span>
                  </td>
                  <td className="p-3 text-cyan-400 font-bold">{c.weight_pct}%</td>
                  <td className="p-3">
                    <span className={c.individual_return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {c.individual_return_pct >= 0 ? `+${c.individual_return_pct}%` : `${c.individual_return_pct}%`}
                    </span>
                  </td>
                  <td className="p-3 text-amber-300">{c.individual_volatility_pct}%</td>
                  <td className="p-3">
                    <span className={`font-bold ${c.weighted_contribution_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {c.weighted_contribution_pct >= 0 ? `+${c.weighted_contribution_pct}%` : `${c.weighted_contribution_pct}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
