import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info
} from "lucide-react";
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
import { api } from "../services/api";
import type { AssetInfo, AnalysisResponse } from "../types";

interface DashboardPageProps {
  selectedSymbol: string;
  setSelectedSymbol: (sym: string) => void;
  selectedDateRange: string;
  onNavigateToStrategy: () => void;
  onNavigateToRisk: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  selectedSymbol,
  setSelectedSymbol,
  selectedDateRange,
  onNavigateToStrategy,
  onNavigateToRisk
}) => {
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [chartMode, setChartMode] = useState<"cumulative_return" | "close" | "log_return">("cumulative_return");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all asset cards & analysis for selected asset
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [assetList, analysisData] = await Promise.all([
          api.getAssets(),
          api.getAnalysis(selectedSymbol)
        ]);
        if (isMounted) {
          setAssets(assetList);
          setAnalysis(analysisData);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load quantitative dashboard metrics.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedSymbol, selectedDateRange]);

  const currentAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  // Downsample chart data points if > 250 for silky smooth rendering
  const chartData = React.useMemo(() => {
    if (!analysis?.series) return [];
    const series = analysis.series;
    if (series.length <= 250) return series;
    const step = Math.ceil(series.length / 250);
    return series.filter((_, idx) => idx % step === 0 || idx === series.length - 1);
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Market Intelligence</h1>
            <span className="text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
              REAL-TIME SIMULATION
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Your quantitative multi-asset market overview</p>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToStrategy}
            className="px-3.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#152037] text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-colors flex items-center gap-1.5"
          >
            <span>Strategy Lab</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNavigateToRisk}
            className="px-3.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#152037] text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <span>Risk Deck</span>
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map((a) => {
          const isSelected = a.symbol === selectedSymbol;
          const isPositive = a.daily_change_pct >= 0;
          return (
            <div
              key={a.symbol}
              onClick={() => setSelectedSymbol(a.symbol)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-150 border ${
                isSelected
                  ? "bg-[#0f172a] border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                  : "bg-[#0c121e]/90 border-[#1c273c] hover:border-slate-600 hover:bg-[#111929]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-extrabold text-white text-base block">{a.name}</span>
                  <span className="text-[11px] font-mono text-slate-400">{a.symbol}</span>
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{isPositive ? `+${a.daily_change_pct.toFixed(2)}%` : `${a.daily_change_pct.toFixed(2)}%`}</span>
                </div>
              </div>

              <div className="text-xl font-mono font-bold text-white mb-2">
                {a.currency_symbol}{a.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>

              <div className="pt-2 border-t border-[#1c273c] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Return: <strong className={a.total_return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {a.total_return_pct >= 0 ? `+${a.total_return_pct.toFixed(1)}%` : `${a.total_return_pct.toFixed(1)}%`}
                </strong></span>
                <span>Vol: <strong className="text-slate-200">{a.annualized_volatility_pct.toFixed(1)}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Current Price</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {currentAsset?.currency_symbol || "$"}
            {analysis?.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "—"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Latest daily settlement</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Return</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className={`text-lg font-mono font-bold ${
            (analysis?.annual_return_pct ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}>
            {(analysis?.annual_return_pct ?? 0) >= 0 ? `+${analysis?.annual_return_pct.toFixed(1)}%` : `${analysis?.annual_return_pct.toFixed(1)}%`}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">CAGR annualized</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sharpe Ratio</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-mono font-bold text-cyan-400">
            {analysis?.sharpe_ratio.toFixed(2) || "—"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Risk-free rate 4.0%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Volatility</span>
            <Percent className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-mono font-bold text-amber-300">
            {analysis?.annual_volatility_pct.toFixed(1) || "—"}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Annualized (σ * √252)</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Max Drawdown</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-mono font-bold text-rose-400">
            {analysis?.max_drawdown_pct.toFixed(1) || "—"}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Peak-to-trough drop</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>SMA 200 Trend</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-mono font-bold text-slate-200">
            {analysis?.sma200.toLocaleString(undefined, { minimumFractionDigits: 1 }) || "—"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {(analysis?.current_price ?? 0) > (analysis?.sma200 ?? 0) ? (
              <span className="text-emerald-400 font-semibold">Above Trend (Bull)</span>
            ) : (
              <span className="text-rose-400 font-semibold">Below Trend (Bear)</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Performance Chart */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1c273c] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Historical Performance Chart</h2>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {currentAsset?.name} ({currentAsset?.symbol})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Interactive line series with multi-metric toggles</p>
          </div>

          {/* Metric switch buttons */}
          <div className="flex items-center gap-1.5 bg-[#080d16] p-1 rounded-lg border border-[#1c273c]">
            <button
              onClick={() => setChartMode("cumulative_return")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                chartMode === "cumulative_return"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cumulative Return (%)
            </button>
            <button
              onClick={() => setChartMode("close")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                chartMode === "close"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Price ({currentAsset?.currency_symbol || "$"})
            </button>
            <button
              onClick={() => setChartMode("log_return")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                chartMode === "log_return"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Log Return (%)
            </button>
          </div>
        </div>

        {/* Chart View */}
        {isLoading ? (
          <div className="h-80 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Calculating quantitative price curves...</span>
          </div>
        ) : (
          <div className="h-80 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) =>
                    chartMode === "close"
                      ? `${v.toLocaleString()}`
                      : `${v.toFixed(0)}%`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090e18",
                    borderColor: "#1c273c",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                  }}
                  formatter={(value: any) => [
                    chartMode === "close"
                      ? `${currentAsset?.currency_symbol}${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : `${Number(value).toFixed(2)}%`,
                    chartMode === "close" ? "Price" : "Return"
                  ]}
                />
                <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }} />
                <Line
                  type="monotone"
                  dataKey={chartMode}
                  name={`${currentAsset?.name} (${chartMode.replace("_", " ").toUpperCase()})`}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#38bdf8" }}
                />
                {chartMode === "close" && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sma50"
                      name="SMA 50"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="4 4"
                    />
                    <Line
                      type="monotone"
                      dataKey="sma200"
                      name="SMA 200"
                      stroke="#a855f7"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
