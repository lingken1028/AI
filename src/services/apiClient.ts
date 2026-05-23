import { StockSymbol, RealTimeAnalysis, BacktestResult, BacktestStrategy, BacktestPeriod, Timeframe } from '../types';

export const lookupStockSymbol = async (query: string): Promise<StockSymbol> => {
  const res = await fetch('/api/stock/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || '查询股票代码失败');
  }
  return res.json();
};

export const analyzeMarketData = async (
  symbol: string,
  timeframe: Timeframe,
  currentPrice: number,
  imageBase64?: string,
  isLockedPrice: boolean = false
): Promise<RealTimeAnalysis> => {
  const res = await fetch('/api/stock/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, timeframe, currentPrice, imageBase64, isLockedPrice }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || '智能分析失败');
  }
  return res.json();
};

export const performBacktest = async (
  symbol: string,
  strategy: BacktestStrategy,
  period: BacktestPeriod
): Promise<BacktestResult> => {
  const res = await fetch('/api/stock/backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, strategy, period }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || '策略回测失败');
  }
  return res.json();
};
