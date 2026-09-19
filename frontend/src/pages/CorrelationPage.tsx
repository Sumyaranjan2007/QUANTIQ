import React, { useState, useEffect } from "react";
import { GitMerge, RefreshCw, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import type { CorrelationResponse } from "../types";

export const CorrelationPage: React.FC = () => {
  const [data, setData] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const symbols = ["XAU", "BTC", "NVDA", "^NSEI"];
  const assetLabels: Record<string, string> = {
    XAU: "Gold (XAU)",
    BTC: "Bitcoin (BTC)",
    NVDA: "NVIDIA (NVDA)",
    "^NSEI": "NIFTY 50 (^NSEI)"
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getCorrelation(symbols);
        if (isMounted) setData(res);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load correlation matrix.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const getHeatmapColor = (val: number) => {
    if (val === 1.0) return "bg-cyan-500/80 text-slate-950 font-extrabold";
    if (val >= 0.5) return "bg-cyan-600/60 text-white font-bold";
    if (val >= 0.25) return "bg-teal-700/50 text-teal-100 font-semibold";
    if (val >= 0.05) return "bg-slate-800 text-slate-200";
    if (val >= -0.1) return "bg-slate-900 text-slate-400";
    if (val >= -0.3) return "bg-rose-950/70 text-rose-300";
    return "bg-rose-900/80 text-rose-100 font-bold";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c273c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Correlation Analysis</h1>
            <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded">
              PEARSON CO-MOVEMENT MATRIX
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Empirical multi-asset daily return correlation assessing portfolio diversification efficiency
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0c121e] px-3.5 py-1.5 rounded-lg border border-[#1c273c] text-xs font-mono text-slate-400">
          <GitMerge className="w-4 h-4 text-cyan-400" />
          <span>Cross-Asset Matrix: 4x4 Universe</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Heatmap Card */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-[#1c273c]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1c273c] pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Cross-Asset Pearson Correlation Heatmap</h2>
            <p className="text-xs text-slate-400 mt-0.5">Calculated from historical daily log returns</p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-400">Scale:</span>
            <span className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-100">-1.0 (Inverse)</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">0.0 (Uncorrelated)</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/80 text-slate-950 font-bold">+1.0 (Direct)</span>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="font-mono">Computing correlation matrix across assets...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr>
                  <th className="p-3 text-left font-bold text-slate-400 border-b border-[#1c273c]">ASSET</th>
                  {symbols.map((s) => (
                    <th key={s} className="p-3 text-center font-bold text-white border-b border-[#1c273c]">
                      {assetLabels[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {symbols.map((rowSym) => (
                  <tr key={rowSym} className="border-b border-[#1c273c]/50">
                    <td className="p-3 font-bold text-slate-300 whitespace-nowrap bg-[#080d16]/50">
                      {assetLabels[rowSym]}
                    </td>
                    {symbols.map((colSym) => {
                      const val = data?.matrix?.[rowSym]?.[colSym] ?? 0;
                      return (
                        <td key={colSym} className="p-2 text-center">
                          <div
                            className={`py-3 px-2 rounded-lg transition-all duration-150 ${getHeatmapColor(val)}`}
                          >
                            <span className="text-xs">
                              {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic Correlation Insight Card */}
      {data && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c121e] to-[#0f172a] border border-cyan-500/30 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Dynamic Quantitative Correlation Insight</span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed max-w-4xl mb-4">
            {data.insight_text}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#1c273c] text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
              <span className="text-slate-400">Highest Co-movement:</span>
              <span className="text-cyan-400 font-bold">
                {data.highest_pair.pair} ({data.highest_pair.correlation > 0 ? `+${data.highest_pair.correlation}` : data.highest_pair.correlation})
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#080d16] border border-[#1c273c]">
              <span className="text-slate-400">Strongest Diversifier:</span>
              <span className="text-emerald-400 font-bold">
                {data.lowest_pair.pair} ({data.lowest_pair.correlation > 0 ? `+${data.lowest_pair.correlation}` : data.lowest_pair.correlation})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
