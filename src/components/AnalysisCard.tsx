import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { AIAnalysis, SignalType, RedTeaming, TradingSetup, TrinityConsensus, SmartMoneyAnalysis, DataMining, CorrelationMatrix, CatalystRadar, TrendResonance, MarketTribunal, TribunalArgument, WyckoffData, VolumeProfile, SMCData, OptionsData, SentimentDivergence, VolatilityAnalysis, HardData, SocialAnalysis, Timeframe } from '../types';
import { formatCurrency } from '../constants';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Target, Activity, Zap, Globe, Bot, History, Loader2, BrainCircuit, Crosshair, CheckCircle2, ListChecks, CandlestickChart, Users, Cpu, AlertTriangle, ArrowRight, Gauge, BarChart3, Layers, Lock, Unlock, Terminal, Quote, Navigation, GitMerge, Sliders, Radar, Radio, BarChart4, ShieldCheck, Check, Search, Siren, HelpCircle, ArrowUpRight, ArrowDownRight, Briefcase, BarChart2, GitCommit, ChevronRight, PenTool, AlertOctagon, Scale, Wallet, LineChart, Eye, ScanLine, Database, Server, Network, Coins, Landmark, Sparkles, Link2, CalendarClock, ArrowBigUp, ArrowBigDown, Gavel, Scale as ScaleIcon, ThumbsUp, ThumbsDown, AlertCircle, BarChart, Magnet, ZapOff, Waves, ArrowDown, Map, CheckCircle, Filter } from 'lucide-react';

interface AnalysisCardProps {
  analysis: AIAnalysis | null;
  loading: boolean;
  error?: string | null;
  onAnalyze: () => void;
  symbol: string;
  timeframe?: Timeframe;
}

// FIX: Deterministic Typewriter to prevent character duplication stutter
const Typewriter = ({ text, speed = 10 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
        setDisplayedText('');
        return;
    }
    
    let i = 0;
    setDisplayedText('');
    
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className="whitespace-pre-wrap leading-relaxed">{displayedText}</span>;
};

// Helper: Radial Progress
const RadialProgress = ({ score, size = 42, strokeWidth = 3 }: { score: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  let colorClass = 'text-red-500';
  let trackClass = 'text-red-500/10';
  if (score >= 50) { colorClass = 'text-yellow-500'; trackClass = 'text-yellow-500/10'; }
  if (score >= 75) { colorClass = 'text-green-500'; trackClass = 'text-green-500/10'; }
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle className={trackClass} strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className={`${colorClass} transition-all duration-1000 ease-out`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`font-mono font-bold leading-none ${colorClass}`} style={{ fontSize: size * 0.3 }}>{score}</span>
      </div>
    </div>
  );
};

// Helper: Term Translation
const translateTerm = (term: string | undefined): string => {
  if (!term) return '计算中...';
  const lower = term.toLowerCase();
  if (lower.includes('bullish') || lower.includes('多头')) return '多头结构 (Bullish)';
  if (lower.includes('bearish') || lower.includes('空头')) return '空头结构 (Bearish)';
  if (lower.includes('ranging') || lower.includes('consolidation') || lower.includes('震荡')) return '震荡整理 (Ranging)';
  return term; 
};

const generateDivergenceData = (symbol: string, correlation?: CorrelationMatrix, signal?: SignalType, timeframe?: Timeframe) => {
    const symbolStr = symbol.trim().toUpperCase();
    const refAsset = correlation?.correlatedAsset || "SPY";
    
    // Create a deterministic hash from the symbol name to seed some variation
    let hash = 0;
    for (let i = 0; i < symbolStr.length; i++) {
        hash = symbolStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    
    // Base returns
    const points = 12;
    const data: any[] = [];
    
    let assetVal = 0;
    let refVal = 0;
    
    // Signal-based divergence bias
    // BUY: Asset outperforms reference (diverging upwards)
    // SELL: Asset underperforms reference (diverging downwards)
    // NEUTRAL: moving closely
    const divergenceBias = signal === SignalType.BUY ? 0.45 : (signal === SignalType.SELL ? -0.45 : 0.05);

    // Adaptive date/time labels starting from today trailing backwards
    const names: string[] = [];
    const baseDate = new Date();
    
    for (let i = 0; i < points; i++) {
        const stepsAgo = points - 1 - i;
        if (timeframe === Timeframe.D1) {
            // Daily interval - e.g., "05/20"
            const currentStepDate = new Date(baseDate.getTime() - stepsAgo * 24 * 60 * 60 * 1000);
            const rawMonth = currentStepDate.getMonth() + 1;
            const rawDay = currentStepDate.getDate();
            names.push(`${String(rawMonth).padStart(2, '0')}/${String(rawDay).padStart(2, '0')}`);
        } else {
            // Intraday intervals - determine relative step width in minutes
            let stepMinutes = 15;
            switch (timeframe) {
                case Timeframe.M1: stepMinutes = 1; break;
                case Timeframe.M3: stepMinutes = 3; break;
                case Timeframe.M5: stepMinutes = 5; break;
                case Timeframe.M15: stepMinutes = 15; break;
                case Timeframe.M30: stepMinutes = 30; break;
                case Timeframe.H1: stepMinutes = 60; break;
                case Timeframe.H2: stepMinutes = 120; break;
                case Timeframe.H4: stepMinutes = 240; break;
                default: stepMinutes = 15;
            }
            const currentStepDate = new Date(baseDate.getTime() - stepsAgo * stepMinutes * 60 * 1000);
            const hourStr = String(currentStepDate.getHours()).padStart(2, '0');
            const minStr = String(currentStepDate.getMinutes()).padStart(2, '0');
            names.push(`${hourStr}:${minStr}`);
        }
    }
    
    for (let i = 0; i < points; i++) {
        // Deterministic movements
        const x = i / (points - 1); // 0 to 1
        const marketTrend = Math.sin(x * Math.PI * 1.5 + (absHash % 5)) * 1.5;
        const refChange = marketTrend + Math.cos(x * 3) * 0.5;
        refVal += refChange;
        
        // Co-movement of selected asset with standard variation + widening signal bias
        const assetChange = refChange + (divergenceBias * x * 2.5) + (Math.sin(x * 8) * 0.3);
        assetVal += assetChange;
        
        const assetPct = Number(assetVal.toFixed(2));
        const refPct = Number(refVal.toFixed(2));
        const divergence = Number((assetPct - refPct).toFixed(2));
        
        data.push({
            name: names[i] || `T${i + 1}`,
            asset: assetPct,
            reference: refPct,
            divergence: divergence,
            assetLabel: symbolStr,
            refLabel: refAsset,
            timeframeStr: timeframe === Timeframe.D1 ? '对应日期' : '发生时点'
        });
    }
    
    return data;
};

interface MiniDivergenceTooltipProps {
    active?: boolean;
    payload?: any[];
}

const MiniDivergenceTooltip = ({ active, payload }: MiniDivergenceTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const assetName = data.assetLabel;
        const refName = data.refLabel;
        
        // Find asset and reference values dynamically by checking their dataKey property
        const assetItem = payload.find(p => p.dataKey === 'asset');
        const refItem = payload.find(p => p.dataKey === 'reference');
        
        const assetVal = assetItem ? assetItem.value : 0;
        const refVal = refItem ? refItem.value : 0;
        
        const divVal = data.divergence;
        const timeLabel = data.name;
        const timeframeStr = data.timeframeStr || '发生时点';
        
        return (
            <div className="bg-[#0b1215] border border-gray-850 p-2.5 rounded-lg text-[9px] font-mono text-gray-300 shadow-2xl flex flex-col gap-1 pointer-events-none z-50 min-w-[135px]">
                <div className="text-[8.5px] text-gray-500 border-b border-gray-800/80 pb-1 mb-1 flex justify-between font-bold">
                    <span>{timeframeStr}:</span>
                    <span className="text-blue-400 font-extrabold">{timeLabel}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400 font-bold truncate max-w-[80px]">{assetName}:</span>
                    <span className={assetVal >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {assetVal > 0 ? `+${assetVal}` : assetVal}%
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400 font-bold truncate max-w-[80px]">{refName}:</span>
                    <span className={refVal >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {refVal > 0 ? `+${refVal}` : refVal}%
                    </span>
                </div>
                <div className="w-full h-px bg-gray-800/60 my-1"></div>
                <div className="flex justify-between gap-4 text-blue-400 font-bold">
                    <span>背离 (Div):</span>
                    <span className={divVal >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {divVal > 0 ? `+${divVal}` : divVal}%
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

// Driver Item Component
const ScoreDriverItem = ({ label, weight, score, color, icon }: { label: string, weight: number, score: number, color: string, icon: React.ReactNode }) => {
    const safeScore = typeof score === 'number' ? score : (parseFloat(score as any) || 0);
    const contribution = (safeScore * (weight / 100)).toFixed(1);

    return (
        <div className="flex flex-col gap-1.5 bg-[#0b1215]/80 hover:bg-[#121921]/90 p-3 rounded-xl border border-gray-800/80 hover:border-blue-500/25 transition-all duration-300 shadow-sm group">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400 group-hover:text-white transition-colors">
                <span className="flex items-center gap-1.5">{icon} {label}</span>
                <span className="opacity-40 text-[8px] font-mono bg-gray-800 px-1 py-0.2 rounded">{weight}% 权重</span>
            </div>
            
            <div className="flex items-end justify-between mt-1">
                 <span className={`text-2xl font-black font-mono leading-none tracking-tight ${color}`}>{safeScore}</span>
                 <div className="text-right">
                     <span className="text-[8px] text-gray-500 block leading-tight">贡献度 Score</span>
                     <span className="text-[10px] text-gray-300 font-mono font-bold">+{contribution}%</span>
                 </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden mt-1.5 relative">
                <div 
                    className={`h-full rounded-full ${color.replace('text-', 'bg-')} transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.min(100, Math.max(0, safeScore))}%` }}
                ></div>
            </div>
        </div>
    );
};

// NEW: Hard Data Validation Panel
const HardDataPanel = ({ data, marketContext }: { data: HardData, marketContext?: string }) => {
    if (!data) return null;
    
    // Dynamic Labels based on Market Context
    const isAShare = marketContext === 'CN_ASHARE';

    return (
        <div className="bg-[#0b1215] rounded-xl border border-gray-800 mb-4 overflow-hidden shadow-inner group">
             {/* Header */}
             <div className="bg-[#151c24] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                 <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Database className="w-3 h-3 text-blue-500" /> 硬数据验证 (Quant Validation)
                 </h3>
                 <div className="flex items-center gap-1 bg-green-900/20 px-2 py-0.5 rounded border border-green-500/20">
                     <CheckCircle className="w-3 h-3 text-green-500" />
                     <span className="text-[9px] text-green-400 font-bold uppercase">{data.dataSource}</span>
                 </div>
             </div>

             {/* Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-800 border-b border-gray-800">
                 {/* RSI */}
                 <div className="p-3 text-center">
                     <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">RSI (14)</div>
                     <div className={`text-lg font-mono font-bold ${data.realTimeRsi > 70 ? 'text-red-400' : data.realTimeRsi < 30 ? 'text-green-400' : 'text-blue-300'}`}>
                         {data.realTimeRsi.toFixed(1)}
                     </div>
                     <div className="text-[9px] text-gray-600">{data.rsiStatus}</div>
                 </div>

                 {/* PE Ratio */}
                 <div className="p-3 text-center">
                     <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">
                        {isAShare ? '市盈率 (PE-TTM)' : 'PE Ratio (TTM)'}
                     </div>
                     <div className="text-lg font-mono font-bold text-white">{data.peRatio > 0 ? data.peRatio.toFixed(2) : '-'}</div>
                     <div className="text-[9px] text-gray-600">Valuation</div>
                 </div>

                 {/* Market Cap */}
                 <div className="p-3 text-center">
                     <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">
                        {isAShare ? '总市值 (Total Cap)' : 'Market Cap'}
                     </div>
                     <div className="text-sm font-mono font-bold text-white mt-1">{data.marketCap}</div>
                 </div>

                 {/* PB Ratio */}
                 <div className="p-3 text-center">
                     <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">PB Ratio</div>
                     <div className="text-lg font-mono font-bold text-white">{data.pbRatio > 0 ? data.pbRatio.toFixed(2) : '-'}</div>
                 </div>
             </div>
             
             {/* 52W Range Bar */}
             <div className="px-4 py-3 bg-[#0f151a]">
                  <div className="flex justify-between text-[9px] text-gray-500 mb-1 font-mono">
                      <span>52W Low</span>
                      <span className="text-gray-400 font-bold">{data.fiftyTwoWeekRange}</span>
                      <span>52W High</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden relative">
                      <div className="absolute left-[20%] right-[30%] h-full bg-blue-500/30 rounded-full"></div>
                  </div>
             </div>
        </div>
    );
};

// NEW: Social Sentiment Radar
const SocialRadarPanel = ({ social }: { social: SocialAnalysis }) => {
    if (!social) return null;

    const isDivergence = Math.abs(social.retailScore - social.institutionalScore) > 40;

    return (
        <div className="bg-[#0b1215] rounded-xl border border-gray-800 mb-4 overflow-hidden relative group">
             {/* Background Effect */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50"></div>
             
             <div className="p-4 relative z-10">
                 <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Radio className="w-3 h-3 text-purple-500 animate-pulse" /> 舆情雷达 (Social Radar)
                        </h3>
                        <p className="text-[9px] text-gray-600 mt-0.5">Aggregated from {social.sources.join(', ')}</p>
                     </div>
                     <div className={`px-2 py-1 rounded text-[9px] font-bold border ${isDivergence ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                         {social.sentimentVerdict}
                     </div>
                 </div>

                 {/* Dual Bar Comparison */}
                 <div className="space-y-4 mb-4">
                     {/* Retail */}
                     <div>
                         <div className="flex justify-between text-[9px] text-gray-500 uppercase font-bold mb-1">
                             <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Retail (散户)</span>
                             <span className={`${social.retailScore > 70 ? 'text-red-400' : 'text-gray-400'}`}>{social.retailScore}% (Greed)</span>
                         </div>
                         <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-1000 ${social.retailScore > 75 ? 'bg-red-500' : 'bg-gray-500'}`} 
                                style={{ width: `${social.retailScore}%` }}
                             ></div>
                         </div>
                     </div>

                     {/* Institutional */}
                     <div>
                         <div className="flex justify-between text-[9px] text-gray-500 uppercase font-bold mb-1">
                             <span className="flex items-center gap-1"><Landmark className="w-3 h-3" /> Smart Money (主力)</span>
                             <span className={`${social.institutionalScore > 60 ? 'text-green-400' : 'text-gray-400'}`}>{social.institutionalScore}% (Accumulation)</span>
                         </div>
                         <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-1000 ${social.institutionalScore > 60 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${social.institutionalScore}%` }}
                             ></div>
                         </div>
                     </div>
                 </div>

                 {/* Tags */}
                 <div className="flex flex-wrap gap-2">
                     <span className="text-[9px] text-gray-500 font-bold uppercase py-0.5">Hot Topics:</span>
                     {social.trendingKeywords.map((tag, i) => (
                         <span key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">#{tag}</span>
                     ))}
                 </div>
             </div>
        </div>
    );
};

// NEW: Volatility Regime Card
const VolatilityRegimeCard = ({ volatility }: { volatility?: VolatilityAnalysis }) => {
    if (!volatility) return null;

    const regimeStr = volatility.regime || '';
    const isHighVol = regimeStr.includes('High') || regimeStr.includes('Trend');
    const isLowVol = regimeStr.includes('Low') || regimeStr.includes('Choppy');
    const regimeColor = isHighVol ? 'text-blue-400 border-blue-500/30' : isLowVol ? 'text-yellow-400 border-yellow-500/30' : 'text-red-400 border-red-500/30';
    const bgEffect = isHighVol ? 'bg-blue-900/10' : isLowVol ? 'bg-yellow-900/10' : 'bg-red-900/10';

    return (
        <div className={`rounded-xl border p-4 mb-4 relative overflow-hidden ${bgEffect} ${regimeColor.replace('text-', 'border-')}`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                    <Waves className="w-3 h-3" /> 波动率体制 (Volatility Regime)
                </h3>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${regimeColor} bg-[#0b1215]/50`}>
                    {regimeStr}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* ATR/VIX Status */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <Activity className="w-3 h-3" /> 
                        <span>ATR/VIX: <span className="text-white font-bold">{volatility.atrState}</span></span>
                    </div>
                     {volatility.vixValue && (
                        <div className="text-[9px] text-gray-500 font-mono bg-[#151c24] px-1.5 py-0.5 rounded w-fit">
                            VIX: {volatility.vixValue}
                        </div>
                    )}
                </div>

                {/* Adaptive Strategy */}
                <div className="text-right">
                    <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">自适应策略 (Adaptive Logic)</div>
                    <div className={`text-xs font-bold ${isHighVol ? 'text-blue-300' : 'text-yellow-300'}`}>
                        {volatility.adaptiveStrategy}
                    </div>
                </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-700/20 text-[10px] text-gray-300 leading-snug italic">
                "{volatility.description}"
            </div>
        </div>
    );
};

// NEW: Options Gamma Analysis Component
const OptionsDashboard = ({ options, currentPrice }: { options?: OptionsData, currentPrice: number }) => {
    if (!options || !options.maxPainPrice) return null;

    const isAboveMaxPain = currentPrice > options.maxPainPrice;
    const distance = Math.abs((currentPrice - options.maxPainPrice) / currentPrice) * 100;
    const isSqueezeLikely = options.squeezeRisk === 'High';

    return (
        <div className="bg-[#0b1215] rounded-xl border border-gray-800 p-4 mb-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-2 opacity-5"><ZapOff className="w-16 h-16 text-yellow-500" /></div>
            
            <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                <h3 className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                    <Zap className="w-3 h-3 text-yellow-500" /> 期权衍生品 (Derivatives & Gamma)
                </h3>
                {isSqueezeLikely && (
                    <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded font-bold animate-pulse">
                        ⚠️ SQUEEZE RISK HIGH
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Max Pain Magnet */}
                <div className="bg-[#151c24] p-3 rounded-lg border border-gray-800/50 relative">
                    <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Max Pain (最大痛点)</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-mono font-bold text-white">{formatCurrency(options.maxPainPrice)}</span>
                        <span className="text-[9px] text-gray-500">{distance.toFixed(1)}% 偏离</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden relative">
                         {/* Marker for Current Price */}
                         <div className={`absolute top-0 bottom-0 w-1 ${currentPrice > options.maxPainPrice ? 'bg-green-500' : 'bg-red-500'} z-10`} style={{ left: isAboveMaxPain ? '70%' : '30%' }}></div>
                         {/* Marker for Max Pain */}
                         <div className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-10 left-1/2"></div>
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                        <span>偏低</span>
                        <span>痛点</span>
                        <span>偏高</span>
                    </div>
                </div>

                {/* Gamma & IV */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#151c24] p-1.5 rounded border border-gray-800/50">
                        <span className="text-[9px] text-gray-500 font-bold">Gamma 敞口</span>
                        <span className={`text-[9px] font-bold ${(options.gammaExposure || '').includes('Short') ? 'text-red-400' : 'text-green-400'}`}>
                            {(options.gammaExposure || '').includes('Short') ? '做空 (-GEX)' : '做多 (+GEX)'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#151c24] p-1.5 rounded border border-gray-800/50">
                        <span className="text-[9px] text-gray-500 font-bold">P/C 比率</span>
                        <span className={`text-[9px] font-bold font-mono ${(options.putCallRatio || 0) > 1 ? 'text-red-400' : 'text-green-400'}`}>
                            {typeof options.putCallRatio === 'number' ? options.putCallRatio.toFixed(2) : options.putCallRatio || '--'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#151c24] p-1.5 rounded border border-gray-800/50">
                        <span className="text-[9px] text-gray-500 font-bold">IV 排名</span>
                        <span className="text-[9px] font-bold text-blue-300 truncate max-w-[80px]">
                            {options.impliedVolatilityRank}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// NEW: Sentiment Divergence Meter
const SentimentDivergenceMeter = ({ divergence }: { divergence?: SentimentDivergence }) => {
    if (!divergence) return null;

    const statusStr = divergence.divergenceStatus || '';
    const isBearishDiv = statusStr.includes('Bearish');
    const isBullishDiv = statusStr.includes('Bullish');

    const retailMoodStr = divergence.retailMood || '';
    const instActionStr = divergence.institutionalAction || '';

    return (
        <div className={`rounded-xl border p-4 mb-4 relative overflow-hidden ${isBearishDiv ? 'bg-red-900/5 border-red-500/20' : isBullishDiv ? 'bg-green-900/5 border-green-500/20' : 'bg-[#0b1215] border-gray-800'}`}>
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                    <Users className="w-3 h-3 text-purple-400" /> 情绪背离 (Sentiment Divergence)
                </h3>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${isBearishDiv ? 'text-red-400 border-red-500/50 bg-red-900/20' : isBullishDiv ? 'text-green-400 border-green-500/50 bg-green-900/20' : 'text-gray-400 border-gray-600'}`}>
                    {statusStr}
                </span>
             </div>

             <div className="relative h-12 bg-[#151c24] rounded-lg border border-gray-800 flex items-center px-2">
                 {/* Center Line */}
                 <div className="absolute left-1/2 top-2 bottom-2 w-px bg-gray-700"></div>
                 
                 {/* Retail Bar (Left = Fear, Right = Greed) */}
                 <div className="flex-1 flex flex-col gap-1 pr-4">
                     <div className="flex justify-between text-[8px] text-gray-500 uppercase font-bold">
                         <span>Retail (散户)</span>
                         <span className={retailMoodStr.includes('Greed') ? 'text-red-400' : 'text-green-400'}>{retailMoodStr || '--'}</span>
                     </div>
                     <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex justify-end">
                         <div className={`h-full w-3/4 rounded-full ${retailMoodStr.includes('Greed') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                     </div>
                 </div>

                 {/* Institutional Bar (Left = Sell, Right = Buy) */}
                 <div className="flex-1 flex flex-col gap-1 pl-4">
                     <div className="flex justify-between text-[8px] text-gray-500 uppercase font-bold">
                         <span className={instActionStr.includes('Buy') || instActionStr.includes('Accumulation') ? 'text-green-400' : 'text-red-400'}>{instActionStr || '--'}</span>
                         <span>Inst (机构)</span>
                     </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                         <div className={`h-full w-3/4 rounded-full ${instActionStr.includes('Buy') || instActionStr.includes('Accumulation') ? 'bg-green-500' : 'bg-[#dc2626]'}`}></div>
                     </div>
                 </div>
             </div>
             
             {/* Warning Text */}
             {(isBearishDiv || isBullishDiv) && (
                 <div className="mt-2 text-[9px] text-gray-400 flex items-center gap-1.5 bg-[#000000]/20 p-1.5 rounded">
                     <AlertTriangle className="w-2.5 h-2.5 text-yellow-500" />
                     {isBearishDiv ? "警惕: 散户极度贪婪而机构在出货 (Retail Greed vs Smart Money Sell)" : "机会: 散户恐慌而机构在吸筹 (Retail Fear vs Smart Money Buy)"}
                 </div>
             )}
        </div>
    );
};

// NEW: Institutional Mechanics Component
const InstitutionalMechanics = ({ wyckoff, volume, smc }: { wyckoff?: WyckoffData, volume?: VolumeProfile, smc?: SMCData }) => {
    if (!wyckoff && !volume && !smc) return null;

    const getWyckoffColor = (phase: string) => {
        if (phase.includes('Accumulation') || phase.includes('Markup')) return 'text-green-400 border-green-500/30 bg-green-900/10';
        if (phase.includes('Distribution') || phase.includes('Markdown')) return 'text-red-400 border-red-500/30 bg-red-900/10';
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/10';
    };

    return (
        <div className="bg-[#0b1215] rounded-xl p-4 border border-gray-800 relative overflow-hidden group hover:border-indigo-500/20 transition-colors mb-4">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Magnet className="w-20 h-20 text-indigo-500"/></div>
            
            <div className="flex justify-between items-start mb-4 border-b border-gray-800/50 pb-2">
                 <h3 className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                    <BarChart className="w-3 h-3 text-indigo-400" /> 机构操盘逻辑 (Institutional Mechanics)
                 </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                
                {/* Wyckoff Phase */}
                {wyckoff && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                             <span className="text-[9px] text-gray-500 uppercase font-bold">威科夫周期 (Wyckoff Phase)</span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getWyckoffColor(wyckoff.phase)}`}>{wyckoff.phase}</span>
                        </div>
                        {/* Phase Bar */}
                        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-800 gap-px">
                            <div className={`flex-1 ${wyckoff.phase.includes('Accumulation') ? 'bg-green-500' : 'bg-gray-700 opacity-30'}`}></div>
                            <div className={`flex-1 ${wyckoff.phase.includes('Markup') ? 'bg-green-400' : 'bg-gray-700 opacity-30'}`}></div>
                            <div className={`flex-1 ${wyckoff.phase.includes('Distribution') ? 'bg-red-500' : 'bg-gray-700 opacity-30'}`}></div>
                            <div className={`flex-1 ${wyckoff.phase.includes('Markdown') ? 'bg-red-400' : 'bg-gray-700 opacity-30'}`}></div>
                        </div>
                        {wyckoff.event !== 'None' && (
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 font-bold">事件: {wyckoff.event}</span>
                                <span className="text-[9px] text-gray-500 truncate">{wyckoff.analysis}</span>
                             </div>
                        )}
                    </div>
                )}

                {/* Smart Money Concepts */}
                {smc && (
                    <div className="bg-[#151c24] p-3 rounded-lg border border-gray-800/50">
                        <div className="flex items-center gap-2 mb-2">
                             <Magnet className="w-3 h-3 text-purple-400" />
                             <span className="text-[10px] text-gray-400 uppercase font-bold">聪明钱 (Smart Money)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-600">流动性 (Liquidity)</span>
                                <span className={`text-[10px] font-bold ${smc.liquidityStatus.includes('Swept') ? 'text-green-400' : 'text-gray-300'}`}>{smc.liquidityStatus}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[9px] text-gray-600">缺口 (FVG)</span>
                                <span className="text-[10px] font-bold text-blue-300 truncate">{smc.fairValueGapStatus || 'None'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Volume Profile */}
                {volume && (
                    <div className="bg-[#151c24] p-3 rounded-lg border border-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <Layers className="w-3 h-3 text-yellow-400" />
                                <span className="text-[10px] text-gray-400 uppercase font-bold">筹码分布 (Volume Profile)</span>
                             </div>
                             <span className={`text-[9px] font-bold ${volume.verdict.includes('Overhead') ? 'text-red-400' : 'text-green-400'}`}>{volume.verdict}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             {volume.hvnLevels.length > 0 ? volume.hvnLevels.map((lvl, i) => (
                                <span key={i} className="text-[9px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-mono">HVN: {formatCurrency(lvl)}</span>
                             )) : <span className="text-[9px] text-gray-600">正在计算筹码峰...</span>}
                             
                             {volume.lvnZones.length > 0 && (
                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">真空区: {volume.lvnZones[0]}</span>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// NEW: Adversarial Tribunal Component
const TribunalDisplay = ({ tribunal }: { tribunal: MarketTribunal }) => {
    return (
        <div className="bg-[#0b1215] rounded-xl border border-gray-800 overflow-hidden relative group mb-4">
            {/* Gavel Background Graphic */}
            <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
                <Gavel className="w-24 h-24 text-gray-500" />
            </div>
            
            <div className="p-4 border-b border-gray-800/50 bg-[#151c24]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-yellow-500/10 text-yellow-500 p-1.5 rounded-lg border border-yellow-500/30">
                        <ScaleIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Adversarial Tribunal</h3>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Permabull vs Permabear Debate</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Permabull Case */}
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-800 bg-green-900/5 relative">
                    <div className="flex items-center gap-2 mb-3">
                         <ThumbsUp className="w-4 h-4 text-green-500" />
                         <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Permabull (死多头)</span>
                    </div>
                    <ul className="space-y-2">
                        {tribunal.bullCase.arguments.map((arg, idx) => (
                            <li key={idx} className="flex gap-2 text-[11px] text-gray-300 leading-snug">
                                <span className="text-green-500 font-bold">•</span>
                                <span>{arg.point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Permabear Case */}
                <div className="p-4 bg-red-900/5 relative">
                    <div className="flex items-center gap-2 mb-3">
                         <ThumbsDown className="w-4 h-4 text-red-500" />
                         <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Permabear (死空头)</span>
                    </div>
                    <ul className="space-y-2">
                        {tribunal.bearCase.arguments.map((arg, idx) => (
                            <li key={idx} className="flex gap-2 text-[11px] text-gray-300 leading-snug">
                                <span className="text-red-500 font-bold">•</span>
                                <span>{arg.point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Chief Justice Verdict */}
            <div className="bg-[#0b1215] border-t border-gray-800 p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 via-purple-500 to-yellow-500"></div>
                
                <div className="flex items-start gap-3">
                    <Gavel className="w-6 h-6 text-gray-500 mt-0.5 shrink-0" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] text-gray-400 font-bold uppercase">大法官裁决 (Verdict)</span>
                             <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tribunal.chiefJustice.winner === 'BULLS' ? 'bg-green-500/20 text-green-400 border-green-500/50' : tribunal.chiefJustice.winner === 'BEARS' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                                 胜方: {tribunal.chiefJustice.winner}
                             </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                            "{tribunal.chiefJustice.reasoning}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// NEW: Correlation & Catalyst Strip
const CorrelationStrip = ({ correlation, catalyst }: { correlation?: CorrelationMatrix, catalyst?: CatalystRadar }) => {
    if (!correlation && !catalyst) return null;

    const isHeadwind = correlation?.impact.includes('Headwind');
    const isTailwind = correlation?.impact.includes('Tailwind');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {correlation && (
                <div className={`p-3 rounded-lg border flex items-center justify-between min-w-0 ${isHeadwind ? 'bg-red-500/5 border-red-500/20' : isTailwind ? 'bg-green-500/5 border-green-500/20' : 'bg-[#1a232e] border-gray-800'}`}>
                    <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> 跨市场关联 (Correlation)
                        </span>
                        <div className="text-xs font-bold text-gray-300 mt-1 flex items-center gap-2">
                             <span>{correlation.correlatedAsset}</span>
                             <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isHeadwind ? 'text-red-400 border-red-500/30' : 'text-gray-400 border-gray-700'}`}>{correlation.correlationType}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                         <div className={`text-xs font-bold ${isHeadwind ? 'text-red-400' : isTailwind ? 'text-green-400' : 'text-gray-400'}`}>
                             {correlation.impact}
                         </div>
                         <div className="text-[9px] text-gray-600 font-mono">{correlation.assetTrend} 趋势</div>
                    </div>
                </div>
            )}
            
            {catalyst && (
                <div className="p-3 rounded-lg border bg-[#1a232e] border-gray-800 flex items-center justify-between relative overflow-hidden min-w-0">
                    {catalyst.eventImpact === 'High Volatility' && <div className="absolute right-0 top-0 p-1"><span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span></span></div>}
                    <div className="flex flex-col min-w-0 flex-1 mr-3">
                         <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center gap-1 whitespace-nowrap">
                            <CalendarClock className="w-3 h-3" /> 关键事件雷达 (Catalyst)
                        </span>
                        <div className="text-xs font-bold text-gray-200 mt-1 truncate" title={catalyst.nextEvent}>
                            {catalyst.nextEvent}
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0 z-10">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mb-0.5 whitespace-nowrap ${catalyst.eventImpact === 'High Volatility' ? 'text-orange-400 border-orange-500/30 bg-orange-900/10' : 'text-blue-400 border-blue-500/30'}`}>
                            {catalyst.eventImpact}
                        </span>
                        <span className="text-[8px] text-gray-500 max-w-[100px] truncate">{catalyst.timingWarning}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// NEW: Fractal Resonance Strip
const ResonanceStrip = ({ resonance }: { resonance: TrendResonance }) => {
    const getTrendIcon = (trend: string) => {
        if (trend.includes('Bullish')) return <ArrowBigUp className="w-4 h-4 text-green-500 fill-green-500/20" />;
        if (trend.includes('Bearish')) return <ArrowBigDown className="w-4 h-4 text-red-500 fill-red-500/20" />;
        return <Minus className="w-4 h-4 text-yellow-500" />;
    };

    const isConflict = resonance.resonance.includes('Conflict');
    const isResonant = resonance.resonance.includes('Resonant');

    return (
        <div className={`p-3 rounded-lg border mb-4 flex items-center justify-between ${isResonant ? 'bg-green-500/5 border-green-500/20' : isConflict ? 'bg-orange-500/5 border-orange-500/20' : 'bg-[#1a232e] border-gray-800'}`}>
             <div className="flex items-center gap-4">
                <div className="flex flex-col">
                     <span className="text-[9px] text-gray-500 uppercase font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> 分形共振 (Fractal)
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-[#0b1215] px-1.5 py-0.5 rounded border border-gray-700" title="Higher Timeframe">
                            <span className="text-[9px] text-gray-500 font-bold">HTF</span>
                            {getTrendIcon(resonance.trendHTF)}
                        </div>
                         <ArrowRight className="w-3 h-3 text-gray-600" />
                        <div className="flex items-center gap-1 bg-[#0b1215] px-1.5 py-0.5 rounded border border-gray-700" title="Lower Timeframe">
                            <span className="text-[9px] text-gray-500 font-bold">LTF</span>
                            {getTrendIcon(resonance.trendLTF)}
                        </div>
                    </div>
                </div>
             </div>
             <div className="text-right">
                <div className={`text-xs font-bold ${isResonant ? 'text-green-400' : isConflict ? 'text-orange-400' : 'text-gray-400'}`}>
                    {resonance.resonance}
                </div>
                <div className="text-[9px] text-gray-600">Multi-Timeframe Align</div>
             </div>
        </div>
    );
}

// NEW: Trinity Consensus UI
const TrinityConsensusCard = ({ consensus, smartMoney, hasVisual }: { consensus: TrinityConsensus, smartMoney?: SmartMoneyAnalysis, hasVisual?: boolean }) => {
    const getVerdictColor = (v: string) => v.includes('STRONG') ? 'text-green-400 bg-green-500/10 border-green-500/30' : v.includes('DIVERGENCE') ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    
    return (
        <div className="bg-[#0b1215] rounded-xl p-4 border border-gray-800 relative overflow-hidden group hover:border-blue-500/20 transition-colors">
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Scale className="w-20 h-20 text-blue-500"/></div>
             
             <div className="flex justify-between items-start mb-4 border-b border-gray-800/50 pb-2">
                 <h3 className="text-gray-500 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                    <Scale className="w-3 h-3 text-blue-400" /> 三位一体共识 (Trinity Consensus 2.0)
                 </h3>
                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getVerdictColor(consensus.consensusVerdict)}`}>
                    {consensus.consensusVerdict}
                 </span>
             </div>

             <div className="grid grid-cols-3 gap-3 mb-4">
                 <div className="bg-[#151c24] p-2 rounded-lg text-center border border-gray-800">
                     <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">量化派 (Quant)</div>
                     <div className="text-lg font-mono font-bold text-blue-400">{consensus.quantScore}</div>
                 </div>
                 <div className="bg-[#151c24] p-2 rounded-lg text-center border border-gray-800">
                     <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">资金派 (Money)</div>
                     <div className="text-lg font-mono font-bold text-yellow-400">{consensus.smartMoneyScore}</div>
                 </div>
                 <div className="bg-[#151c24] p-2 rounded-lg text-center border border-gray-800 relative overflow-hidden">
                     {/* Visual Indicator */}
                     {hasVisual && <div className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-indigo-500/20" title="Vision Model Active"><Eye className="w-2.5 h-2.5 text-indigo-400 animate-pulse"/></div>}
                     <div className="text-[9px] text-gray-500 font-bold uppercase mb-1 flex items-center justify-center gap-1">图表/宏观 (Chart)</div>
                     <div className="text-lg font-mono font-bold text-purple-400">{consensus.chartPatternScore}</div>
                 </div>
             </div>

             {/* Smart Money Insight */}
             {smartMoney && (
                <div className="bg-[#151c24]/50 rounded-lg p-2 border border-gray-800/50 flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${smartMoney.smartMoneyAction.includes('Accumulating') || smartMoney.smartMoneyAction.includes('Marking Up') ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                         <span className="text-gray-400">主力动作: <span className="text-white font-bold">{smartMoney.smartMoneyAction}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">散户情绪:</span>
                        <span className={`${smartMoney.retailSentiment === 'Greed' ? 'text-green-400' : smartMoney.retailSentiment === 'Fear' ? 'text-red-400' : 'text-gray-400'} font-bold`}>{smartMoney.retailSentiment}</span>
                    </div>
                </div>
             )}
        </div>
    );
};

// NEW: Trading Blueprint Component
const LogicBlueprint = ({ setup }: { setup: TradingSetup }) => {
    return (
        <div className="bg-[#151c24] border border-blue-500/20 rounded-xl overflow-hidden relative group">
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="p-4 relative z-10">
                <h3 className="text-[10px] text-blue-400 font-bold uppercase mb-4 flex items-center gap-2 tracking-widest border-b border-blue-500/20 pb-2">
                    <PenTool className="w-3 h-3" /> 核心策略形态 (Strategy Identity)
                </h3>

                <div className="grid grid-cols-1 gap-4">
                     {/* Identity */}
                     <div className="flex items-center gap-3">
                        <div className="font-mono text-sm text-white font-bold bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-md flex-1 truncate text-center">
                            {setup.strategyIdentity || "Structure Analysis"}
                        </div>
                     </div>

                     {/* Triggers */}
                     <div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500"/> 进场信号 (Triggers)</div>
                        <ul className="space-y-2">
                            {setup.confirmationTriggers.map((trigger, idx) => (
                                <li key={idx} className="flex gap-2 text-[11px] text-gray-300 bg-[#0b1215] p-1.5 rounded border border-gray-800/50">
                                    <span className="text-blue-500 font-mono font-bold">[{idx+1}]</span>
                                    <span>{trigger}</span>
                                </li>
                            ))}
                        </ul>
                     </div>

                     {/* Invalidation */}
                     <div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-1"><AlertOctagon className="w-3 h-3 text-red-500"/> 止损/失效条件 (Invalidation)</div>
                        <div className="text-[11px] text-red-300 bg-red-900/10 border border-red-500/30 p-2 rounded-lg leading-relaxed flex items-start gap-2">
                            <span className="text-red-500 font-bold">!</span>
                            {setup.invalidationPoint}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};


// Enhanced Threat Report Parser with Terminal Aesthetic (Structured Data)
const CriticTerminal = ({ redTeam }: { redTeam: RedTeaming }) => {
    
    // Severity Logic
    const severityColor = 
        redTeam.severity === 'CRITICAL' ? 'text-red-500 animate-pulse' :
        redTeam.severity === 'HIGH' ? 'text-red-400' :
        redTeam.severity === 'MEDIUM' ? 'text-yellow-400' :
        'text-blue-400';
    
    const severityBg = 
        redTeam.severity === 'CRITICAL' ? 'bg-red-500/20 border-red-500' :
        redTeam.severity === 'HIGH' ? 'bg-red-500/10 border-red-500/50' :
        redTeam.severity === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/50' :
        'bg-blue-500/10 border-blue-500/50';

    return (
        <div className="bg-[#0c0c0c] rounded-xl border border-gray-800 p-4 font-mono text-xs relative overflow-hidden group shadow-inner">
            {/* Terminal Scan Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 animate-[scan_3s_linear_infinite] z-10 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                <span className="text-gray-500 font-bold uppercase flex items-center gap-2 tracking-widest">
                   <ShieldAlert className="w-3 h-3 text-purple-400" />
                   CRITIC_PROTOCOL.LOG
                </span>
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${severityBg} ${severityColor}`}>
                    DEFCON_{redTeam.severity}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Stress Test */}
                <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <span className="text-purple-400 font-bold text-[9px] block mb-1">{'>>'} STRESS_TEST (压力测试)</span>
                    <span className="text-gray-300 leading-relaxed">{redTeam.stressTest}</span>
                </div>

                {/* Risks Section */}
                <div className="space-y-2">
                    <div className="text-red-400 font-bold flex items-center gap-2 text-[10px] uppercase">
                        <Siren className="w-3 h-3" />
                        <span>DETECTED_RISKS (潜在风险)</span>
                    </div>
                    <ul className="space-y-1.5">
                        {redTeam.risks.map((t, i) => (
                            <li key={i} className="flex gap-3 text-red-200/80 leading-relaxed hover:text-red-200 transition-colors bg-red-900/5 p-1 rounded">
                                <span className="text-red-500 font-bold shrink-0 opacity-50">[{i+1}]</span>
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Mitigations Section */}
                <div className="space-y-2">
                     <div className="text-blue-400 font-bold flex items-center gap-2 text-[10px] uppercase">
                        <ShieldCheck className="w-3 h-3" />
                        <span>MITIGATION_PROTOCOLS (应对策略)</span>
                    </div>
                    <ul className="space-y-1.5">
                        {redTeam.mitigations.map((m, i) => (
                            <li key={i} className="flex gap-3 text-blue-200/80 leading-relaxed hover:text-blue-200 transition-colors bg-blue-900/5 p-1 rounded">
                                <span className="text-blue-500 font-bold shrink-0 opacity-50">{'>>'}</span>
                                <span>{m}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
             <div className="mt-4 pt-2 border-t border-gray-800 text-[9px] text-gray-600 flex justify-between">
                <span>SESSION_ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                <span className="animate-pulse">_CURSOR_ACTIVE</span>
            </div>
        </div>
    );
};

// ** VISUAL PIPELINE LOADING STATE **
const AnalysisLoadingState = () => {
    const [step, setStep] = useState(0);
    const steps = [
        { id: 0, text: "INIT_TRIBUNAL (法庭辩论)", sub: "正在召开多空法庭辩论 (Adversarial Debate)..." },
        { id: 1, text: "MINING_HARD_DATA (数据验证)", sub: "正在全网验证 RSI、PE、市值等硬数据..." },
        { id: 2, text: "AGGREGATE_SENTIMENT (舆情聚合)", sub: "正在扫描 Reddit/Twitter/Guba 社交舆情..." },
        { id: 3, text: "SCAN_GAMMA (期权/资金)", sub: "正在计算期权痛点 (Max Pain) 或 北向资金..." },
        { id: 4, text: "CALC_REGIME (市场体制)", sub: "正在判定市场体制与自适应策略 (Regime)..." }, 
        { id: 5, text: "EXEC_STRESS_TEST (压力测试)", sub: "红队风控正在进行压力测试..." }
    ];

    useEffect(() => {
        // Extended timings for Pro (Total ~15s)
        const timings = [3000, 3000, 3000, 2000, 2000, 3000];
        let currentStep = 0;
        const nextStep = () => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                setStep(currentStep);
                setTimeout(nextStep, timings[currentStep]);
            }
        };
        const initTimer = setTimeout(nextStep, timings[0]);
        return () => clearTimeout(initTimer);
    }, []);

    return (
      <div className="bg-[#0b1215] rounded-xl border border-gray-800 p-6 h-full flex flex-col relative overflow-hidden shadow-2xl">
        {/* Background Grid & Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1215] via-transparent to-transparent"></div>
        
        {/* Central HUD - RESTRUCTURED FOR SPACING */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            {/* Increased bottom margin to mb-20 to separate spinner from title */}
            <div className="relative mb-20 scale-110 md:scale-125">
                <div className="absolute -inset-8 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="w-24 h-24 rounded-full border border-gray-700 flex items-center justify-center relative bg-[#0b1215] shadow-2xl">
                    <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin duration-[3s]"></div>
                    <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin [animation-direction:reverse] duration-[5s]"></div>
                    <div className="absolute inset-4 border-l-2 border-cyan-500 rounded-full animate-spin duration-[2s]"></div>
                    <Cpu className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                
                {/* Moved progress label down further with -bottom-16 */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 text-center space-y-3">
                     <div className="text-[10px] font-mono text-blue-400 animate-pulse tracking-widest">THINKING_3D...</div>
                    <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden w-full">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-[shimmer_2s_infinite] w-full" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Added top margin mt-6 for breathing room */}
            <h3 className="mt-6 text-xl font-bold text-white tracking-tight flex items-center gap-3 mb-3 animate-pulse">
                GEMINI <span className="text-blue-500">TRIBUNAL</span>
            </h3>
            
            <div className="flex flex-col items-center gap-2 h-12">
                 <span className="text-sm font-bold text-gray-200 tracking-wide transition-all">
                    {steps[step].sub}
                </span>
                <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">
                   {'>>'} {steps[step].text}
                </span>
            </div>
        </div>

        {/* Terminal Log */}
        <div className="h-32 border-t border-gray-800 pt-4 relative bg-[#080a0c] rounded-lg p-3 font-mono text-[10px] shadow-inner overflow-hidden">
             <div className="absolute top-0 left-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent h-[1px] w-full"></div>
             <div className="space-y-1.5 opacity-80">
                {steps.map((s, idx) => (
                    <div key={idx} className={`flex items-center gap-2 transition-all duration-300 ${idx === step ? 'text-white translate-x-1' : idx < step ? 'text-green-500/70' : 'text-gray-700 blur-[1px]'}`}>
                        <span className="w-4">{idx < step ? '[OK]' : idx === step ? '>' : '.'}</span>
                        <span>{s.text}</span>
                        {idx === step && <span className="animate-pulse text-blue-400">_</span>}
                    </div>
                ))}
             </div>
        </div>
      </div>
    );
};

// NEW: Data Mining Card for No-Image Text Mode
const DataMiningCard = ({ data }: { data: DataMining }) => {
    const isHighConf = data.confidenceLevel === 'High';
    const isLowConf = data.confidenceLevel === 'Low';
    
    return (
        <div className="bg-[#0c1015] rounded-xl p-4 border border-blue-900/30 relative overflow-hidden group ml-1">
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Database className="w-16 h-16 text-blue-500"/></div>
             <div className="flex items-center justify-between mb-3 border-b border-gray-800/50 pb-2">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Network className="w-2 h-2"/> DEEP MINING</span>
                    <h3 className="text-blue-400 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                        全网数据三角定位
                    </h3>
                </div>
                <div className={`text-[9px] px-2 py-0.5 rounded border font-mono ${isHighConf ? 'text-green-400 border-green-500/30' : isLowConf ? 'text-red-400 border-red-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                    置信度: {data.confidenceLevel}
                </div>
             </div>

            <div className="grid grid-cols-1 gap-2 mb-3">
                 <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">关键数据锚点 (Anchors)</div>
                 {data.keyDataPoints.slice(0, 3).map((point, i) => (
                     <div key={i} className="flex gap-2 text-[10px] text-gray-300 bg-[#151c24] p-1.5 rounded border border-gray-800/50">
                         <span className="text-blue-500 font-mono">0{i+1}</span>
                         <span>{point}</span>
                     </div>
                 ))}
            </div>
            
            {data.contradictions.length > 0 && (
                <div className="bg-red-900/10 p-2 rounded border border-red-500/20">
                     <div className="text-[9px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5"/> 数据分歧 (Divergence)</div>
                     <div className="text-[10px] text-red-200/70 leading-relaxed">
                         {data.contradictions[0]}
                     </div>
                </div>
            )}
        </div>
    );
};

const MarketBadge = ({ context }: { context: string }) => {
    let icon = <Globe className="w-3 h-3" />;
    let text = "GLOBAL";
    let style = "bg-blue-500/10 border-blue-500/30 text-blue-400";
    
    if (context === 'CN_ASHARE') {
        icon = <Landmark className="w-3 h-3" />;
        text = "A股策略 (CN POLICY)";
        style = "bg-red-500/10 border-red-500/30 text-red-400";
    } else if (context === 'US_EQUITY') {
        icon = <BarChart4 className="w-3 h-3" />;
        text = "美股/机构 (INSTITUTIONAL)";
        style = "bg-green-500/10 border-green-500/30 text-green-400";
    } else if (context === 'CRYPTO') {
        icon = <Coins className="w-3 h-3" />;
        text = "加密资产 (CRYPTO)";
        style = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    }
    
    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${style} shadow-sm`}>
            {icon} {text}
        </div>
    );
}

// Visual Connector Component for the Funnel
const LogicConnector = ({ label, sub, color = "blue" }: { label?: string, sub?: string, color?: "blue" | "purple" | "yellow" | "red" | "green" }) => {
    const colors = {
        blue: "text-blue-400 border-blue-500/30 bg-blue-900/20",
        purple: "text-purple-400 border-purple-500/30 bg-purple-900/20",
        yellow: "text-yellow-400 border-yellow-500/30 bg-yellow-900/20",
        red: "text-red-400 border-red-500/30 bg-red-900/20",
        green: "text-green-400 border-green-500/30 bg-green-900/20",
    };
    
    return (
        <div className="flex flex-col items-center justify-center py-2 relative z-0">
             <div className="w-px h-4 bg-gradient-to-b from-gray-700/0 via-gray-700/50 to-gray-700/50"></div>
             {label && (
                <div className="flex flex-col items-center my-1 z-10">
                    <div className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-[0_2px_10px_-5px_rgba(0,0,0,0.5)] backdrop-blur-sm ${colors[color]}`}>
                        {label}
                    </div>
                    {sub && <div className="text-[7px] font-mono text-gray-500 uppercase tracking-tight mt-0.5 bg-[#0b1215] px-1 rounded">{sub}</div>}
                </div>
             )}
             <div className="w-px h-4 bg-gradient-to-b from-gray-700/50 via-gray-700/50 to-gray-700/0"></div>
             <ArrowDown className="w-3 h-3 text-gray-600/50 -mt-2" />
        </div>
    );
};

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, loading, error, onAnalyze, symbol, timeframe }) => {
  const isInitialLoading = loading && !analysis;
  const isRefreshing = loading && !!analysis;
  
  // Header Tooltip States
  const [showWinRateTip, setShowWinRateTip] = useState(false);
  const [showHistoryTip, setShowHistoryTip] = useState(false);

  if (error && !analysis) {
      return (
        <div className="bg-[#151c24] rounded-xl border border-red-500/20 p-8 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="p-4 bg-red-500/10 rounded-full mb-4 animate-bounce">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">分析请求失败</h3>
            <p className="text-red-400 text-sm mb-6 max-w-[280px] leading-relaxed opacity-80">
                {error}
            </p>
            <button onClick={onAnalyze} className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <RefreshCcwIcon /> 重试 (Retry)
            </button>
        </div>
      );
  }

  if (isInitialLoading) return <AnalysisLoadingState />;

  if (!analysis) {
    return (
      <div className="bg-[#151c24] rounded-xl border border-gray-800 p-8 h-full flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30 animate-[pulse_8s_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1215] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

        {/* SYSTEM ARCHITECTURE VISUALIZATION */}
        <div className="relative w-full h-48 mb-8 flex items-center justify-center select-none pointer-events-none scale-90 lg:scale-100">
            {/* Connecting Lines with Data Flow Animation */}
            <div className="absolute top-1/2 left-[20%] right-[20%] h-[1px] bg-gray-800 -z-20"></div>
            {/* Left to Center Packet */}
            <div className="absolute top-1/2 left-[20%] w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] hidden md:block" style={{ animationDuration: '3s' }}></div>
            {/* Center to Right Packet */}
            <div className="absolute top-1/2 right-[20%] w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_8px_red] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] hidden md:block" style={{ animationDuration: '3s', animationDelay: '1.5s' }}></div>
            
            {/* Center Node (AI) */}
            <div className="relative z-10 group/core">
                <div className="absolute -inset-6 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="w-20 h-20 bg-[#0b1215] border border-blue-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] relative z-20 transition-transform duration-500 group-hover/core:scale-110">
                    <Bot className="w-8 h-8 text-blue-400 group-hover/core:text-blue-300 transition-colors" />
                </div>
                {/* Orbital Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-blue-500/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border border-purple-500/10 rounded-full animate-[spin_12s_linear_infinite_reverse] border-dashed"></div>
                
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap bg-[#0b1215] px-2 py-0.5 rounded border border-blue-500/20">Gemini 3 Core</div>
            </div>

            {/* Left Node: Market Data Feed */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-[#1a232e] border border-gray-700 rounded-lg flex items-center justify-center z-10 shadow-lg group-hover:border-cyan-500/50 transition-colors">
                    <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="h-[1px] w-24 bg-gradient-to-r from-cyan-500/50 to-transparent absolute left-full top-1/2 -translate-y-1/2 -z-10"></div>
                <div className="absolute top-full mt-2 text-[8px] text-gray-600 uppercase tracking-wider font-bold">Live Feed</div>
            </div>

            {/* Right Node: Red Team Critic */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2">
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-red-500/50 absolute right-full top-1/2 -translate-y-1/2 -z-10"></div>
                <div className="w-10 h-10 bg-[#1a232e] border border-red-500/30 rounded-lg flex items-center justify-center z-10 shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:border-red-500/60 transition-colors">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div className="absolute top-full mt-2 text-[8px] text-gray-600 uppercase tracking-wider font-bold">Critic Protocol</div>
            </div>

            {/* Top Node: Sentiment */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
                 <div className="w-8 h-8 bg-[#1a232e] border border-gray-700 rounded-lg flex items-center justify-center z-10">
                    <Users className="w-4 h-4 text-green-400" />
                </div>
                <div className="w-[1px] h-12 bg-gradient-to-b from-green-500/30 to-transparent absolute top-full left-1/2 -translate-x-1/2 -z-10"></div>
            </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8 text-[9px] text-gray-500 font-mono uppercase tracking-widest">
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>System Online</div>
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Latency: 12ms</div>
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>Trinity: Active</div>
        </div>
        
        {/* Enhanced Launch Button */}
        <button 
            onClick={onAnalyze} 
            className="relative group w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white p-[1px] transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
        >
            <div className="relative h-full w-full bg-white rounded-[10px] py-4 flex items-center justify-center gap-3 overflow-hidden">
                {/* Holographic Sweep Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-0"></div>
                
                <div className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 fill-purple-100 animate-pulse" />
                    <span className="text-sm font-black text-black tracking-widest uppercase">启动深度分析 (Start Analysis)</span>
                    <Zap className="w-4 h-4 text-blue-600 fill-blue-100" />
                </div>
            </div>
        </button>

        <p className="mt-4 text-[10px] text-gray-600 text-center max-w-xs mx-auto leading-relaxed">
            Execute <span className="text-blue-400">Adversarial Tribunal Protocol</span> to perform a 3-way debate between Bull, Bear, and Chief Justice.
        </p>
      </div>
    );
  }

  const isBuy = analysis.signal === SignalType.BUY;
  const isSell = analysis.signal === SignalType.SELL;
  const signalColor = isBuy ? 'text-[#00bfa5]' : isSell ? 'text-[#ff5252]' : 'text-gray-400';
  const SignalIcon = isBuy ? TrendingUp : isSell ? TrendingDown : Minus;
  
  const divergenceData = generateDivergenceData(symbol, analysis.correlationMatrix, analysis.signal, timeframe);
  
  const structureColor = 
    analysis.marketStructure?.includes('Bullish') ? 'text-green-400 border-green-500/30 bg-green-500/10' :
    analysis.marketStructure?.includes('Bearish') ? 'text-red-400 border-red-500/30 bg-red-500/10' :
    analysis.marketStructure?.includes('Ranging') ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
    'text-blue-400 border-blue-500/30 bg-blue-500/10';

  let predictionPercentage = 50;
  if (analysis.futurePrediction && analysis.realTimePrice) {
      const { targetLow, targetHigh } = analysis.futurePrediction;
      const range = targetHigh - targetLow;
      if (range > 0) {
          const rawPercent = ((analysis.realTimePrice - targetLow) / range) * 100;
          predictionPercentage = Math.min(Math.max(rawPercent, 0), 100);
      }
  }

  // --- MARKET CONTEXT HELPERS ---
  const isAShare = analysis.marketContext === 'CN_ASHARE';
  const instLabel = isAShare ? '北向/主力 (Main Force)' : '机构/暗池 (Inst. Flow)';
  const blockTradeLabel = isAShare ? '大单 (Large Orders)' : '大宗 (Block Trades)';

  return (
    <div className="bg-[#151c24] rounded-xl border border-gray-800 p-6 flex flex-col h-full relative shadow-2xl">
        {isRefreshing && (
          <div className="absolute inset-0 bg-[#151c24]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity duration-300 rounded-xl">
             <div className="bg-[#0b1215]/90 p-6 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-xs text-white font-bold uppercase tracking-widest">正在重新推演 (Re-Evaluating)...</p>
             </div>
          </div>
        )}

        {/* 1. HEADER & VERDICT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-800/50">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
                 <div className={`text-[10px] px-2.5 py-1 rounded-md font-bold border uppercase flex items-center gap-1.5 ${structureColor} shadow-sm`}>
                    <Layers className="w-3 h-3" /> {translateTerm(analysis.marketStructure)}
                 </div>
                 {/* Market Context Badge */}
                 {analysis.marketContext && <MarketBadge context={analysis.marketContext} />}
            </div>
            <div className={`flex items-center gap-3 text-4xl sm:text-5xl font-black ${signalColor} tracking-tighter filter drop-shadow-lg`}>
              <SignalIcon className="w-10 h-10" />
              {analysis.signal === 'BUY' ? '做多' : analysis.signal === 'SELL' ? '做空' : '观望'}
            </div>
          </div>
          
          <div className="flex flex-col sm:items-end gap-2.5 w-full sm:w-auto shrink-0">
              <div 
                  className="bg-[#0b1215] p-3 rounded-xl border border-gray-800 flex flex-col items-start sm:items-end gap-1 group relative cursor-pointer hover:border-blue-500/30 transition-colors w-full sm:w-auto"
                  onClick={() => setShowHistoryTip(!showHistoryTip)}
                  onMouseEnter={() => setShowHistoryTip(true)}
                  onMouseLeave={() => setShowHistoryTip(false)}
              >
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                    <History className="w-3 h-3" /> 历史模式回测
                    <HelpCircle className="w-3 h-3 text-gray-700 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </div>
                  <span className="text-2xl font-mono font-medium text-blue-400">{analysis.historicalWinRate}%</span>
                  
                   {/* History Tooltip */}
                   {showHistoryTip && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900 border border-gray-700 p-3 rounded-lg z-50 text-[10px] text-gray-300 shadow-xl pointer-events-none text-left">
                            <strong className="text-white block mb-1">模式回测说明</strong>
                            <p className="leading-relaxed opacity-80">系统检索了过去 5 年中与当前 K 线形态相似度超过 85% 的历史行情，统计其后续上涨概率。</p>
                        </div>
                    )}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 bg-[#0b1215] px-3.5 py-2 rounded-lg border border-gray-800/50 w-full sm:w-auto">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">盈亏比 (R/R)</span>
                <span className="text-xs font-mono font-bold text-white">{analysis.riskRewardRatio}:1</span>
              </div>
          </div>
        </div>

        {/* 2. WIN RATE & SHIELD DRIVERS SECTION (Full-Width Responsive Grid) */}
        <div className="mb-6 pb-6 border-b border-gray-800/50 flex flex-col gap-4">
             <div 
                 className="flex flex-wrap items-center gap-3 text-xs group relative cursor-pointer inline-flex self-start"
                 onClick={() => setShowWinRateTip(!showWinRateTip)}
                 onMouseEnter={() => setShowWinRateTip(true)}
                 onMouseLeave={() => setShowWinRateTip(false)}
             >
                 <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wide border-b border-dotted border-gray-600 flex items-center gap-1">
                     胜率推演 (Calculated Win Rate) <HelpCircle className="w-3 h-3 text-gray-600 group-hover:text-blue-400"/>
                 </div>
                 <div className="h-2 w-24 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                     <div className={`h-full rounded-full transition-all duration-1000 ${isBuy ? 'bg-green-500' : isSell ? 'bg-red-500' : 'bg-gray-500'}`} style={{ width: `${analysis.winRate}%` }}></div>
                 </div>
                 <span className="font-mono font-bold text-white text-lg">{analysis.winRate}%</span>
                 
                 {/* Winrate Tooltip */}
                  {showWinRateTip && (
                     <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-700 p-3 rounded-lg z-50 text-[10px] text-gray-300 shadow-xl pointer-events-none">
                         <strong className="text-white block mb-1">胜率计算逻辑</strong>
                         <p className="leading-relaxed opacity-80">综合技术指标、主力资金、市场情绪及宏观环境四维因子加权计算得出。</p>
                     </div>
                  )}
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4 xl:gap-5 items-stretch w-full">
                 {/* Score Drivers Grid */}
                 {analysis.scoreDrivers && (
                     <div className="sm:col-span-2 xl:col-span-1 flex flex-col justify-between">
                         <h4 className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-1.5 tracking-wider">
                             <Sliders className="w-3.5 h-3.5 text-blue-400"/> 胜率归因因子 (Score Drivers)
                         </h4>
                         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
                              <ScoreDriverItem label="技术 (Tech)" weight={40} score={analysis.scoreDrivers?.technical ?? 50} color="text-blue-400" icon={<Activity className="w-3 h-3"/>} />
                              <ScoreDriverItem label="资金 (Flow)" weight={30} score={analysis.scoreDrivers?.institutional ?? 50} color="text-yellow-400" icon={<Wallet className="w-3 h-3"/>} />
                              <ScoreDriverItem label="情绪 (Sent)" weight={20} score={analysis.scoreDrivers?.sentiment ?? 50} color="text-green-400" icon={<Users className="w-3 h-3"/>} />
                              <ScoreDriverItem label="宏观 (Macr)" weight={10} score={analysis.scoreDrivers?.macro ?? 50} color="text-purple-400" icon={<Globe className="w-3 h-3"/>} />
                         </div>
                     </div>
                 )}

                 {/* Mini Performance Divergence Chart (Explicit parent dimension) */}
                 <div className="bg-[#0b1215]/60 border border-gray-800/80 rounded-xl p-3.5 flex flex-col gap-2.5 min-h-[142px] relative overflow-visible shrink-0 group/mini hover:border-blue-500/30 transition-colors w-full">
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500 gap-2">
                         <span className="flex items-center gap-1.5 whitespace-nowrap min-w-0 flex-shrink-0">
                             <LineChart className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /> 
                             <span className="truncate">关联资产背离度</span>
                         </span>
                         <span className="text-[7px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono flex-shrink-0">DIVERGENCE</span>
                     </div>
                     
                     <div className="flex-1 w-full h-[85px] min-h-[85px] relative mt-1">
                         <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={divergenceData} margin={{ top: 2, right: 4, left: 4, bottom: 12 }}>
                                 <defs>
                                     <linearGradient id="divergenceGreenBuy" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#00bfa5" stopOpacity={0.15}/>
                                         <stop offset="95%" stopColor="#00bfa5" stopOpacity={0.01}/>
                                     </linearGradient>
                                     <linearGradient id="divergenceRedSell" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#ff5252" stopOpacity={0.15}/>
                                         <stop offset="95%" stopColor="#ff5252" stopOpacity={0.01}/>
                                     </linearGradient>
                                     <linearGradient id="divergenceNeutral" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                                         <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.01}/>
                                     </linearGradient>
                                 </defs>
                                 
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 7, fontFamily: 'monospace' }} interval="preserveStartEnd" dy={4} />
                                 <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                                 <RechartsTooltip content={<MiniDivergenceTooltip />} />
                                 
                                 {/* Reference Asset (SPY/QQQ/CN300) Area */}
                                 <Area 
                                     type="monotone" 
                                     dataKey="reference" 
                                     name="关联参考"
                                     stroke="#64748b" 
                                     strokeWidth={1} 
                                     strokeDasharray="2 2"
                                     fill="rgba(100, 116, 139, 0.02)" 
                                     dot={false}
                                     activeDot={false}
                                 />
                                 
                                 {/* Selected Asset Area */}
                                 <Area 
                                     type="monotone" 
                                     dataKey="asset" 
                                     name={symbol}
                                     stroke={isBuy ? "#00bfa5" : isSell ? "#ff5252" : "#94a3b8"} 
                                     strokeWidth={1.5} 
                                     fill={isBuy ? "url(#divergenceGreenBuy)" : isSell ? "url(#divergenceRedSell)" : "url(#divergenceNeutral)"}
                                     dot={false} 
                                 />
                             </AreaChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </div>
        </div>

        {/* Scrollable Content - With visual "Logic Chain" line */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 relative pl-2">
            
            {/* Logic Chain Visual Guide (Vertical Line) */}
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700/50 to-transparent hidden lg:block"></div>
            
            <div className="space-y-6 pb-2 lg:pl-8">
                
                {/* --- LAYER 1: CONTEXT (The Truth) --- */}
                <div className="relative">
                    {/* Visual Node */}
                    <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#151c24] z-10 hidden lg:block shadow-[0_0_10px_blue]"></div>
                    {analysis.hardData && <HardDataPanel data={analysis.hardData} marketContext={analysis.marketContext} />}
                    {analysis.volatilityAnalysis && <VolatilityRegimeCard volatility={analysis.volatilityAnalysis} />}
                </div>

                <LogicConnector label="LAYER 2: ENVIRONMENT" sub="THE FLOW" color="blue" />

                {/* --- LAYER 2: ENVIRONMENT (The Flow) --- */}
                <div className="relative">
                     <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full bg-purple-500 border-2 border-[#151c24] z-10 hidden lg:block shadow-[0_0_10px_purple]"></div>
                     <CorrelationStrip correlation={analysis.correlationMatrix} catalyst={analysis.catalystRadar} />
                     {analysis.trendResonance && <ResonanceStrip resonance={analysis.trendResonance} />}
                     {analysis.socialAnalysis && <SocialRadarPanel social={analysis.socialAnalysis} />}
                </div>

                <LogicConnector label="LAYER 3: EVIDENCE" sub="THE CONFLICT" color="purple" />

                {/* --- LAYER 3: EVIDENCE (The Deep Dive) --- */}
                <div className="relative">
                    <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full bg-yellow-500 border-2 border-[#151c24] z-10 hidden lg:block shadow-[0_0_10px_yellow]"></div>
                    
                    {/* NEW 5.0: OPTIONS GAMMA DASHBOARD */}
                    {analysis.optionsData && <OptionsDashboard options={analysis.optionsData} currentPrice={analysis.realTimePrice || 0} />}
                    
                    {/* NEW 5.0: SENTIMENT DIVERGENCE METER */}
                    {analysis.sentimentDivergence && <SentimentDivergenceMeter divergence={analysis.sentimentDivergence} />}

                    {/* NEW: ADVERSARIAL TRIBUNAL */}
                    {analysis.marketTribunal && <TribunalDisplay tribunal={analysis.marketTribunal} />}
                    
                    {/* NEW 4.0: INSTITUTIONAL MECHANICS */}
                    {(analysis.wyckoff || analysis.volumeProfile || analysis.smc) && (
                        <InstitutionalMechanics wyckoff={analysis.wyckoff} volume={analysis.volumeProfile} smc={analysis.smc} />
                    )}
                </div>

                <LogicConnector label="LAYER 4: SYNTHESIS" sub="THE JUDGMENT" color="yellow" />

                {/* --- LAYER 4: SYNTHESIS (The Judgment) --- */}
                <div className="relative">
                    <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full bg-green-500 border-2 border-[#151c24] z-10 hidden lg:block shadow-[0_0_10px_green]"></div>
                    
                    <div className="space-y-4">
                        {/* TRINITY CONSENSUS CARD */}
                        {analysis.trinityConsensus && (
                            <TrinityConsensusCard 
                                consensus={analysis.trinityConsensus} 
                                smartMoney={analysis.smartMoneyAnalysis} 
                                hasVisual={!!analysis.visualAnalysis}
                            />
                        )}
                        
                        {/* NEW: VISUAL OR DATA ANALYSIS CARD */}
                        {analysis.visualAnalysis ? (
                            <div className="bg-indigo-900/10 rounded-xl p-4 border border-indigo-500/30 relative overflow-hidden group ml-1">
                                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50"></div>
                                 <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Eye className="w-16 h-16 text-indigo-500"/></div>
                                 <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PRIMARY SOURCE</span>
                                    <h3 className="text-indigo-400 text-[10px] font-bold uppercase flex items-center gap-2 tracking-widest">
                                        <ScanLine className="w-3 h-3" /> AI 视觉洞察 (Vision Insights)
                                    </h3>
                                 </div>
                                <div className="text-xs text-indigo-200/90 leading-relaxed font-light">
                                    <Typewriter text={analysis.visualAnalysis} speed={5} />
                                </div>
                            </div>
                        ) : analysis.dataMining ? (
                            <DataMiningCard data={analysis.dataMining} />
                        ) : null}
                    
                        {/* Technical Cockpit */}
                        {analysis.technicalIndicators && (
                            <div className="bg-[#0b1215] rounded-xl p-4 border border-gray-800 relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu className="w-16 h-16 text-blue-500"/></div>
                                <h3 className="text-gray-500 text-[10px] font-bold uppercase mb-4 flex items-center gap-2 tracking-widest border-b border-gray-800/50 pb-2">
                                    <Activity className="w-3 h-3 text-blue-400" /> 技术仪表盘 (Technical Evidence)
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {/* RSI */}
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase"><span>RSI</span> <span className={analysis.technicalIndicators.rsi > 70 ? 'text-red-400' : analysis.technicalIndicators.rsi < 30 ? 'text-green-400' : 'text-blue-400'}>{analysis.technicalIndicators.rsi}</span></div>
                                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex relative"><div className="absolute left-0 w-[30%] h-full bg-green-500/20"></div><div className="absolute right-0 w-[30%] h-full bg-red-500/20"></div><div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] transition-all duration-1000 z-10" style={{ left: `${analysis.technicalIndicators.rsi}%` }}></div></div>
                                    </div>
                                    {/* KDJ */}
                                    <div className="flex flex-col gap-1.5"><div className="text-[9px] text-gray-500 font-bold uppercase">KDJ</div><div className="flex items-center gap-2">{analysis.technicalIndicators.kdjStatus ? (<span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit flex items-center gap-1 ${analysis.technicalIndicators.kdjStatus.includes('Golden') || analysis.technicalIndicators.kdjStatus.includes('金叉') ? 'text-green-400 border-green-500/30 bg-green-900/20' : analysis.technicalIndicators.kdjStatus.includes('Death') || analysis.technicalIndicators.kdjStatus.includes('死叉') ? 'text-red-400 border-red-500/30 bg-red-900/20' : 'text-gray-400 border-gray-700 bg-gray-800'}`}>{analysis.technicalIndicators.kdjStatus}</span>) : <span className="text-[10px] text-gray-600">--</span>}</div></div>
                                    {/* MACD */}
                                    <div className="flex flex-col gap-1.5 border-t border-gray-800/50 pt-2"><div className="text-[9px] text-gray-500 font-bold uppercase">MACD</div><div className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit flex items-center gap-1 ${analysis.technicalIndicators.macdStatus.includes('Golden') || analysis.technicalIndicators.macdStatus.includes('金叉') ? 'text-green-400 border-green-500/30 bg-green-900/20' : analysis.technicalIndicators.macdStatus.includes('Death') || analysis.technicalIndicators.macdStatus.includes('死叉') ? 'text-red-400 border-red-500/30 bg-red-900/20' : 'text-gray-400 border-gray-700 bg-gray-800'}`}>{analysis.technicalIndicators.macdStatus}</div></div>
                                    {/* Volume */}
                                    <div className="flex flex-col gap-1.5 border-t border-gray-800/50 pt-2"><div className="text-[9px] text-gray-500 font-bold uppercase">量能 (Vol)</div><span className="text-[10px] text-white font-mono flex items-center gap-2"><BarChart2 className="w-3 h-3 text-blue-400" />{analysis.technicalIndicators.volumeStatus || "Normal"}</span></div>
                                </div>
                                {/* Institutional */}
                                {analysis.institutionalData && (
                                    <div className="mt-4 pt-3 border-t border-gray-800/50 grid grid-cols-2 gap-3 bg-[#151c24]/50 -mx-4 -mb-4 px-4 py-3">
                                        <div className="flex flex-col"><span className="text-[9px] text-gray-500 uppercase font-bold flex gap-1 items-center"><Briefcase className="w-3 h-3"/> {instLabel}</span><span className={`text-xs font-mono font-bold ${analysis.institutionalData.netInflow.includes('-') ? 'text-red-400' : 'text-green-400'}`}>{analysis.institutionalData.netInflow}</span></div>
                                        <div className="flex flex-col items-end"><span className="text-[9px] text-gray-500 uppercase font-bold">{blockTradeLabel}</span><span className="text-xs font-mono text-white">{analysis.institutionalData.blockTrades}</span></div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Reasoning Text (Analysis Note) */}
                        <div className="bg-[#0b1215]/50 p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <BrainCircuit className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">底层逻辑解析 (Analysis Logic)</span>
                            </div>
                            <div className="text-xs text-gray-300/90 font-light leading-relaxed">
                                <Typewriter text={analysis.reasoning} speed={3} />
                            </div>
                        </div>
                    </div>
                </div>

                <LogicConnector label="LAYER 5: DEDUCTION" sub="THE SCENARIOS" color="green" />

                {/* --- LAYER 5: DEDUCTION (The Scenarios) --- */}
                {analysis.scenarios && (
                <div className="relative">
                     <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full bg-green-500 border-2 border-[#151c24] z-10 hidden lg:block shadow-[0_0_10px_green]"></div>
                    <div className="bg-[#0b1215] rounded-xl p-5 border border-gray-800 relative overflow-hidden group hover:border-purple-500/20 transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><GitCommit className="w-20 h-20 text-purple-500"/></div>
                        <h3 className="text-gray-500 text-[10px] font-bold uppercase mb-4 flex items-center gap-2 tracking-widest border-b border-gray-800/50 pb-2">
                            <GitMerge className="w-3 h-3 text-purple-400" /> 情景推演计算 (Calculated Deductions)
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Bullish */}
                            <div className="group/item">
                            <div className="flex justify-between text-xs items-center mb-1">
                                <span className="font-bold text-green-400 flex items-center gap-2 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                    <ArrowUpRight className="w-3.5 h-3.5"/> 牛市剧本 (Bullish)
                                </span>
                                <span className="font-mono text-white text-sm font-bold">{analysis.scenarios.bullish.probability}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${analysis.scenarios.bullish.probability}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-500 bg-[#151c24] p-2 rounded-lg border border-gray-800/50">
                                <span className="text-gray-400 leading-relaxed max-w-[70%]">{analysis.scenarios.bullish.description}</span>
                                <div className="text-right">
                                    <div className="text-[9px] uppercase font-bold text-gray-600">Target</div>
                                    <div className="font-mono text-green-300 font-bold">{formatCurrency(analysis.scenarios.bullish.targetPrice)}</div>
                                </div>
                            </div>
                            </div>

                            {/* Neutral */}
                            <div className="group/item">
                            <div className="flex justify-between text-xs items-center mb-1">
                                <span className="font-bold text-yellow-400 flex items-center gap-2 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                    <Minus className="w-3.5 h-3.5"/> 震荡剧本 (Neutral)
                                </span>
                                <span className="font-mono text-white text-sm font-bold">{analysis.scenarios.neutral.probability}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full" style={{ width: `${analysis.scenarios.neutral.probability}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-500 bg-[#151c24] p-2 rounded-lg border border-gray-800/50">
                                <span className="text-gray-400 leading-relaxed max-w-[70%]">{analysis.scenarios.neutral.description}</span>
                                <div className="text-right">
                                    <div className="text-[9px] uppercase font-bold text-gray-600">Range</div>
                                    <div className="font-mono text-yellow-300 font-bold">{formatCurrency(analysis.scenarios.neutral.targetPrice)}</div>
                                </div>
                            </div>
                            </div>

                            {/* Bearish */}
                            <div className="group/item">
                            <div className="flex justify-between text-xs items-center mb-1">
                                <span className="font-bold text-red-400 flex items-center gap-2 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                    <ArrowDownRight className="w-3.5 h-3.5"/> 熊市剧本 (Bearish)
                                </span>
                                <span className="font-mono text-white text-sm font-bold">{analysis.scenarios.bearish.probability}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: `${analysis.scenarios.bearish.probability}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-500 bg-[#151c24] p-2 rounded-lg border border-gray-800/50">
                                <span className="text-gray-400 leading-relaxed max-w-[70%]">{analysis.scenarios.bearish.description}</span>
                                <div className="text-right">
                                    <div className="text-[9px] uppercase font-bold text-gray-600">Target</div>
                                    <div className="font-mono text-red-300 font-bold">{formatCurrency(analysis.scenarios.bearish.targetPrice)}</div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}
                
                {/* --- LAYER 6: FINAL EXECUTION (The Action) --- */}
                <LogicConnector label="LAYER 6: EXECUTION" sub="THE ACTION" color="red" />

                {analysis.tradingSetup && (
                    <div className="relative">
                        {/* Visual Node - The Destination */}
                        <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full bg-red-500 border-2 border-white z-10 hidden lg:block shadow-[0_0_15px_red] animate-pulse"></div>
                        
                        <div className="space-y-4 relative bg-[#0b1215] rounded-xl border-2 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.15)] p-1 overflow-hidden group">
                            {/* Funnel Tip Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-500 shadow-[0_0_10px_red]"></div>
                            
                            {/* The Blueprint */}
                            <div className="bg-[#151c24] rounded-t-lg p-1">
                                <LogicBlueprint setup={analysis.tradingSetup} />
                            </div>
                            
                            {/* Execution Map - Styled as the destination */}
                            <div className="bg-[#0b1215] p-4 rounded-b-lg border-t border-gray-800">
                                <h3 className="text-blue-400 text-[10px] font-bold uppercase mb-3 flex items-center gap-2 px-1 tracking-widest">
                                    <Map className="w-3 h-3" /> 最终执行地图 (Execution Map)
                                </h3>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="col-span-2 bg-blue-500/10 p-4 rounded-xl border border-blue-500/30 flex items-center justify-between group hover:bg-blue-500/20 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold uppercase">
                                                <Navigation className="w-3 h-3" /> 建议入场 (Entry)
                                            </div>
                                            <div className="text-xs font-mono font-medium text-blue-200 opacity-80 group-hover:opacity-100">
                                                {analysis.entryStrategy || "等待信号 (Wait)"}
                                            </div>
                                        </div>
                                        <div className="text-2xl font-mono font-black text-white tracking-tight shadow-black drop-shadow-md">
                                            {formatCurrency(analysis.entryPrice)}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#151c24] p-3 rounded-xl border border-green-500/20 flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-bold uppercase">
                                            <Target className="w-3 h-3" /> 止盈 (TP)
                                        </div>
                                        <div className="text-lg font-mono font-medium text-white">
                                            {formatCurrency(analysis.takeProfit)}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#151c24] p-3 rounded-xl border border-red-500/20 flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold uppercase">
                                            <ShieldAlert className="w-3 h-3" /> 止损 (SL)
                                        </div>
                                        <div className="text-lg font-mono font-medium text-white">
                                            {formatCurrency(analysis.stopLoss)}
                                        </div>
                                    </div>
                                </div>


                                
                                {/* Key Levels & Prediction */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#151c24] p-3 rounded-xl border border-gray-800">
                                        <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-1">
                                            <span className="text-[9px] text-gray-500 uppercase font-bold">关键位 (Key Levels)</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-red-300" title="Resistance">{formatCurrency(analysis.resistanceLevel || 0)}</span>
                                            <span className="text-gray-600">/</span>
                                            <span className="text-green-300" title="Support">{formatCurrency(analysis.supportLevel || 0)}</span>
                                        </div>
                                    </div>
                                    
                                    {analysis.futurePrediction && (
                                        <div className="bg-[#151c24] p-3 rounded-xl border border-gray-800 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] text-blue-300 font-bold uppercase flex gap-1">
                                                    <Activity className="w-3 h-3"/> 预测区间
                                                </span>
                                                <span className="text-[9px] text-gray-500 font-mono">{analysis.futurePrediction.confidence}%</span>
                                            </div>
                                            <div className="relative h-1.5 bg-gray-800 rounded-full w-full overflow-hidden">
                                                <div className="absolute top-0 bottom-0 bg-blue-500/20 w-full"></div>
                                                <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]" style={{ left: `${predictionPercentage}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-[8px] font-mono text-gray-500 mt-1">
                                                <span>{formatCurrency(analysis.futurePrediction.targetLow)}</span>
                                                <span>{formatCurrency(analysis.futurePrediction.targetHigh)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. RED TEAM CRITIC (Post-Analysis Check) */}
                {analysis.redTeaming && (
                    <div className="relative pt-4">
                         <div className="border-t border-gray-800/50 mb-4 flex items-center justify-center">
                             <span className="bg-[#151c24] px-2 text-[9px] text-gray-600 uppercase">Risk Validation</span>
                         </div>
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase tracking-widest">
                                <ShieldAlert className="w-3 h-3" /> 红队对抗演练 (Critic Protocol)
                            </div>
                            <RadialProgress score={analysis.modelFusionConfidence} size={28} strokeWidth={3} />
                        </div>
                        <CriticTerminal redTeam={analysis.redTeaming} />
                    </div>
                )}
            </div>

        </div>

        <button onClick={onAnalyze} disabled={loading} className="mt-4 w-full py-3 bg-white hover:bg-gray-200 border border-transparent disabled:opacity-50 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"><RefreshCcwIcon className="w-4 h-4" /> 重启深度分析</button>
    </div>
  );
};

const RadarItem = ({ label, value, icon, color }: any) => (
    <div className="bg-[#0b1215] rounded-xl p-3 border border-gray-800 flex flex-col gap-1.5 hover:border-gray-700 transition-colors"><div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase">{icon} {label}</div><div className={`text-[10px] font-bold truncate ${color}`}>{value}</div></div>
);

const RefreshCcwIcon = ({className}: {className?: string}) => (<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12" /><path d="M3 3v9h9" /></svg>);
export default AnalysisCard;