import React from "react";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  CheckCircle2
} from "lucide-react";

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onExploreDemo,
}) => {
  const steps = [
    { num: "01", title: "Select Assets", desc: "Cross-asset universe across Gold, Bitcoin, NVIDIA, and NIFTY 50." },
    { num: "02", title: "Analyze Data", desc: "Compute SMAs, EMAs, rolling volatilities, and Pearson correlations." },
    { num: "03", title: "Build Strategy", desc: "Configure crossover, momentum, or mean-reversion parameter engines." },
    { num: "04", title: "Backtest", desc: "Simulate equity curves with real slippage, transaction fees, and zero lookahead." },
    { num: "05", title: "Measure Risk", desc: "Evaluate Historical VaR (95%/99%), Expected Shortfall, and maximum drawdowns." },
    { num: "06", title: "Understand Results", desc: "Deploy 'Why Did This Happen?' event attribution and AI Quant Assistant." },
  ];

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Header */}
      <header className="border-b border-[#1c273c] bg-[#090e18]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-wider text-white">QUANTIQ</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">Quantitative Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onExploreDemo}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-[#121c2e] transition-colors border border-[#1c273c]"
          >
            Explore Demo Flow
          </button>
          <button
            onClick={onLaunchDashboard}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
          >
            <span>Launch Quant Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 lg:py-24 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-violet-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Institutional-Grade Multi-Asset Research Engine</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Understand the market. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
            Test the strategy.
          </span>{" "}
          Measure the risk.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Analyze markets, quantify tail risk, simulate systematic trading strategies with real friction,
          and explore machine-detected market regimes — all in one unified quantitative terminal.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onLaunchDashboard}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-3 group"
          >
            <span>Launch Quant Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0e1626] hover:bg-[#152037] text-slate-200 hover:text-white font-semibold text-base transition-all border border-[#1c273c] flex items-center justify-center gap-2"
          >
            <span>Explore 3-Minute Judge Demo</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left mb-16">
          <div className="p-5 rounded-xl bg-[#0c121e]/80 border border-[#1c273c] hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Multi-Asset Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equities, Crypto, Precious Metals, and Indices with aligned historical returns and correlation matrices.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0c121e]/80 border border-[#1c273c] hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Strategy Backtesting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crossover, Momentum, and Mean Reversion models with modeled slippage, fees, and Strategy DNA.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0c121e]/80 border border-[#1c273c] hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Risk Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical VaR (95%/99%), Expected Shortfall (CVaR), Sortino ratios, and underwater drawdown duration.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0c121e]/80 border border-[#1c273c] hover:border-violet-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Market Regime Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bull, Bear, Sideways, and Volatility Shock regime classification with interactive Regime Replay.
            </p>
          </div>
        </div>

        {/* Live Terminal Preview Frame */}
        <div className="rounded-2xl border border-[#1c273c] bg-[#090e18] p-4 shadow-2xl overflow-hidden text-left relative">
          <div className="flex items-center justify-between border-b border-[#1c273c] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-2">QUANTIQ_TERMINAL_V1.0 // ACTIVE_SESSION</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              SIMULATION ENGINE ONLINE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs mb-4">
            <div className="bg-[#0c121e] p-3 rounded-lg border border-[#1c273c]">
              <span className="text-slate-400 block text-[10px]">BITCOIN CUMULATIVE</span>
              <span className="text-emerald-400 font-bold text-sm">+248.6%</span>
            </div>
            <div className="bg-[#0c121e] p-3 rounded-lg border border-[#1c273c]">
              <span className="text-slate-400 block text-[10px]">SHARPE RATIO</span>
              <span className="text-cyan-400 font-bold text-sm">1.82</span>
            </div>
            <div className="bg-[#0c121e] p-3 rounded-lg border border-[#1c273c]">
              <span className="text-slate-400 block text-[10px]">MAX DRAWDOWN</span>
              <span className="text-rose-400 font-bold text-sm">-18.4%</span>
            </div>
            <div className="bg-[#0c121e] p-3 rounded-lg border border-[#1c273c]">
              <span className="text-slate-400 block text-[10px]">CURRENT REGIME</span>
              <span className="text-emerald-400 font-bold text-sm">Bull Trend</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#070b12] border border-[#1c273c] text-slate-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Vector Backtest Engine: Zero Lookahead Bias | 0.10% Transaction Cost | 0.05% Slippage</span>
            </div>
            <span className="text-cyan-400 font-mono text-xs">Ready for Execution</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS Section */}
      <section className="px-6 py-16 border-t border-[#1c273c] bg-[#070b12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-cyan-400 text-xs uppercase font-bold tracking-widest mb-2 block">
              Systematic Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-white">How QuantIQ Works</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
              A complete quantitative lifecycle from historical data digestion to strategy attribution and AI insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-6 rounded-xl bg-[#0c121e] border border-[#1c273c] hover:border-cyan-500/30 transition-all flex gap-4"
              >
                <div className="font-mono text-2xl font-bold text-cyan-500/40">{s.num}</div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                    <span>{s.title}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Disclaimer Footer */}
      <footer className="mt-auto border-t border-[#1c273c] bg-[#05080c] px-6 py-8 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-semibold text-slate-300">
            Educational & Quantitative Research Disclaimer
          </p>
          <p>
            This platform is for educational and analytical purposes only. It does not provide personalized financial advice,
            guarantee future performance, or execute live brokerage transactions. Backtested metrics represent hypothetical simulations
            modeled with fixed transaction cost and slippage assumptions.
          </p>
          <p className="text-[11px] text-slate-400 pt-2">
            QUANTIQ © 2026 // Quantitative Multi-Asset Financial Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
};
