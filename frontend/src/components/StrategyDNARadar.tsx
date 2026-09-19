import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from "recharts";
import { Dna, Info } from "lucide-react";
import type { StrategyDNA } from "../types";

interface StrategyDNARadarProps {
  dna: StrategyDNA;
  strategyName: string;
}

export const StrategyDNARadar: React.FC<StrategyDNARadarProps> = ({ dna, strategyName }) => {
  const radarData = [
    { subject: "Trading Freq", value: dna.trading_frequency, fullMark: 100 },
    { subject: "Trend Sens", value: dna.trend_sensitivity, fullMark: 100 },
    { subject: "Vol Sens", value: dna.volatility_sensitivity, fullMark: 100 },
    { subject: "DD Resilience", value: dna.drawdown_resilience, fullMark: 100 },
    { subject: "Hold Duration", value: dna.holding_duration, fullMark: 100 },
    { subject: "Signal Precision", value: dna.signal_precision, fullMark: 100 },
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#0c121e] border border-[#1c273c] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#1c273c] pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Strategy DNA Fingerprint</h3>
            <p className="text-[11px] text-slate-400">Behavioral risk & style classification</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          6-AXIS RADAR
        </span>
      </div>

      <div className="h-64 w-full font-mono text-[11px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#1c273c" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#090e18",
                borderColor: "#1c273c",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "11px"
              }}
              formatter={(val: any) => [`${val}/100`, "DNA Score"]}
            />
            <Radar
              name={strategyName}
              dataKey="value"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-[#1c273c] grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
        <div className="bg-[#080d16] p-1.5 rounded border border-[#1c273c]">
          <span className="text-slate-400 block">TREND SENS</span>
          <span className="text-cyan-400 font-bold">{dna.trend_sensitivity}</span>
        </div>
        <div className="bg-[#080d16] p-1.5 rounded border border-[#1c273c]">
          <span className="text-slate-400 block">DD RESILIENCE</span>
          <span className="text-emerald-400 font-bold">{dna.drawdown_resilience}</span>
        </div>
        <div className="bg-[#080d16] p-1.5 rounded border border-[#1c273c]">
          <span className="text-slate-400 block">SIGNAL PREC</span>
          <span className="text-amber-400 font-bold">{dna.signal_precision}</span>
        </div>
      </div>
    </div>
  );
};
