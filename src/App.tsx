import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Clock, Menu, Search, TrendingUp, TrendingDown, X, Trash2, Plus, Loader2, BarChart2, ChevronUp, ChevronDown, Edit2, Check, Navigation, Target, ShieldAlert, Layers, Lock, Unlock, HelpCircle, Camera, Image as ImageIcon, RotateCw, Coins, CandlestickChart, Wallet, Bell, Sparkles } from 'lucide-react';
import StockChart from './components/StockChart';
import AnalysisCard from './components/AnalysisCard';
import BacktestModal from './components/BacktestModal';
import { Timeframe, AIAnalysis, StockSymbol, RealTimeAnalysis, PaperAccount, PaperPosition } from './types';
import { DeepMiningDashboard } from './components/DeepMiningDashboard';
import { TIMEFRAMES, formatCurrency, DEFAULT_WATCHLIST } from './constants';
import { analyzeMarketData, lookupStockSymbol } from './services/apiClient';

const App: React.FC = () => {
  // Initial state is false (Hidden by default)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // 1. PERSISTENCE: Initialize from localStorage if available
  const [watchlist, setWatchlist] = useState<StockSymbol[]>(() => {
    try {
      const saved = localStorage.getItem('tradeGuard_watchlist');
      return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    } catch (e) {
      return DEFAULT_WATCHLIST;
    }
  });

  const [selectedSymbol, setSelectedSymbol] = useState(watchlist[0] || DEFAULT_WATCHLIST[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(Timeframe.M15);
  
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPrice, setCurrentPrice] = useState<number>(selectedSymbol.currentPrice);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);

  // --- SUB-PANEL ACTIVE TAB ---
  const [activeTab, setActiveTab ] = useState<'chart' | 'deep-mining'>('chart');
  const [currentPricesMap, setCurrentPricesMap] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'danger' | 'info' }[]>([]);

  const [paperAccount, setPaperAccount] = useState<PaperAccount>(() => {
    try {
      const saved = localStorage.getItem('tradeGuard_paper_account');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.positions)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse paper account from localStorage", e);
    }
    return {
      balance: 100000,
      initialBalance: 100000,
      positions: [],
      history: [],
      equityHistory: [{ timestamp: Date.now(), equity: 100000, balance: 100000 }]
    };
  });

  // PERSISTENCE: Save paper trading account whenever it changes
  useEffect(() => {
    localStorage.setItem('tradeGuard_paper_account', JSON.stringify(paperAccount));
  }, [paperAccount]);

  // Sync selected symbol's currentPrice with currentPricesMap
  useEffect(() => {
    if (selectedSymbol.symbol && currentPrice) {
      setCurrentPricesMap(prev => ({
        ...prev,
        [selectedSymbol.symbol]: currentPrice
      }));
    }
  }, [selectedSymbol.symbol, currentPrice]);

  // Push custom visual notification
  const addNotification = useCallback((message: string, type: 'success' | 'danger' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  // Price Editing State
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isPriceManuallySet, setIsPriceManuallySet] = useState(false); // NEW: Track if user locked the price
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false); // NEW: Track manual refresh loading state
  const [tempPriceInput, setTempPriceInput] = useState('');
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Multimodal State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIX: Ref to track locked state for async operations to prevent race conditions
  const isLockedRef = useRef(isPriceManuallySet);
  
  // FIX: Ref to track current symbol to prevent cross-talk race conditions
  const selectedSymbolRef = useRef(selectedSymbol);

  // Sync Ref with State
  useEffect(() => {
    isLockedRef.current = isPriceManuallySet;
  }, [isPriceManuallySet]);
  
  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol;
  }, [selectedSymbol]);

  // 2. PERSISTENCE: Save to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem('tradeGuard_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Ensure currentPrice updates when selectedSymbol changes (Safety fallback)
  useEffect(() => {
    // Only update if currentPrice is wildly different (e.g. initial load) to prevent overriding the optimistic update in handleStockSelect
    if (selectedSymbol.currentPrice !== currentPrice && !isPriceManuallySet) {
        setCurrentPrice(selectedSymbol.currentPrice);
    }
    setIsEditingPrice(false);
    // Note: We do NOT reset isPriceManuallySet here because handleStockSelect handles it. 
    // This effect runs after render, preventing double-reset issues.
    setSelectedImage(null); // Reset image on stock switch
  }, [selectedSymbol]);

  // NEW: Silent Price Auto-Refresh Interval (Optimized to 15s for Live Feel)
  useEffect(() => {
    const intervalId = setInterval(() => {
        refreshAllPricesSilent();
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [selectedSymbol, isEditingPrice, paperAccount.positions]); 

  const refreshAllPricesSilent = async () => {
      // 1. Refresh currently selected stock
      if (!isLockedRef.current && !isEditingPrice) {
          await refreshPriceSilent();
      }

      // 2. Refresh active positions to trigger stop-losses / take-profits in background
      const otherSymbols = paperAccount.positions
          .map(p => p.symbol)
          .filter((sym, idx, self) => sym !== selectedSymbol.symbol && self.indexOf(sym) === idx);

      for (const sym of otherSymbols) {
          try {
              const freshData = await lookupStockSymbol(sym);
              if (freshData && freshData.currentPrice > 0) {
                  setCurrentPricesMap(prev => ({
                      ...prev,
                      [sym]: freshData.currentPrice
                  }));
              }
          } catch (e) {
              // Ignore background errors
          }
      }
  };

  const refreshPriceSilent = async () => {
      // Capture symbol at start of operation
      const targetSymbol = selectedSymbol.symbol;

      // Double check lock via Ref to prevent race conditions during async wait
      if (isLockedRef.current) return;

      try {
          const freshData = await lookupStockSymbol(targetSymbol);
          
          // CRITICAL CHECKS:
          // 1. Is lock active?
          // 2. Are we still on the same symbol? (Prevent cross-talk)
          if (isLockedRef.current) return;
          if (selectedSymbolRef.current.symbol !== targetSymbol) return;

          if (freshData && freshData.currentPrice > 0) {
              setCurrentPrice(freshData.currentPrice);
              setWatchlist(prev => prev.map(s => 
                  s.symbol === targetSymbol ? { ...s, currentPrice: freshData.currentPrice } : s
              ));
          }
      } catch (e) {
          // Ignore silent errors
      }
  };

  const refreshPriceForce = async () => {
    setIsRefreshingPrice(true);
    try {
        const freshData = await lookupStockSymbol(selectedSymbol.symbol);
        if (freshData && freshData.currentPrice > 0) {
            setCurrentPrice(freshData.currentPrice);
            setWatchlist(prev => prev.map(s => 
                s.symbol === selectedSymbol.symbol ? { ...s, currentPrice: freshData.currentPrice } : s
            ));
            if (isEditingPrice) {
                setTempPriceInput(freshData.currentPrice.toString());
            }
        }
    } catch (e) {
        console.error("Force refresh failed", e);
    } finally {
        setIsRefreshingPrice(false);
    }
  };

  // Function to handle stock selection with Auto-Refresh Price
  const handleStockSelect = async (stock: StockSymbol) => {
      // FIX: Prevent re-selecting the same stock from resetting the lock
      if (stock.symbol === selectedSymbol.symbol) return;

      // 1. Immediate UI Update (Optimistic)
      setSelectedSymbol(stock);
      setCurrentPrice(stock.currentPrice); 
      setIsPriceManuallySet(false); // Reset lock
      isLockedRef.current = false; // Immediate sync
      setAnalysis(null); // Clear old analysis
      setSelectedImage(null);
      
      // On Mobile, close sidebar on select. On Desktop, keep it open IF it was open.
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }

      // 2. Background Refresh (Silent)
      try {
          console.log(`Silent refreshing price for ${stock.symbol}...`);
          const freshData = await lookupStockSymbol(stock.symbol);
          
          // CRITICAL FIX: Check if user locked the price WHILE we were fetching
          if (isLockedRef.current) {
              console.log("User locked price during refresh, aborting update.");
              return;
          }
          // CRITICAL FIX: Check if user switched symbol again WHILE we were fetching
          if (selectedSymbolRef.current.symbol !== stock.symbol) {
              return;
          }

          if (freshData && freshData.currentPrice > 0) {
              console.log(`Price refreshed: ${freshData.currentPrice}`);
              setCurrentPrice(freshData.currentPrice);
              
              // Update watchlist with new price so next click is accurate
              setWatchlist(prev => prev.map(s => 
                  s.symbol === stock.symbol ? { ...s, currentPrice: freshData.currentPrice } : s
              ));
          }
      } catch (e) {
          console.warn("Silent price refresh failed", e);
      }
  };

  // --- AUTOMATED MARGIN & TP/SL CHECKER EFFECT ---
  useEffect(() => {
    let triggered = false;
    const updatedPositions: PaperPosition[] = [];
    const newlyClosed: PaperPosition[] = [];
    let balanceChange = 0;

    for (const pos of paperAccount.positions) {
      const price = currentPricesMap[pos.symbol] || pos.currentPrice;
      const initialSize = pos.qty * pos.entryPrice;
      const currentSize = pos.qty * price;
      const directionMult = pos.type === 'BUY' ? 1 : -1;
      const pnl = (currentSize - initialSize) * directionMult;

      let triggerCause: 'CLOSED_TP' | 'CLOSED_SL' | null = null;

      if (pos.type === 'BUY') {
        if (price >= pos.takeProfit) triggerCause = 'CLOSED_TP';
        else if (price <= pos.stopLoss) triggerCause = 'CLOSED_SL';
      } else { // SELL
        if (price <= pos.takeProfit) triggerCause = 'CLOSED_TP';
        else if (price >= pos.stopLoss) triggerCause = 'CLOSED_SL';
      }

      if (triggerCause) {
        triggered = true;
        const closedPos: PaperPosition = {
          ...pos,
          status: triggerCause,
          closedPrice: price,
          pnl,
          pnlPercent: (pnl / initialSize) * 100,
          closedAt: Date.now()
        };
        newlyClosed.push(closedPos);
        balanceChange += (initialSize + pnl); // Return collateral + profit / loss
        
        // Notify user about execution
        const sign = pos.symbol.split(':')[1] || pos.symbol;
        const formattedPnL = pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);
        const emoji = triggerCause === 'CLOSED_TP' ? '🎯' : '🛡️';
        const typeStr = triggerCause === 'CLOSED_TP' ? '触发目标止盈 (TP Hit)' : '触发止损保护 (SL Hit)';
        addNotification(
          `${emoji} [平仓结算] ${sign} ${pos.type === 'BUY' ? '做多' : '做空'}合约${typeStr}! 出场价: ${price}, 实现盈亏: ${formattedPnL} USD`,
          pnl >= 0 ? 'success' : 'danger'
        );
      } else {
        updatedPositions.push({
          ...pos,
          currentPrice: price,
          pnl,
          pnlPercent: (pnl / initialSize) * 100
        });
      }
    }

    if (triggered) {
      setPaperAccount(prev => {
        const nextBalance = prev.balance + balanceChange;
        const nextHistory = [...prev.history, ...newlyClosed];
        
        // Live equity after exit
        const nextActiveVal = updatedPositions.reduce((acc, pos) => {
          const size = pos.qty * (currentPricesMap[pos.symbol] || pos.currentPrice);
          return acc + size;
        }, 0);
        const nextLivePnL = updatedPositions.reduce((acc, pos) => {
          const liveP = currentPricesMap[pos.symbol] || pos.currentPrice;
          const initialS = pos.qty * pos.entryPrice;
          const currentS = pos.qty * liveP;
          const dir = pos.type === 'BUY' ? 1 : -1;
          return acc + (currentS - initialS) * dir;
        }, 0);
        const nextEquity = nextBalance + nextLivePnL;

        const nextEquityHistory = [
          ...prev.equityHistory,
          { timestamp: Date.now(), equity: nextEquity, balance: nextBalance }
        ];

        return {
          ...prev,
          balance: nextBalance,
          positions: updatedPositions,
          history: nextHistory,
          equityHistory: nextEquityHistory
        };
      });
    }
  }, [currentPricesMap, paperAccount.positions, addNotification]);

  // Handle Trade Execution Callback
  const handleExecutePaperTrade = (params: {
    symbol: string;
    type: 'BUY' | 'SELL';
    entryPrice: number;
    takeProfit: number;
    stopLoss: number;
  }) => {
    // Determine actual market price seen on screen to prevent discrepancies or instant Stop-Loss/Take-Profit triggers
    const actualPrice = params.symbol === selectedSymbol.symbol 
      ? currentPrice 
      : (currentPricesMap[params.symbol] || params.entryPrice);

    if (!actualPrice || actualPrice <= 0) {
      addNotification(`🛑 [沙盘拒单] 无法猎取当前标的的有效最新价格，开仓失败。`, 'danger');
      return;
    }

    // Proportional scaling function to adjust TP / SL percentage based on exact entry deviation
    const formatPricePrecision = (val: number, refPrice: number): number => {
      if (refPrice < 1) return Number(val.toFixed(6));
      if (refPrice < 10) return Number(val.toFixed(4));
      return Number(val.toFixed(2));
    };

    const aiEntry = (params.entryPrice && params.entryPrice > 0) ? params.entryPrice : actualPrice;
    const tpRatio = params.takeProfit / aiEntry;
    const slRatio = params.stopLoss / aiEntry;

    const adjustedTakeProfit = formatPricePrecision(actualPrice * tpRatio, actualPrice);
    const adjustedStopLoss = formatPricePrecision(actualPrice * slRatio, actualPrice);

    // 15% cash allocation of balance for simulated leverage discipline
    const allocation = paperAccount.balance * 0.15;
    if (allocation <= 0 || paperAccount.balance <= allocation) {
      addNotification(`🛑 [沙盘拒单] 账户现金余额不足以承兑当前头寸保证金!`, 'danger');
      return;
    }

    const qty = Math.floor(allocation / actualPrice);
    if (qty <= 0) {
      addNotification(`🛑 [沙盘拒单] 配置资金无法满足起步开仓 1 股的需求（资产价格 ${formatCurrency(actualPrice)} 过高）`, 'danger');
      return;
    }

    // Stop duplicate positions
    const duplicate = paperAccount.positions.find(p => p.symbol === params.symbol && p.type === params.type);
    if (duplicate) {
      addNotification(`⚠️ [持仓警告] 您当前已持有 ${params.symbol} 的 ${params.type === 'BUY' ? '做多' : '做空'} 合约，请勿重复开仓。`, 'info');
      setActiveTab('paper-trade');
      return;
    }

    const newPosition: PaperPosition = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: params.symbol,
      type: params.type,
      entryPrice: actualPrice,
      currentPrice: actualPrice,
      takeProfit: adjustedTakeProfit,
      stopLoss: adjustedStopLoss,
      qty,
      pnl: 0,
      pnlPercent: 0,
      timestamp: Date.now(),
      status: 'ACTIVE'
    };

    setPaperAccount(prev => {
      const nextBalance = prev.balance - (actualPrice * qty);
      const nextPositions = [...prev.positions, newPosition];
      
      const nextEquity = nextBalance + (actualPrice * qty);
      const nextEquityHistory = [
        ...prev.equityHistory,
        { timestamp: Date.now(), equity: nextEquity, balance: nextBalance }
      ];

      return {
        ...prev,
        balance: nextBalance,
        positions: nextPositions,
        equityHistory: nextEquityHistory
      };
    });

    // Make sure currentPricesMap has the newest price
    setCurrentPricesMap(prev => ({
      ...prev,
      [params.symbol]: actualPrice
    }));

    addNotification(`🚀 [开仓成交] 沙盘即时跟单成交! ${params.symbol.split(':')[1] || params.symbol} ${params.type === 'BUY' ? '做多 (BUY)' : '做空 (SELL)'}. 成交价: ${formatCurrency(actualPrice)}, 头寸: ${qty.toLocaleString()} 股 (止盈: ${formatCurrency(adjustedTakeProfit)}, 止损: ${formatCurrency(adjustedStopLoss)})`, 'success');
    setActiveTab('paper-trade');
  };

  const handleClosePosition = (id: string, currentPriceOverride?: number) => {
    const pos = paperAccount.positions.find(p => p.id === id);
    if (!pos) return;

    const price = currentPriceOverride || currentPricesMap[pos.symbol] || pos.currentPrice;
    const initialSize = pos.qty * pos.entryPrice;
    const currentSize = pos.qty * price;
    const directionMult = pos.type === 'BUY' ? 1 : -1;
    const pnl = (currentSize - initialSize) * directionMult;

    const closedPos: PaperPosition = {
      ...pos,
      status: 'CLOSED_MANUAL',
      closedPrice: price,
      pnl,
      pnlPercent: (pnl / initialSize) * 100,
      closedAt: Date.now()
    };

    setPaperAccount(prev => {
      const remainingPositions = prev.positions.filter(p => p.id !== id);
      const nextBalance = prev.balance + (initialSize + pnl);
      const nextHistory = [...prev.history, closedPos];
      
      const activePnL = remainingPositions.reduce((acc, p) => {
        const liveP = currentPricesMap[p.symbol] || p.currentPrice;
        const initialS = p.qty * p.entryPrice;
        const currentS = p.qty * liveP;
        const dir = p.type === 'BUY' ? 1 : -1;
        return acc + (currentS - initialS) * dir;
      }, 0);
      const nextEquity = nextBalance + activePnL;

      const nextEquityHistory = [
        ...prev.equityHistory,
        { timestamp: Date.now(), equity: nextEquity, balance: nextBalance }
      ];

      return {
        ...prev,
        balance: nextBalance,
        positions: remainingPositions,
        history: nextHistory,
        equityHistory: nextEquityHistory
      };
    });

    addNotification(`✋ [手动平仓] 顺利结束持仓: ${pos.symbol.split(':')[1] || pos.symbol}. 退出结算价: ${price}, 实现盈亏: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USD`, pnl >= 0 ? 'success' : 'danger');
  };

  const handleResetAccount = () => {
    if (window.confirm("确定要立即重置模拟诊断账户吗？重置后您的历史资产曲线与所有成交结算细节均会彻底擦除。")) {
      const resetAcc: PaperAccount = {
        balance: 100000,
        initialBalance: 100000,
        positions: [],
        history: [],
        equityHistory: [{ timestamp: Date.now(), equity: 100000, balance: 100000 }]
      };
      setPaperAccount(resetAcc);
      addNotification(`💫 [账户重置] 模拟交易舱回归起始状态，已补足 100,000 USD 虚拟准备金。`, 'info');
    }
  };

  // Image Upload Handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data:image/png;base64, prefix for API
        const cleanBase64 = base64String.split(',')[1]; 
        setSelectedImage(cleanBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Function to fetch data and analysis
  const fetchMarketAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    let analysisAnchorPrice = currentPrice || selectedSymbol.currentPrice;

    try {
      // Step 0: Logic for Price Source
      // Both locked and AI real-time anchoring strictly align with the displayed price (currentPrice)
      // to avoid price jumps or unexpected shifts on screen refresh / re-analysis.
      // The background 15s timer or manual price refresh handles the real-time ticker updates.
      analysisAnchorPrice = currentPrice || selectedSymbol.currentPrice;

      // Step 1: Analyze using the anchor price AND image if available
      const result: RealTimeAnalysis = await analyzeMarketData(
          selectedSymbol.symbol, 
          selectedTimeframe, 
          analysisAnchorPrice,
          selectedImage || undefined, // Pass image to service
          isLockedRef.current // <--- PASS LOCKED STATE to ensure AI respects the price
      );
      
      setAnalysis(result);
      
      // Keep the displayed price firmly locked onto the analysis anchor price 
      // without jumping to a different value after the AI response completes.
      if (!isLockedRef.current && result.realTimePrice) {
          setCurrentPrice(result.realTimePrice);
      }
      
      setLastUpdated(new Date());

    } catch (e: any) {
      console.error("Analysis Failed", e);
      setError(e.message || "分析过程中发生未知错误");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol.symbol, selectedTimeframe, currentPrice, selectedImage]);

  useEffect(() => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  }, [selectedSymbol, selectedTimeframe]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
        const foundStock = await lookupStockSymbol(searchQuery);
        
        if (!foundStock || !foundStock.symbol || foundStock.symbol.trim() === '' || foundStock.symbol === 'NULL') {
             throw new Error("Invalid stock data received");
        }

        if (!watchlist.some(s => s.symbol === foundStock.symbol)) {
            setWatchlist(prev => [foundStock, ...prev]);
        }
        
        // Use the handler to select and ensure consistency
        handleStockSelect(foundStock);
        
        setSearchQuery('');
        // Do not close sidebar on search for desktop convenience, maybe close on mobile?
        if (window.innerWidth < 1024) {
            setSidebarOpen(false); 
        }
        
    } catch (error) {
        console.error("Search failed:", error);
        alert(`未找到 "${searchQuery}" 的相关股票。\n请尝试使用准确的代码 (如 AAPL) 或全称。`);
    } finally {
        setIsSearching(false);
    }
  };

  const removeStock = (e: React.MouseEvent, symbolToRemove: string) => {
    e.stopPropagation();
    
    const newList = watchlist.filter(s => s.symbol !== symbolToRemove);
    setWatchlist(newList);

    if (selectedSymbol.symbol === symbolToRemove) {
        if (newList.length > 0) {
            handleStockSelect(newList[0]);
        }
    }
  };

  // 3. SORTING LOGIC: Move items up/down
  const moveStock = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === watchlist.length - 1)) return;

    const newList = [...watchlist];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    // Swap
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];

    setWatchlist(newList);
  };

  // Price Edit Handlers
  const startEditingPrice = () => {
    setTempPriceInput(currentPrice.toString());
    setIsEditingPrice(true);
    setTimeout(() => priceInputRef.current?.focus(), 100);
  };

  const savePrice = () => {
    const val = parseFloat(tempPriceInput);
    if (!isNaN(val) && val > 0) {
      setCurrentPrice(val);
      setIsPriceManuallySet(true); // MARK AS MANUALLY SET
      isLockedRef.current = true; // Immediate sync
      
      // Update the watchlist item too so it persists
      const updatedWatchlist = watchlist.map(s => 
        s.symbol === selectedSymbol.symbol ? { ...s, currentPrice: val } : s
      );
      setWatchlist(updatedWatchlist);
    }
    setIsEditingPrice(false);
  };

  const handleUnlockPrice = () => {
      setIsPriceManuallySet(false);
      isLockedRef.current = false; // Immediate sync
      refreshPriceForce(); // Trigger immediate refresh
  };

  const cancelEditPrice = () => {
    setIsEditingPrice(false);
  };

  // Define Timeframe Groups
  const minuteTimeframes = [Timeframe.M1, Timeframe.M3, Timeframe.M5, Timeframe.M15, Timeframe.M30];
  const hourDayTimeframes = [Timeframe.H1, Timeframe.H2, Timeframe.H4, Timeframe.D1];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/20 relative">
      
      {/* Visual Floating Notifications Portal */}
      <div className="fixed top-6 right-6 z-[99999] max-w-sm w-full space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl bg-slate-900/95 backdrop-blur-md pointer-events-auto transition-all duration-300 animate-in slide-in-from-top-4 border-l-4 ${
              n.type === 'success' ? 'border-l-emerald-500 border-slate-800' :
              n.type === 'danger' ? 'border-l-red-500 border-slate-800' :
              'border-l-indigo-505 border-slate-800'
            }`}
          >
            <div className="flex-1 text-[11px] leading-relaxed text-slate-200">
              {n.message}
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
              className="text-slate-500 hover:text-white shrink-0 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      
      <BacktestModal 
        isOpen={isBacktestOpen} 
        onClose={() => setIsBacktestOpen(false)} 
        symbol={selectedSymbol.symbol} 
      />

      <aside 
        className={`
          fixed inset-y-0 left-0 z-[60] w-72 bg-slate-900 border-r border-slate-800 
          transform transition-transform duration-300 ease-in-out 
          flex flex-col shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <Activity className="text-slate-950 w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">AI-TRADE <span className="text-slate-500 font-medium">// V3.2</span></span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col min-h-0">
          <form onSubmit={handleSearch} className="relative mb-6 flex-shrink-0 group">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-sm group-hover:bg-emerald-500/10 transition-colors"></div>
            <input 
              type="text" 
              placeholder="搜索股票 (如 Apple, 0700)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="relative w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-slate-100 placeholder-slate-600 transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors z-10" />
            <button 
                type="submit" 
                disabled={isSearching}
                className="absolute right-2 top-2 p-1.5 bg-slate-800 rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition-colors disabled:opacity-50 z-10 text-slate-300"
            >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </form>

          <div className="flex items-center justify-between mb-3 px-2 flex-shrink-0">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> 自选列表
            </h3>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono font-bold">{watchlist.length}</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
            {watchlist.map((stock, index) => (
              <div
                key={stock.symbol}
                onClick={() => handleStockSelect(stock)}
                className={`
                  group w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer border
                  ${selectedSymbol.symbol === stock.symbol 
                    ? 'bg-slate-800 border-slate-700 text-white shadow-xl' 
                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'}
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors
                        ${selectedSymbol.symbol === stock.symbol ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}
                    `}>
                        {stock.symbol.split(':')[1]?.substring(0, 1) || stock.symbol.substring(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm truncate tracking-tight">{stock.symbol.split(':')[1] || stock.symbol}</div>
                        <div className="text-[10px] opacity-60 truncate max-w-[120px] font-medium">{stock.name}</div>
                    </div>
                </div>
                
                {/* Action Buttons: Show on Hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
                    <div className="flex flex-col gap-0.5">
                        <button 
                            onClick={(e) => moveStock(e, index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 hover:text-white text-gray-600 disabled:opacity-0 transition-colors"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={(e) => moveStock(e, index, 'down')}
                            disabled={index === watchlist.length - 1}
                            className="p-0.5 hover:text-white text-gray-600 disabled:opacity-0 transition-colors"
                        >
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                    <button 
                        onClick={(e) => removeStock(e, stock.symbol)}
                        className="p-1.5 rounded-lg bg-slate-950/40 hover:bg-red-500/10 text-slate-500 hover:text-red-400 ml-1 border border-transparent hover:border-red-500/20 transition-all font-mono"
                        title="删除"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
              </div>
            ))}
            
            {watchlist.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-2 border-2 border-dashed border-slate-850 rounded-xl bg-slate-900/30">
                    <Search className="w-8 h-8 opacity-20" />
                    <span className="text-xs font-medium">暂无自选股</span>
                </div>
            )}
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col h-screen overflow-hidden relative w-full transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : ''}`}>
        
        {/* Top Navigation */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            <div className="flex flex-col">
                <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                {selectedSymbol.symbol.split(':')[1] || selectedSymbol.symbol}
                <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-bold text-slate-400 border border-slate-700 hidden sm:inline-block font-mono">
                    {selectedSymbol.symbol.split(':')[0] || 'US'}
                </span>
                </h1>
                <span className="text-xs text-gray-500 font-medium hidden sm:inline-block">{selectedSymbol.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             {/* Anchor Price Display */}
             <div className="text-right">
                <div className="text-[9px] text-gray-500 uppercase font-bold mb-0.5 flex items-center justify-end gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPriceManuallySet ? 'bg-orange-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                    <span className="hidden sm:inline tracking-wider">
                        {isPriceManuallySet ? "手动锁定 (LOCKED)" : "AI 实时锚定"}
                    </span>
                    <span className="sm:hidden">{isPriceManuallySet ? "LOCK" : "LIVE"}</span>
                    
                    <button 
                      onClick={refreshPriceForce} 
                      disabled={isRefreshingPrice}
                      className="text-slate-500 hover:text-emerald-400 disabled:opacity-50 transition-all p-1 hover:bg-slate-800 rounded flex items-center justify-center font-bold" 
                      title="刷新实时价格"
                    >
                      <RotateCw className={`w-2.5 h-2.5 ${isRefreshingPrice ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                    
                    {!isEditingPrice && !isPriceManuallySet && (
                      <button onClick={startEditingPrice} className="text-gray-600 hover:text-blue-400 transition-colors p-0.5" title="手动校准"><Edit2 className="w-2.5 h-2.5" /></button>
                    )}
                    {isPriceManuallySet && (
                        <button onClick={handleUnlockPrice} className="flex items-center gap-1 text-[8px] text-orange-400 bg-orange-900/20 px-1.5 py-px rounded border border-orange-500/30 hover:bg-orange-900/40 transition-colors">
                             <Unlock className="w-2 h-2" /> 解锁
                        </button>
                    )}
                </div>
                
                {isEditingPrice ? (
                  <div className="flex items-center gap-2 justify-end animate-in fade-in slide-in-from-right-2 duration-200">
                    <input 
                      ref={priceInputRef}
                      type="number" 
                      value={tempPriceInput}
                      onChange={(e) => setTempPriceInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && savePrice()}
                      className="w-24 bg-slate-900 border border-emerald-500 rounded-md px-2 py-1 text-sm text-white font-mono focus:outline-none shadow-lg"
                    />
                    <button onClick={savePrice} className="p-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 border border-emerald-500/20"><Check className="w-4 h-4" /></button>
                    <button onClick={cancelEditPrice} className="p-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 border border-red-500/20"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div 
                    className={`text-xl font-mono font-bold cursor-pointer transition-colors flex items-center gap-2 justify-end group ${isPriceManuallySet ? 'text-orange-400' : 'text-white hover:text-emerald-400'}`}
                    onClick={!isPriceManuallySet ? startEditingPrice : undefined}
                    title={isPriceManuallySet ? "价格已锁定，分析将基于此价格" : "点击手动校准价格"}
                  >
                    {isPriceManuallySet && <Lock className="w-3 h-3 opacity-50" />}
                    {currentPrice ? formatCurrency(currentPrice) : '---'}
                    <span className="text-xs text-slate-500 font-normal group-hover:text-emerald-500/50 opacity-0 group-hover:opacity-100 transition-all">USD</span>
                  </div>
                )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              
              {/* TIMEFRAME SELECTOR (GROUPED) */}
              <div className="flex flex-wrap gap-2 items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-sm w-fit">
                
                {/* Timeframe Icon Indicator */}
                <div className="flex items-center gap-1.5 px-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">图表周期</span>
                </div>
                
                {/* Divider */}
                <div className="w-px h-5 bg-slate-800"></div>

                {/* Minute Group */}
                <div className="flex gap-1">
                    {minuteTimeframes.map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`
                        px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 min-w-[36px]
                        ${selectedTimeframe === tf 
                            ? 'bg-emerald-500 text-slate-950 shadow-md' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }
                        `}
                    >
                        {tf}
                    </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-800 mx-1"></div>

                {/* Hour/Day Group */}
                <div className="flex gap-1">
                    {hourDayTimeframes.map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`
                        px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 min-w-[36px]
                        ${selectedTimeframe === tf 
                            ? 'bg-emerald-600 text-slate-950 shadow-md' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }
                        `}
                    >
                        {tf}
                    </button>
                    ))}
                </div>

              </div>

              <div className="flex items-center gap-3">
                 {/* Vision Upload Button */}
                 <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                    {selectedImage ? (
                         <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all font-mono">
                             <ImageIcon className="w-4 h-4" />
                             <span>图片已就绪</span>
                             <button onClick={(e) => { e.stopPropagation(); clearImage(); }} className="hover:text-white p-0.5 rounded-full hover:bg-emerald-600"><X className="w-3 h-3"/></button>
                         </div>
                    ) : (
                        <button 
                            onClick={triggerFileInput}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-400 text-xs font-bold rounded-lg border border-slate-800 transition-all font-mono"
                            title="上传K线截图进行多模态 analysis"
                        >
                            <Camera className="w-4 h-4 text-emerald-500" />
                            <span className="hidden sm:inline">AI 识图</span>
                        </button>
                    )}
                 </div>

                 <button 
                    onClick={() => setIsBacktestOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-white text-slate-950 text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 font-mono"
                 >
                    <BarChart2 className="w-4 h-4" />
                    <span>K线形态与回测</span>
                 </button>

                 <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 hidden md:flex">
                     <Clock className="w-3 h-3 text-emerald-500" />
                     <span>更新时间: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
             </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: Chart & Stats OR Paper Trading Sandbox */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                
                {/* Advanced Tab Navigation */}
                <div className="flex bg-[#0b1215] border border-slate-800 p-1 rounded-2xl shrink-0">
                  <button
                    onClick={() => setActiveTab('chart')}
                    className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'chart' 
                        ? 'bg-slate-800 text-white shadow-xl border border-slate-700/60 font-black' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    id="tab-chart"
                  >
                    <CandlestickChart className="w-4 h-4 text-emerald-400" />
                    技术指标 & 实时K线图表
                  </button>
                  <button
                    onClick={() => setActiveTab('deep-mining')}
                    className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                      activeTab === 'deep-mining' 
                        ? 'bg-slate-800 text-white shadow-xl border border-slate-700/60 font-black' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    id="tab-deep-mining"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    量化挖掘与决策舱
                  </button>
                </div>

                {activeTab === 'chart' ? (
                  <>
                    <StockChart 
                        symbol={selectedSymbol.symbol} 
                        timeframe={selectedTimeframe} 
                        onRefreshPrice={refreshPriceForce} 
                    />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <StatCard 
                            label="关键阻力 (Resistance)" 
                            value={analysis ? formatCurrency(analysis.resistanceLevel || 0) : '---'} 
                            color="text-red-400" 
                            icon={<TrendingUp className="w-3 h-3"/>} 
                       />
                       <StatCard 
                            label="关键支撑 (Support)" 
                            value={analysis ? formatCurrency(analysis.supportLevel || 0) : '---'} 
                            color="text-emerald-400" 
                            icon={<TrendingDown className="w-3 h-3"/>} 
                       />
                       <StatCard 
                            label="历史回测胜率 (Backtest)" 
                            value={analysis ? `${analysis.historicalWinRate}%` : '---'} 
                            color="text-blue-400" 
                            icon={<Activity className="w-3 h-3"/>}
                            tooltip={
                                <div>
                                    <strong className="text-white block mb-1">模式匹配 (Pattern Match)</strong>
                                    检索过去 5 年类似 K 线形态（如双底、突破），计算其在随后走势中的上涨概率。
                                </div>
                            }
                       />
                       <StatCard 
                            label="AI 预测胜率 (Prob.)" 
                            value={analysis ? `${analysis.winRate}%` : '---'} 
                            color="text-yellow-400" 
                            icon={<Target className="w-3 h-3"/>}
                            tooltip={
                                <div>
                                    <strong className="text-white block mb-2 border-b border-slate-755 pb-1 font-mono">权重模型 (Weighting)</strong>
                                    <ul className="text-[10px] space-y-1 font-mono">
                                        <li className="flex justify-between w-full gap-4"><span>技术面</span> <span className="text-emerald-400 font-bold">40%</span></li>
                                        <li className="flex justify-between w-full gap-4"><span>资金面</span> <span className="text-yellow-400 font-bold">30%</span></li>
                                        <li className="flex justify-between w-full gap-4"><span>情绪面</span> <span className="text-blue-400 font-bold">20%</span></li>
                                        <li className="flex justify-between w-full gap-4"><span>宏观面</span> <span className="text-purple-400 font-bold">10%</span></li>
                                    </ul>
                                </div>
                            }
                       />
                    </div>
                  </>
                ) : (
                  <DeepMiningDashboard 
                    symbol={selectedSymbol.symbol}
                    analysis={analysis}
                    currentPrice={currentPrice}
                  />
                )}
              </div>

              {/* Right Column: AI Analysis */}
              <div className="xl:col-span-1 min-h-[600px]">
                <AnalysisCard 
                  analysis={analysis} 
                  loading={isLoading} 
                  error={error}
                  onAnalyze={fetchMarketAnalysis} 
                  symbol={selectedSymbol.symbol}
                  timeframe={selectedTimeframe}
                />
              </div>

            </div>

             <div className="mt-12 text-center border-t border-slate-800/80 pt-8 pb-4">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2 mb-2">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold shadow-lg font-mono">v3.2 LIVE</span>
                <span>
                    驱动引擎 <strong className="text-slate-300">Gemini 3 Pro (Thinking)</strong>
                </span>
              </p>
              <p className="text-[10px] text-slate-650">
                Gemini Critic 逻辑为模拟红队推演 (Red Teaming)，仅供参考，交易前请务必自行验证。
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// FIX: Interactive Tooltip (Click to toggle + Hover)
const StatCard = ({ label, value, color, icon, tooltip }: { label: string, value: string, color: string, icon: React.ReactNode, tooltip?: React.ReactNode }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group relative cursor-pointer active:scale-[0.98] select-none"
      onClick={() => setShowTooltip(!showTooltip)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-slate-950/50 rounded group-hover:bg-slate-850 transition-colors">{icon}</span>
            {label}
          </div>
          {tooltip && <HelpCircle className={`w-3 h-3 transition-colors ${showTooltip ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`} />}
      </div>
      <div className={`text-2xl font-mono font-medium tracking-tight ${color}`}>{value}</div>
      
      {/* Tooltip */}
      {tooltip && (
          <div 
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-950 border border-slate-750 text-[10px] text-zinc-300 rounded shadow-2xl transition-all z-20 leading-relaxed ${showTooltip ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}
            onClick={(e) => e.stopPropagation()} // Prevent close on click inside
          >
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 border-b border-r border-slate-750 rotate-45"></div>
              {tooltip}
          </div>
      )}
    </div>
  );
};

export default App;