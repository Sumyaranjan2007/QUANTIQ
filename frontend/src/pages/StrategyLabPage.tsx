import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import {
  Play,
  FlaskConical,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { api } from "../services/api";
import { StrategyDNARadar } from "../components/StrategyDNARadar";
import { WhyDidThisHappenModal } from "../components/WhyDidThisHappenModal";
import type { BacktestResponse, BenchmarkComparisonRow, Trade } from "../types";

interface StrategyLabPageProps {
  selectedSymbol: string;
  setSelectedSymbol: (sym: string) => void;
}

export const StrategyLabPage: React.FC<StrategyLabPageProps> = ({
  selectedSymbol,
  setSelectedSymbol
}) => {
  const [strategy, setStrategy] = useState<string>("sma_crossover");
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [fastPeriod, setFastPeriod] = useState<number>(20);
  const [slowPeriod, setSlowPeriod] = useState<number>(50);
  const [momentumLookback, setMomentumLookback] = useState<number>(20);
  const [momentumThreshold, setMomentumThreshold] = useState<number>(0.02);
  const [meanRevLookback, setMeanRevLookback] = useState<number>(20);
  const [meanRevStdDev, setMeanRevStdDev] = useState<number>(1.5);
  const [txCost, setTxCost] = useState<number>(0.001); // 0.10%
  const [slippage, setSlippage] = useState<number>(0.0005); // 0.05%

  const [backtestResult, setBacktestResult] = useState<BacktestResponse | null>(null);
  const [comparisonRows, setComparisonRows] = useState<BenchmarkComparisonRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [comparing, setComparing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trade Table Pagination
  const [tradePage, setTradePage] = useState<number>(1);
  const tradesPerPage = 6;

  // "Why Did This Happen?" Modal state
  const [attributionModalOpen, setAttributionModalOpen] = useState<boolean>(false);
  const [attributionEventType, setAttributionEventType] = useState<string>("max_drawdown");

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runBacktest({
        symbol: selectedSymbol,
        strategy,
        initial_capital: initialCapital,
        fast_period: fastPeriod,
        slow_period: slowPeriod,
        momentum_lookback: momentumLookback,
        momentum_threshold: momentumThreshold,
        mean_reversion_lookback: meanRevLookback,
        mean_reversion_std_dev: meanRevStdDev,
        transaction_cost: txCost,
        slippage: slippage
      });
      setBacktestResult(res);
      setTradePage(1);

      // Also fetch benchmark comparison
      setComparing(true);
      const comps = await api.compareStrategies(selectedSymbol);
      setComparisonRows(comps);
    } catch (err: any) {
      setError(err.message || "Failed to execute quantitative simulation.");
    } finally {
      setLoading(false);
      setComparing(false);
    }
  };

  // Run initial simulation on load
  useEffect(() => {
    runSimulation();
  }, [selectedSymbol, strategy]);

  // Downsampled chart curves
  const equityData = React.useMemo(() => {
    if (!backtestResult?.equity_curve) return [];
    const eq = backtestResult.equity_curve;
    if (eq.length <= 250) return eq;
    const step = Math.ceil(eq.length / 250);
    return eq.filter((_, idx) => idx % step === 0 || idx === eq.length - 1);
  }, [backtestResult]);

  // Pagination for trades
  const trades = backtestResult?.trades || [];
  const totalTradePages = Math.max(1, Math.ceil(trades.length / tradesPerPage));
  const displayedTrades = trades.slice((tradePage - 1) * tradesPerPage, tradePage * tradesPerPage);

  const m = backtestResult?.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Strategy Lab</h1>
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded">
              SYSTEMATIC BACKTEST ENGINE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Design, test, and benchmark algorithmic models with realistic transaction friction and slippage
          </p>
        </div>

        {/* Why Did This Happen Trigger Button */}
        <button
          onClick={() => {
            setAttributionEventType("max_drawdown");
            setAttributionModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-200 hover:text-white hover:border-rose-400 font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>WHY DID THIS HAPPEN?</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Strategy Selector and Parameters Form */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c273c] pb-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Model Formulation:</span>
          </div>

          {/* Strategy Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#080d16] p-1 rounded-xl border border-[#1c273c]">
            {[
              { id: "sma_crossover", label: "SMA Crossover" },
              { id: "ema_crossover", label: "EMA Crossover" },
              { id: "momentum", label: "Momentum" },
              { id: "mean_reversion", label: "Mean Reversion" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  strategy === s.id
                    ? "bg-cyan-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Sliders / Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
            <span className="text-slate-400 block text-[10px] mb-1">ASSET</span>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="XAU">Gold (XAU)</option>
              <option value="NVDA">NVIDIA (NVDA)</option>
              <option value="^NSEI">NIFTY 50 (^NSEI)</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
            <span className="text-slate-400 block text-[10px] mb-1">INITIAL CAPITAL</span>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
            />
          </div>

          {(strategy === "sma_crossover" || strategy === "ema_crossover") && (
            <>
              <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
                <span className="text-slate-400 block text-[10px] mb-1">FAST PERIOD (BARS)</span>
                <input
                  type="number"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(Number(e.target.value))}
                  className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
                <span className="text-slate-400 block text-[10px] mb-1">SLOW PERIOD (BARS)</span>
                <input
                  type="number"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(Number(e.target.value))}
                  className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
                />
              </div>
            </>
          )}

          {strategy === "momentum" && (
            <>
              <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
                <span className="text-slate-400 block text-[10px] mb-1">LOOKBACK (DAYS)</span>
                <input
                  type="number"
                  value={momentumLookback}
                  onChange={(e) => setMomentumLookback(Number(e.target.value))}
                  className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
                <span className="text-slate-400 block text-[10px] mb-1">THRESHOLD (%)</span>
                <input
                  type="number"
                  step="0.005"
                  value={momentumThreshold}
                  onChange={(e) => setMomentumThreshold(Number(e.target.value))}
                  className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
                />
              </div>
            </>
          )}

          {strategy === "mean_reversion" && (
            <>
              <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
                <span className="text-slate-400 block text-[10px] mb-1">LOOKBACK (DAYS)</span>
                <input
                  type="number"
                  value={meanRevLookback}
                  onChange={(e) => setMeanRevLookback(Number(e.target.value))}
                  className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
                <span className="text-slate-400 block text-[10px] mb-1">BAND MULTIPLIER (σ)</span>
                <input
                  type="number"
                  step="0.1"
                  value={meanRevStdDev}
                  onChange={(e) => setMeanRevStdDev(Number(e.target.value))}
                  className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2 py-1 outline-none"
                />
              </div>
            </>
          )}

          <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
            <span className="text-slate-400 block text-[10px] mb-1">TX COST</span>
            <span className="text-slate-200 block">{(txCost * 100).toFixed(2)}%</span>
            <span className="text-[9px] text-slate-400">Fixed friction</span>
          </div>

          <div className="p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
            <span className="text-slate-400 block text-[10px] mb-1">SLIPPAGE</span>
            <span className="text-slate-200 block">{(slippage * 100).toFixed(2)}%</span>
            <span className="text-[9px] text-slate-400">Execution drag</span>
          </div>
        </div>

        {/* Run Simulation Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 font-mono">
            Signal strictly shifted by +1 bar to avoid look-ahead bias.
          </span>
          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{loading ? "Running quantitative simulation..." : "RUN BACKTEST"}</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      {m && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">FINAL CAPITAL</span>
            <span className="text-base font-bold text-white">${m.final_capital.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">TOTAL RETURN</span>
            <span className={`text-base font-bold ${m.total_return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {m.total_return_pct >= 0 ? `+${m.total_return_pct}%` : `${m.total_return_pct}%`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">BENCHMARK RETURN</span>
            <span className={`text-base font-bold ${m.benchmark_return_pct >= 0 ? "text-slate-200" : "text-rose-400"}`}>
              {m.benchmark_return_pct >= 0 ? `+${m.benchmark_return_pct}%` : `${m.benchmark_return_pct}%`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">CAGR</span>
            <span className="text-base font-bold text-cyan-400">{m.cagr_pct}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">SHARPE RATIO</span>
            <span className="text-base font-bold text-cyan-300">{m.sharpe_ratio}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">MAX DRAWDOWN</span>
            <span className="text-base font-bold text-rose-400">{m.max_drawdown_pct}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">WIN RATE</span>
            <span className="text-base font-bold text-emerald-400">{m.win_rate_pct}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1c273c]">
            <span className="text-[10px] text-slate-400 block">PROFIT FACTOR</span>
            <span className="text-base font-bold text-amber-300">{m.profit_factor}</span>
          </div>
        </div>
      )}

      {/* Main Charts & Strategy DNA Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Equity Curve & Drawdown Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equity Curve */}
          <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
            <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Equity Curve: Strategy vs Buy & Hold Benchmark</h3>
                <p className="text-xs text-slate-400">Total simulated portfolio value over time (Initial: ${initialCapital.toLocaleString()})</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {backtestResult?.strategy_name}
              </span>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs font-mono text-cyan-400">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Simulating bar execution...
              </div>
            ) : (
              <div className="h-64 w-full font-mono text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                    <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                      formatter={(v: any) => [`$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, ""]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line type="monotone" dataKey="strategy_equity" name={`Strategy Equity`} stroke="#38bdf8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="benchmark_equity" name="Buy & Hold Benchmark" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Drawdown Curve */}
          <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
            <div className="flex items-center justify-between mb-3 border-b border-[#1c273c] pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Underwater Drawdown Profile (%)</h4>
                <p className="text-xs text-slate-400">Strategy drawdown vs Buy & Hold benchmark drop</p>
              </div>
              <button
                onClick={() => {
                  setAttributionEventType("max_drawdown");
                  setAttributionModalOpen(true);
                }}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 underline"
              >
                Explain Max Drawdown Event
              </button>
            </div>

            <div className="h-44 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stratDdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" vertical={false} />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} minTickGap={40} />
                  <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} domain={["auto", 0]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090e18", borderColor: "#1c273c", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                    formatter={(v: any) => [`${Number(v).toFixed(2)}%`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="drawdown_pct" name="Strategy Drawdown" stroke="#f43f5e" strokeWidth={1.5} fill="url(#stratDdGrad)" />
                  <Line type="monotone" dataKey="benchmark_drawdown_pct" name="Benchmark Drawdown" stroke="#475569" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Strategy DNA Radar */}
        <div>
          {backtestResult?.strategy_dna ? (
            <StrategyDNARadar
              dna={backtestResult.strategy_dna}
              strategyName={backtestResult.strategy_name}
            />
          ) : (
            <div className="h-full p-6 rounded-2xl bg-[#0c121e] border border-[#1c273c] flex items-center justify-center text-xs font-mono text-slate-400">
              Run backtest to view Strategy DNA fingerprint
            </div>
          )}
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Execution Trade Log ({trades.length} Trades)</h3>
            <p className="text-xs text-slate-400">Round-trip executions including 0.10% transaction cost and 0.05% slippage</p>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Page {tradePage} of {totalTradePages}</span>
            <button
              onClick={() => setTradePage(Math.max(1, tradePage - 1))}
              disabled={tradePage === 1}
              className="p-1 rounded bg-[#080d16] border border-[#1c273c] disabled:opacity-40 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTradePage(Math.min(totalTradePages, tradePage + 1))}
              disabled={tradePage === totalTradePages}
              className="p-1 rounded bg-[#080d16] border border-[#1c273c] disabled:opacity-40 text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1c273c] text-slate-400 text-left">
                <th className="p-2.5">#</th>
                <th className="p-2.5">ENTRY DATE</th>
                <th className="p-2.5">EXIT DATE</th>
                <th className="p-2.5">ENTRY PRICE</th>
                <th className="p-2.5">EXIT PRICE</th>
                <th className="p-2.5">HOLD (DAYS)</th>
                <th className="p-2.5">NET RETURN</th>
                <th className="p-2.5">PROFIT/LOSS</th>
                <th className="p-2.5">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {displayedTrades.map((t) => {
                const isWin = t.profit_loss > 0;
                return (
                  <tr key={t.id} className="border-b border-[#1c273c]/50 hover:bg-[#0f172a] transition-colors">
                    <td className="p-2.5 text-slate-400">{t.id}</td>
                    <td className="p-2.5 text-white">{t.entry_date}</td>
                    <td className="p-2.5 text-white">{t.exit_date}</td>
                    <td className="p-2.5 text-slate-300">${t.entry_price.toLocaleString()}</td>
                    <td className="p-2.5 text-slate-300">${t.exit_price.toLocaleString()}</td>
                    <td className="p-2.5 text-slate-400">{t.holding_days}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isWin ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                      }`}>
                        {isWin ? `+${t.net_return_pct}%` : `${t.net_return_pct}%`}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold">
                      <span className={isWin ? "text-emerald-400" : "text-rose-400"}>
                        {isWin ? `+$${t.profit_loss.toLocaleString()}` : `-$${Math.abs(t.profit_loss).toLocaleString()}`}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <button
                        onClick={() => {
                          setAttributionEventType(isWin ? "biggest_gain" : "biggest_loss");
                          setAttributionModalOpen(true);
                        }}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Explain
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Benchmark Comparison Table */}
      <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex items-center justify-between mb-4 border-b border-[#1c273c] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Strategy Benchmark Comparison</h3>
            <p className="text-xs text-slate-400">All 4 systematic models compared directly against the Buy & Hold benchmark</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            "Performance depends on the selected asset, time period, costs and assumptions."
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1c273c] text-slate-400 text-left">
                <th className="p-3">STRATEGY</th>
                <th className="p-3">TOTAL RETURN</th>
                <th className="p-3">CAGR</th>
                <th className="p-3">SHARPE</th>
                <th className="p-3">VOLATILITY</th>
                <th className="p-3">MAX DRAWDOWN</th>
                <th className="p-3">WIN RATE</th>
                <th className="p-3">TRADES</th>
                <th className="p-3">PROFIT FACTOR</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => {
                const isSelected = row.strategy_key === strategy;
                return (
                  <tr
                    key={row.strategy_key}
                    className={`border-b border-[#1c273c]/50 transition-colors ${
                      isSelected ? "bg-cyan-500/10 font-bold" : "hover:bg-[#0f172a]"
                    }`}
                  >
                    <td className="p-3 text-white flex items-center gap-2">
                      <span>{row.strategy_name}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold uppercase">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={row.total_return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {row.total_return_pct >= 0 ? `+${row.total_return_pct}%` : `${row.total_return_pct}%`}
                      </span>
                    </td>
                    <td className="p-3 text-cyan-400">{row.cagr_pct}%</td>
                    <td className="p-3 text-cyan-300">{row.sharpe_ratio}</td>
                    <td className="p-3 text-amber-300">{row.volatility_pct}%</td>
                    <td className="p-3 text-rose-400">{row.max_drawdown_pct}%</td>
                    <td className="p-3 text-emerald-300">{row.win_rate_pct}%</td>
                    <td className="p-3 text-slate-300">{row.total_trades}</td>
                    <td className="p-3 text-slate-200">{row.profit_factor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Modal */}
      <WhyDidThisHappenModal
        isOpen={attributionModalOpen}
        onClose={() => setAttributionModalOpen(false)}
        symbol={selectedSymbol}
        strategy={strategy}
        eventType={attributionEventType}
      />
    </div>
  );
};
