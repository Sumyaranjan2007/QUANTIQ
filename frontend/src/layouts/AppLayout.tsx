import React, { useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  Cpu,
  PlaySquare,
  PieChart,
  ShieldAlert,
  GitMerge,
  FlaskConical,
  Layers,
  Sparkles,
  Settings,
  Menu,
  X,
  Bot,
  Activity,
  Calendar,
  Layers3
} from "lucide-react";

interface AppLayoutProps {
  activePage: string;
  setActivePage: (page: string) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
  onOpenAIAssistant: () => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activePage,
  setActivePage,
  selectedSymbol,
  setSelectedSymbol,
  selectedDateRange,
  setSelectedDateRange,
  onOpenAIAssistant,
  isDemoMode,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "market_analysis", label: "Market Analysis", icon: LineChart },
    { id: "quant_engine", label: "Quant Engine", icon: Cpu },
    { id: "strategy_lab", label: "Strategy Lab", icon: FlaskConical },
    { id: "backtesting", label: "Backtesting", icon: PlaySquare },
    { id: "risk_analysis", label: "Risk Analysis", icon: ShieldAlert },
    { id: "correlation", label: "Correlation", icon: GitMerge },
    { id: "market_regimes", label: "Market Regimes", icon: Layers },
    { id: "portfolio", label: "Portfolio Lab", icon: PieChart },
    { id: "ai_insights", label: "AI Insights", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const assets = [
    { symbol: "BTC", name: "Bitcoin", tag: "Crypto" },
    { symbol: "XAU", name: "Gold", tag: "Commodity" },
    { symbol: "NVDA", name: "NVIDIA", tag: "Equity" },
    { symbol: "^NSEI", name: "NIFTY 50", tag: "Index" }
  ];

  const dateRanges = ["1M", "3M", "6M", "1Y", "3Y", "ALL"];

  return (
    <div className="flex h-screen bg-[#06090e] text-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 w-64 bg-[#080d16] border-r border-[#1c273c] flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Branding */}
        <div className="p-5 border-b border-[#1c273c] flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActivePage("landing")}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-wider text-white">QUANTIQ</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight">Quantitative Intelligence</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Intelligence Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0e1626]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"
                  }`}
                />
                <span>{item.label}</span>
                {item.id === "strategy_lab" && (
                  <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">
                    Lab
                  </span>
                )}
                {item.id === "ai_insights" && (
                  <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20 font-bold">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Data Status / Mode Footer */}
        <div className="p-4 border-t border-[#1c273c] bg-[#070b12]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Feed Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">
                {isDemoMode ? "Seeded Demo Data" : "Live Market Feed"}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Deterministic historical datasets loaded (2020–2026). Zero lookahead bias.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-16 border-b border-[#1c273c] bg-[#090e18]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-md hover:bg-[#121b2c]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Asset Selector Pills */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#080d16] p-1 rounded-lg border border-[#1c273c]">
              {assets.map((a) => (
                <button
                  key={a.symbol}
                  onClick={() => setSelectedSymbol(a.symbol)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedSymbol === a.symbol
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#131d30]"
                  }`}
                >
                  <span>{a.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Tools: Date Range + AI Assistant Trigger */}
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="hidden md:flex items-center gap-1 bg-[#080d16] p-1 rounded-lg border border-[#1c273c]">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              {dateRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedDateRange(r)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                    selectedDateRange === r
                      ? "bg-[#1f2e48] text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/30 to-cyan-600/30 border border-violet-500/40 text-violet-200 hover:text-white hover:border-violet-400 transition-all shadow-sm hover:shadow-violet-500/20"
            >
              <Bot className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold hidden sm:inline">AI Quant Assistant</span>
            </button>

            {/* Landing page link */}
            <button
              onClick={() => setActivePage("landing")}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#121b2c]"
              title="Return to Landing Overview"
            >
              <Layers3 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto bg-[#06090e] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
