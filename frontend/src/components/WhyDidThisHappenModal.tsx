import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, TrendingDown, ArrowUpRight, Activity, Layers, CheckCircle } from "lucide-react";
import { api } from "../services/api";
import type { AttributionResponse } from "../types";

interface WhyDidThisHappenModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  strategy: string;
  eventType: string;
  targetDate?: string;
}

export const WhyDidThisHappenModal: React.FC<WhyDidThisHappenModalProps> = ({
  isOpen,
  onClose,
  symbol,
  strategy,
  eventType,
  targetDate
}) => {
  const [data, setData] = useState<AttributionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<string>(eventType || "max_drawdown");

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.getAttribution(symbol, strategy, selectedEvent, targetDate);
        if (isMounted) setData(res);
      } catch (err) {
        console.error("Attribution fetch error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [isOpen, symbol, strategy, selectedEvent, targetDate]);

  if (!isOpen) return null;

  const eventOptions = [
    { id: "max_drawdown", label: "Maximum Drawdown" },
    { id: "biggest_gain", label: "Peak Single-Day Gain" },
    { id: "biggest_loss", label: "Largest Single-Day Drop" },
    { id: "volatility_spike", label: "Volatility Shock Event" },
    { id: "regime_flip", label: "Macro Regime Shift" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#090e18] border border-[#1c273c] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1c273c] flex items-center justify-between bg-[#0c121e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Why Did This Happen?</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Forensic Attribution
                </span>
              </div>
              <p className="text-xs text-slate-400">Contextual technical & macro event analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#152035]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Type Selector Buttons */}
        <div className="p-3 bg-[#070b12] border-b border-[#1c273c] flex items-center gap-1.5 overflow-x-auto">
          {eventOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedEvent(opt.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                selectedEvent === opt.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white bg-[#0c121e] border border-[#1c273c]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-xs font-mono text-cyan-400">
              Deconstructing historical execution bars and indicators...
            </div>
          ) : data ? (
            <>
              {/* Event Title Banner */}
              <div className="p-4 rounded-xl bg-[#0c121e] border border-[#1c273c]">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>HISTORICAL DATE: <strong className="text-cyan-400">{data.date}</strong></span>
                  <span>ASSET: <strong className="text-white">{data.symbol}</strong></span>
                </div>
                <h3 className="text-base font-bold text-white">{data.event_title}</h3>
              </div>

              {/* Data Snapshot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1c273c]">
                  <span className="text-[10px] text-slate-400 block">ASSET PRICE</span>
                  <span className="text-white font-bold">${data.price_level.toLocaleString()}</span>
                  <span className={`block text-[10px] ${data.price_change_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {data.price_change_pct >= 0 ? `+${data.price_change_pct}%` : `${data.price_change_pct}%`}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1c273c]">
                  <span className="text-[10px] text-slate-400 block">VOLATILITY</span>
                  <span className="text-amber-300 font-bold">{data.rolling_volatility_pct}%</span>
                  <span className="text-[10px] text-slate-400 block">21-Day Rolling</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1c273c]">
                  <span className="text-[10px] text-slate-400 block">STRATEGY SIGNAL</span>
                  <span className="text-cyan-400 font-bold">{data.strategy_signal}</span>
                  <span className="text-[10px] text-slate-400 block">{data.strategy_position}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0c121e] border border-[#1c273c]">
                  <span className="text-[10px] text-slate-400 block">MARKET REGIME</span>
                  <span className="text-emerald-400 font-bold">{data.market_regime}</span>
                  <span className="text-[10px] text-slate-400 block">Trend Classification</span>
                </div>
              </div>

              {/* Quantitative Narrative */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c121e] to-[#121c2e] border border-cyan-500/30">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Quantitative Deconstruction</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.narrative_explanation}
                </p>
              </div>

              {/* Key Drivers List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identified Contributing Drivers</h4>
                <div className="space-y-1.5">
                  {data.key_drivers.map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-lg bg-[#0c121e] border border-[#1c273c]">
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c121e] border-t border-[#1c273c] flex items-center justify-between text-xs text-slate-400">
          <span>All metrics calculated deterministically without lookahead.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
          >
            Close Deconstruction
          </button>
        </div>
      </div>
    </div>
  );
};
