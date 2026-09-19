import React, { useState } from "react";
import { Settings, Shield, DollarSign, Database, Check, Sliders, Cpu } from "lucide-react";

interface SettingsPageProps {
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isDemoMode, setIsDemoMode }) => {
  const [riskFreeRate, setRiskFreeRate] = useState<number>(4.0);
  const [txCost, setTxCost] = useState<number>(0.10);
  const [slippage, setSlippage] = useState<number>(0.05);
  const [currency, setCurrency] = useState<string>("USD");
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#1c273c] pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">System Settings</h1>
          <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded">
            CALIBRATION & TERMINAL DEFAULTS
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Configure baseline quantitative parameters, benchmark risk-free hurdle rate, and data provider mode
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Quantitative settings successfully updated in active session.</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-5">
        {/* Data Provider Mode */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Market Data Engine</h3>
          </div>
          <p className="text-xs text-slate-400">
            Select between seeded deterministic multi-year historical dataset (offline guaranteed) or live market API feeds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => setIsDemoMode(true)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isDemoMode
                  ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                  : "bg-[#080d16] border-[#1c273c] text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">Deterministic Demo Feed</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">
                Seeded multi-year OHLCV for Gold, Bitcoin, NVIDIA, and NIFTY 50. Requires zero external API keys.
              </p>
            </div>

            <div
              onClick={() => setIsDemoMode(false)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                !isDemoMode
                  ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                  : "bg-[#080d16] border-[#1c273c] text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">Live External Provider</span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              </div>
              <p className="text-[11px] text-slate-400">
                Connect via ALPHA_VANTAGE_API_KEY or FINNHUB_API_KEY in backend .env.
              </p>
            </div>
          </div>
        </div>

        {/* Quantitative Parameters */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Financial Calibration Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[#080d16] border border-[#1c273c] space-y-1.5">
              <span className="text-slate-400 block text-[10px]">ANNUAL RISK-FREE RATE (%)</span>
              <input
                type="number"
                step="0.25"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2.5 py-1.5 outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 block">Baseline hurdle rate for Sharpe & Sortino ratios (Default 4.0%)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080d16] border border-[#1c273c] space-y-1.5">
              <span className="text-slate-400 block text-[10px]">TRANSACTION FEE (%)</span>
              <input
                type="number"
                step="0.01"
                value={txCost}
                onChange={(e) => setTxCost(Number(e.target.value))}
                className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2.5 py-1.5 outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 block">Round-trip commission model per trade (Default 0.10%)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080d16] border border-[#1c273c] space-y-1.5">
              <span className="text-slate-400 block text-[10px]">EXECUTION SLIPPAGE (%)</span>
              <input
                type="number"
                step="0.01"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2.5 py-1.5 outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 block">Adverse price excursion on market orders (Default 0.05%)</span>
            </div>
          </div>
        </div>

        {/* Currency & Appearance */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Currency & Display Interface</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#080d16] border border-[#1c273c] space-y-1.5">
              <span className="text-slate-400 block text-[10px]">BENCHMARK BASE CURRENCY</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0c121e] text-white border border-[#1c273c] rounded px-2.5 py-1.5 outline-none font-bold"
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080d16] border border-[#1c273c] space-y-1.5">
              <span className="text-slate-400 block text-[10px]">THEME PRESET</span>
              <div className="text-cyan-400 font-bold py-1.5">
                Dark Institutional Terminal (Obsidian #06090E)
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
