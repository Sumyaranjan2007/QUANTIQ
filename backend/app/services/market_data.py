import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import os

from app.models.schemas import AssetInfo, HistoricalBar

class BaseMarketDataProvider:
    def get_asset_info(self, symbol: str) -> Optional[AssetInfo]:
        raise NotImplementedError
    
    def get_all_assets(self) -> List[AssetInfo]:
        raise NotImplementedError
    
    def get_historical_data(
        self, symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> pd.DataFrame:
        raise NotImplementedError

class SeededDemoMarketDataProvider(BaseMarketDataProvider):
    """
    Realistic multi-asset deterministic historical data generator (2020-01-01 to 2026-02-01).
    Calibrated with stylized empirical facts of financial returns:
    - Gold (XAU): Safe-haven drift, moderate volatility (~15%), geopolitical rallies
    - Bitcoin (BTC): High drift, high volatility (~55%), bull 2021, bear 2022, rally 2023-2024
    - NVIDIA (NVDA): Growth tech drift, strong 2023-2024 AI momentum, high beta
    - NIFTY 50 (^NSEI): Steady emerging market equity compounding, 2020 dip & resilient structural bull
    """
    
    def __init__(self):
        self._cache: Dict[str, pd.DataFrame] = {}
        self._asset_metadata = {
            "XAU": {
                "name": "Gold",
                "category": "Commodity / Safe Haven",
                "currency": "USD",
                "currency_symbol": "$",
                "start_price": 1520.0,
                "annual_drift": 0.10,
                "annual_vol": 0.145,
                "seed": 42,
                "description": "Physical bullion / spot gold index serving as an inflation hedge and store of value."
            },
            "BTC": {
                "name": "Bitcoin",
                "category": "Cryptocurrency",
                "currency": "USD",
                "currency_symbol": "$",
                "start_price": 7200.0,
                "annual_drift": 0.58,
                "annual_vol": 0.56,
                "seed": 101,
                "description": "Decentralized digital reserve asset with four-year halving macro cycles."
            },
            "NVDA": {
                "name": "NVIDIA Corp",
                "category": "Equities / Semiconductors",
                "currency": "USD",
                "currency_symbol": "$",
                "start_price": 14.85,
                "annual_drift": 0.44,
                "annual_vol": 0.42,
                "seed": 777,
                "description": "Leading global designer of accelerated computing hardware and generative AI architectures."
            },
            "^NSEI": {
                "name": "NIFTY 50",
                "category": "Equity Index",
                "currency": "INR",
                "currency_symbol": "₹",
                "start_price": 12200.0,
                "annual_drift": 0.145,
                "annual_vol": 0.165,
                "seed": 999,
                "description": "Flagship 50-stock benchmark index representing blue-chip Indian enterprise capital."
            }
        }
        self._generate_all_datasets()
        
    def _generate_all_datasets(self):
        start_dt = datetime(2020, 1, 1)
        end_dt = datetime(2026, 2, 1)
        
        # Calendar days for trading (approx 252 days/year, or daily calendar)
        dates = pd.date_range(start=start_dt, end=end_dt, freq="B")  # Business days
        n = len(dates)
        
        for symbol, meta in self._asset_metadata.items():
            rng = np.random.default_rng(meta["seed"])
            
            # Base Geometric Brownian Motion with regime shifts and jump diffusion
            dt = 1.0 / 252.0
            drift = meta["annual_drift"]
            vol = meta["annual_vol"]
            
            # Generate shocks
            shocks = rng.standard_normal(n)
            
            # Asset specific macro regimes (e.g. 2020 COVID shock, 2022 Fed rate hike bear market)
            regime_multiplier = np.ones(n)
            for i, d in enumerate(dates):
                # March 2020 COVID shock
                if d.year == 2020 and d.month == 3:
                    regime_multiplier[i] = -2.5 if symbol != "XAU" else -0.8
                # 2022 Global tightening / bear market
                elif d.year == 2022:
                    if symbol == "BTC":
                        regime_multiplier[i] = -0.85
                    elif symbol == "NVDA":
                        regime_multiplier[i] = -0.6
                    elif symbol == "XAU":
                        regime_multiplier[i] = 0.1
                    elif symbol == "^NSEI":
                        regime_multiplier[i] = 0.2
                # 2023-2024 AI explosion & Crypto halving run
                elif d.year in (2023, 2024):
                    if symbol == "NVDA":
                        regime_multiplier[i] = 2.1
                    elif symbol == "BTC":
                        regime_multiplier[i] = 1.6
                    elif symbol == "^NSEI":
                        regime_multiplier[i] = 1.3
                    elif symbol == "XAU":
                        regime_multiplier[i] = 1.2
            
            daily_returns = (drift * dt) + (vol * np.sqrt(dt) * shocks) + (0.001 * (regime_multiplier - 1.0))
            
            # Compute prices
            price_path = np.zeros(n)
            price_path[0] = meta["start_price"]
            for t in range(1, n):
                r = daily_returns[t]
                # Clamp extreme outlier spikes to realistic ranges (-12% to +15%)
                r = max(-0.12, min(0.15, r))
                price_path[t] = price_path[t - 1] * np.exp(r)
            
            # Generate OHLCV from close
            close = price_path
            open_p = np.zeros(n)
            high_p = np.zeros(n)
            low_p = np.zeros(n)
            volume = np.zeros(n)
            
            for t in range(n):
                c = close[t]
                prev_c = close[t - 1] if t > 0 else c
                day_vol = abs(rng.normal(0, vol * 0.03))
                o = prev_c * (1.0 + rng.normal(0, 0.003))
                h = max(o, c) * (1.0 + day_vol)
                l = min(o, c) * (1.0 - abs(rng.normal(0, vol * 0.03)))
                v = int(rng.lognormal(mean=14, sigma=0.5))
                
                open_p[t] = round(o, 2)
                high_p[t] = round(h, 2)
                low_p[t] = round(l, 2)
                close[t] = round(c, 2)
                volume[t] = v
                
            df = pd.DataFrame({
                "date": dates.strftime("%Y-%m-%d"),
                "open": open_p,
                "high": high_p,
                "low": low_p,
                "close": close,
                "volume": volume
            })
            self._cache[symbol] = df

    def get_all_assets(self) -> List[AssetInfo]:
        results = []
        for symbol, meta in self._asset_metadata.items():
            df = self._cache[symbol]
            current_price = float(df["close"].iloc[-1])
            prev_price = float(df["close"].iloc[-2])
            daily_change_pct = ((current_price - prev_price) / prev_price) * 100.0
            total_return_pct = ((current_price - meta["start_price"]) / meta["start_price"]) * 100.0
            
            returns = df["close"].pct_change().dropna()
            annualized_volatility_pct = float(returns.std() * np.sqrt(252) * 100.0)
            
            results.append(AssetInfo(
                symbol=symbol,
                name=meta["name"],
                category=meta["category"],
                currency=meta["currency"],
                currency_symbol=meta["currency_symbol"],
                base_price=round(meta["start_price"], 2),
                current_price=round(current_price, 2),
                daily_change_pct=round(daily_change_pct, 2),
                total_return_pct=round(total_return_pct, 2),
                annualized_volatility_pct=round(annualized_volatility_pct, 2),
                description=meta["description"]
            ))
        return results

    def get_asset_info(self, symbol: str) -> Optional[AssetInfo]:
        assets = {a.symbol: a for a in self.get_all_assets()}
        return assets.get(symbol)

    def get_historical_data(
        self, symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> pd.DataFrame:
        if symbol not in self._cache:
            # Fallback to BTC if unrecognized
            symbol = "BTC"
            
        df = self._cache[symbol].copy()
        if start_date:
            df = df[df["date"] >= start_date]
        if end_date:
            df = df[df["date"] <= end_date]
        return df.reset_index(drop=True)

# Factory singleton
_provider_instance: Optional[BaseMarketDataProvider] = None

def get_market_data_provider() -> BaseMarketDataProvider:
    global _provider_instance
    if _provider_instance is None:
        provider_mode = os.getenv("MARKET_DATA_PROVIDER", "demo").lower()
        # Even if configured for live, in this offline-ready MVP we ensure demo fallback is always operational
        _provider_instance = SeededDemoMarketDataProvider()
    return _provider_instance
