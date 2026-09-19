import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Activity,
  ShieldCheck,
  TrendingUp,
  Layers,
  GitMerge,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { api } from "../services/api";
import type { AIInsightsSummary } from "../types";

interface AIInsightsPageProps {
  selectedSymbol: string;
  onOpenAssistant: () => void;
}

export const AIInsightsPage: React.FC<AIInsightsPageProps> = ({
  selectedSymbol,
  onOpenAssistant
}) => {
  const [insights, setInsights] = useState<AIInsightsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAIInsights({
          symbol: selectedSymbol,
          strategy: "SMA Crossover",
          total_return_pct: 124.5,
          benchmark_return_pct: 86.2,
          sharpe_ratio: 1.68,
          max_drawdown_pct: -19.4,
          volatility_pct: 28.2,
          market_regime: "Bull",
          total_trades: 18,
          win_rate_pct: 61.1
        });
        if (isMounted) setInsights(res);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load AI insights.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedSymbol]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">AI Quantitative Insights</h1>
            <span className="text-xs font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded">
              DESCRIPTIVE RESEARCH AGENT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated machine synthesis of performance, risk distributions, execution behavior, and regime dynamics
          </p>
        </div>

        <button
          onClick={onOpenAssistant}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20"
        >
          <Bot className="w-4 h-4" />
          <span>Ask QuantIQ AI Assistant</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
          <span className="font-mono text-xs">Synthesizing quantitative market state & backtest telemetry...</span>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Engine Status Banner */}
          <div className="p-4 rounded-xl bg-[#0c121e] border border-violet-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Engine: <strong className="text-violet-300 font-mono">{insights.provider}</strong></span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Asset Context: {selectedSymbol}</span>
          </div>

          {/* 4 Core Narrative Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Performance Summary */}
            <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-2 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>1. Performance Summary</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights.performance_summary}
              </p>
            </div>

            {/* Risk Summary */}
            <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-2 hover:border-rose-500/30 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Risk Profile & Tail Excursions</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights.risk_summary}
              </p>
            </div>

            {/* Strategy Behavior */}
            <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-2 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                <span>3. Execution & Strategy Behavior</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights.strategy_behavior}
              </p>
            </div>

            {/* Market Regime */}
            <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-2 hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>4. Macro Regime Sensitivity</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights.market_regime}
              </p>
            </div>
          </div>

          {/* Key Observations List */}
          <div className="p-6 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Quantitative Observations & Takeaways</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {insights.key_observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#080d16] border border-[#1c273c] text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Safety Guardrail Notice */}
          <div className="p-4 rounded-xl bg-[#070b12] border border-[#1c273c] text-xs text-slate-400">
            <strong className="text-slate-200">Compliance Notice:</strong> QuantIQ AI operates under strict programmatic guidelines. It does not provide buy/sell recommendations, investment advice, or predict market trajectory. All insights are descriptive mathematical assessments of backtested historical distributions.
          </div>
        </div>
      ) : null}
    </div>
  );
};
