import { Timeframe, StockSymbol } from './types';

export const DEFAULT_WATCHLIST: StockSymbol[] = [
  { symbol: 'SSE:600519', name: '贵州茅台 (Kweichow Moutai)', currentPrice: 1705.00 },
  { symbol: 'SZSE:300750', name: '宁德时代 (CATL)', currentPrice: 195.50 },
  { symbol: 'NASDAQ:NVDA', name: 'NVIDIA Corp', currentPrice: 880.50 },
  { symbol: 'NASDAQ:TSLA', name: 'Tesla Inc', currentPrice: 175.30 },
  { symbol: 'NASDAQ:AAPL', name: 'Apple Inc', currentPrice: 170.10 },
  { symbol: 'NASDAQ:AMD', name: 'Advanced Micro Devices', currentPrice: 180.00 },
  { symbol: 'NASDAQ:MSFT', name: 'Microsoft Corp', currentPrice: 420.00 },
  { symbol: 'NASDAQ:COIN', name: 'Coinbase Global', currentPrice: 250.00 },
  { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', currentPrice: 65000.00 },
];

export const TIMEFRAMES = [
  Timeframe.M1,
  Timeframe.M3,
  Timeframe.M5,
  Timeframe.M15,
  Timeframe.M30,
  Timeframe.H1,
  Timeframe.H2,
  Timeframe.H4,
  Timeframe.D1
];

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(val);
};

export const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};