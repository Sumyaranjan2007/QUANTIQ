import React, { useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MarketAnalysisPage } from "./pages/MarketAnalysisPage";
import { QuantEnginePage } from "./pages/QuantEnginePage";
import { StrategyLabPage } from "./pages/StrategyLabPage";
import { RiskAnalysisPage } from "./pages/RiskAnalysisPage";
import { CorrelationPage } from "./pages/CorrelationPage";
import { MarketRegimesPage } from "./pages/MarketRegimesPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { AIInsightsPage } from "./pages/AIInsightsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AIQuantAssistantDrawer } from "./components/AIQuantAssistantDrawer";

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>("landing");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("ALL");
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Quick 3-5 minute demo sequence runner
  const handleExploreDemo = () => {
    setActivePage("dashboard");
    setSelectedSymbol("BTC");
  };

  // If on Landing Page, render full screen landing view
  if (activePage === "landing") {
    return (
      <>
        <LandingPage
          onLaunchDashboard={() => setActivePage("dashboard")}
          onExploreDemo={handleExploreDemo}
        />
        <AIQuantAssistantDrawer
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          selectedSymbol={selectedSymbol}
        />
      </>
    );
  }

  return (
    <AppLayout
      activePage={activePage}
      setActivePage={setActivePage}
      selectedSymbol={selectedSymbol}
      setSelectedSymbol={setSelectedSymbol}
      selectedDateRange={selectedDateRange}
      setSelectedDateRange={setSelectedDateRange}
      onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      isDemoMode={isDemoMode}
      setIsDemoMode={setIsDemoMode}
    >
      {/* Route Switch */}
      {activePage === "dashboard" && (
        <DashboardPage
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
          selectedDateRange={selectedDateRange}
          onNavigateToStrategy={() => setActivePage("strategy_lab")}
          onNavigateToRisk={() => setActivePage("risk_analysis")}
        />
      )}

      {activePage === "market_analysis" && (
        <MarketAnalysisPage selectedSymbol={selectedSymbol} />
      )}

      {activePage === "quant_engine" && (
        <QuantEnginePage selectedSymbol={selectedSymbol} />
      )}

      {(activePage === "strategy_lab" || activePage === "backtesting") && (
        <StrategyLabPage
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
        />
      )}

      {activePage === "risk_analysis" && (
        <RiskAnalysisPage selectedSymbol={selectedSymbol} />
      )}

      {activePage === "correlation" && (
        <CorrelationPage />
      )}

      {activePage === "market_regimes" && (
        <MarketRegimesPage selectedSymbol={selectedSymbol} />
      )}

      {activePage === "portfolio" && (
        <PortfolioPage />
      )}

      {activePage === "ai_insights" && (
        <AIInsightsPage
          selectedSymbol={selectedSymbol}
          onOpenAssistant={() => setIsAIAssistantOpen(true)}
        />
      )}

      {activePage === "settings" && (
        <SettingsPage
          isDemoMode={isDemoMode}
          setIsDemoMode={setIsDemoMode}
        />
      )}

      {/* Floating AI Quant Assistant Drawer */}
      <AIQuantAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        selectedSymbol={selectedSymbol}
      />
    </AppLayout>
  );
};

export default App;
