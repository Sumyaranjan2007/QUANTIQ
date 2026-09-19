import React, { useState } from "react";
import { X, Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import type { AIChatMessage } from "../types";

interface AIQuantAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol: string;
}

export const AIQuantAssistantDrawer: React.FC<AIQuantAssistantDrawerProps> = ({
  isOpen,
  onClose,
  selectedSymbol
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I am QuantIQ AI, your quantitative finance assistant. Ask me about your ${selectedSymbol} backtests, maximum drawdowns, volatility clustering, or correlation matrix.`
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const suggestedPrompts = [
    "What caused the largest drawdown?",
    "Why did my strategy underperform?",
    "How volatile was this asset?",
    "Compare the strategies.",
    "Explain the correlation matrix."
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const newMessages: AIChatMessage[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.sendAIChat(newMessages, {
        symbol: selectedSymbol,
        strategy: "SMA Crossover (20/50)",
        total_return_pct: 124.5,
        benchmark_return_pct: 86.2,
        sharpe_ratio: 1.68,
        max_drawdown_pct: -19.4,
        volatility_pct: 28.2,
        total_trades: 18,
        win_rate_pct: 61.1
      });

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: res.message,
          active_agents: res.active_agents,
          critic_confidence: res.critic_confidence
        }
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue analyzing the current quantitative telemetry. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md bg-[#090e18] border-l border-[#1c273c] h-full flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#1c273c] bg-[#0c121e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">QuantIQ AI Assistant</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-bold">
                  MULTI-AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Ask about current strategy metrics & risk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#152035]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="p-3 bg-[#070b12] border-b border-[#1c273c] overflow-x-auto flex items-center gap-1.5">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 text-[11px] font-mono whitespace-nowrap rounded-md bg-[#0c121e] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 border border-[#1c273c] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-6 h-6 rounded-md bg-violet-600/30 text-violet-300 flex items-center justify-center shrink-0 mt-0.5 border border-violet-500/30">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-[85%] ${
                  m.role === "user"
                    ? "bg-cyan-500 text-slate-950 font-medium"
                    : "bg-[#0c121e] border border-[#1c273c] text-slate-200"
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {m.role === "assistant" && m.active_agents && m.active_agents.length > 0 && (
                  <details className="mt-2.5 pt-2 border-t border-[#1c273c] text-[10px] font-mono text-slate-400 group">
                    <summary className="cursor-pointer hover:text-cyan-400 select-none flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Analysis powered by multiple agents</span>
                      <span className="text-[9px] text-cyan-400">({m.active_agents.length} active)</span>
                    </summary>
                    <div className="mt-2 space-y-1 pl-1 bg-[#080d16] p-2 rounded border border-[#1c273c]/50">
                      {m.active_agents.map((agent, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{agent}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              {m.role === "user" && (
                <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing backtest data & regime parameters...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#1c273c] bg-[#0c121e]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${selectedSymbol} strategy or drawdown...`}
              className="flex-1 bg-[#080d16] border border-[#1c273c] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            Non-advisory analytical engine. Fallback works offline 100%.
          </div>
        </div>
      </div>
    </div>
  );
};
