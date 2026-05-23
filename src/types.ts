

export enum Timeframe {
  M1 = '1m',
  M3 = '3m',
  M5 = '5m',
  M15 = '15m',
  M30 = '30m',
  H1 = '1h',
  H2 = '2h',
  H4 = '4h',
  D1 = '1d'
}

export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  NEUTRAL = 'NEUTRAL'
}

export interface GuruInsight {
  name: string; 
  style: string; 
  verdict: string; 
  quote: string; 
}

export interface FuturePrediction {
  targetHigh: number;
  targetLow: number;
  confidence: number; 
  predictionPeriod: string; 
}

export interface MarketRegime {
    macroTrend: 'Risk-On (进攻)' | 'Risk-Off (避险)' | 'Neutral (震荡)';
    sectorPerformance: 'Strong (强势)' | 'Weak (弱势)' | 'Divergent (背离)';
    institutionalAction: 'Accumulation (吸筹)' | 'Distribution (派发)' | 'Neutral (观望)';
}

export interface RiskManagement {
    trailingStop: string;
    scalingStrategy: string;
}

export interface TechnicalIndicators {
    rsi: number; // Relative Strength Index (0-100)
    macdStatus: 'Golden Cross (金叉)' | 'Death Cross (死叉)' | 'Divergence (背离)' | 'Neutral (中性)';
    emaAlignment: 'Bullish Stack (多头排列)' | 'Bearish Stack (空头排列)' | 'Tangled (纠缠)';
    bollingerStatus: 'Squeeze (收口)' | 'Expansion (开口)' | 'Upper Band (触顶)' | 'Lower Band (触底)';
    kdjStatus?: string; 
    volumeStatus?: string; 
}

export interface InstitutionalData {
    netInflow: string; 
    blockTrades: 'High Activity' | 'Moderate' | 'Low';
    mainForceSentiment: 'Aggressive Buy' | 'Passive Sell' | 'Wait & See';
}

// NEW: Explicit drivers for the Win Rate score
export interface ScoreDrivers {
  technical: number;     // Weight: 40%
  institutional: number; // Weight: 30%
  sentiment: number;     // Weight: 20%
  macro: number;         // Weight: 10%
}

export interface MarketScenario {
    probability: number; // Percentage 0-100
    targetPrice: number;
    description: string;
}

export interface RedTeaming {
    risks: string[];
    mitigations: string[];
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    stressTest: string; 
}

export interface TradingSetup {
    strategyIdentity: string; 
    confirmationTriggers: string[]; 
    invalidationPoint: string; 
}

// NEW: Trinity Consensus for Rigor
export interface TrinityConsensus {
    quantScore: number; // Pure math (0-100)
    smartMoneyScore: number; // Volume/Flow (0-100)
    chartPatternScore: number; // Structure (0-100)
    consensusVerdict: 'STRONG_CONFLUENCE (强共振)' | 'MODERATE (一般)' | 'DIVERGENCE (背离)';
}

// NEW: Smart Money specific analysis (VSA/Order Flow)
export interface SmartMoneyAnalysis {
    retailSentiment: 'Fear' | 'Greed' | 'Neutral';
    smartMoneyAction: 'Accumulating (吸筹)' | 'Distributing (派发)' | 'Marking Up (拉升)' | 'Inactive';
    orderBlockStatus: 'Active Supply Zone' | 'Active Demand Zone' | 'None';
}

// NEW: Trend Resonance
export interface TrendResonance {
    trendHTF: 'Bullish' | 'Bearish' | 'Neutral'; // Higher Timeframe
    trendLTF: 'Bullish' | 'Bearish' | 'Neutral'; // Lower Timeframe
    resonance: 'Resonant (顺势)' | 'Conflict (逆势/回调)' | 'Chaos (震荡)';
}

// NEW: Data Mining for Text-Only Mode
export interface DataMining {
    sourcesCount: number;
    confidenceLevel: 'High' | 'Medium' | 'Low';
    keyDataPoints: string[]; // e.g., "Fib 0.618 at 150.2", "Options Max Pain 155"
    contradictions: string[]; // e.g., "News bullish but Volume dropping"
    primaryTrendSource: string; // "Technical Indicators" or "News Sentiment"
}

// NEW 2.0: Intermarket Correlation & Catalyst
export interface CorrelationMatrix {
    correlatedAsset: string; // e.g. "DXY" or "NASDAQ" or "Sector ETF"
    correlationType: 'Positive (正相关)' | 'Negative (负相关)';
    correlationStrength: 'High' | 'Moderate' | 'Low';
    assetTrend: 'Bullish' | 'Bearish' | 'Neutral';
    impact: 'Tailwind (助推)' | 'Headwind (阻力)' | 'Neutral';
}

export interface CatalystRadar {
    nextEvent: string; // e.g. "Earnings in 3 days"
    eventImpact: 'High Volatility' | 'Medium' | 'Low';
    timingWarning: string; // "Do not hold over weekend"
}

// NEW 3.0: Adversarial Tribunal (3-Court System)
export interface TribunalArgument {
  point: string;
  weight: 'High' | 'Medium' | 'Low';
}

export interface MarketTribunal {
  bullCase: {
    arguments: TribunalArgument[];
    verdict: string;
  };
  bearCase: {
    arguments: TribunalArgument[];
    verdict: string;
  };
  chiefJustice: {
    winner: 'BULLS' | 'BEARS' | 'HUNG_JURY';
    reasoning: string;
    confidenceAdjustment: number; // e.g., -10 or +5
  };
}

// NEW 4.0: Institutional Mechanics (Volume Profile, Wyckoff, SMC)
export interface VolumeProfile {
    hvnLevels: number[]; // High Volume Nodes (Heavy Traffic/Resistance)
    lvnZones: string[]; // Low Volume Nodes (Fast Lanes/Vacuum)
    verdict: 'Overhead Supply (上方套牢盘)' | 'Strong Support Base (底部筹码峰)' | 'Vacuum Acceleration (真空加速)';
}

export interface WyckoffData {
    phase: 'Accumulation (吸筹)' | 'Markup (拉升)' | 'Distribution (派发)' | 'Markdown (砸盘)';
    event: 'Spring (弹簧/假跌破)' | 'Upthrust (上冲回落/假突破)' | 'SOS (强势信号)' | 'SOW (弱势信号)' | 'None';
    analysis: string; // Specific logic (e.g. "RSI Ignored due to Distribution")
}

export interface SMCData {
    liquidityStatus: 'Swept Liquidity (掠夺流动性)' | 'Building Liquidity (堆积流动性)' | 'Neutral';
    structure: 'BOS (结构破坏)' | 'CHoCH (角色互换)' | 'None';
    fairValueGapStatus: string; // Description of FVG
}

// NEW 5.0: Options Gamma & Sentiment Divergence
export interface OptionsData {
    maxPainPrice: number;
    gammaExposure: 'Long Gamma (Volatility Suppression)' | 'Short Gamma (Volatility Acceleration)' | 'Neutral';
    putCallRatio: number; // > 1 Bearish/Hedging, < 0.7 Bullish
    impliedVolatilityRank: string; // e.g. "IV Rank 85% (High)"
    squeezeRisk: 'High' | 'Moderate' | 'Low';
}

export interface SentimentDivergence {
    retailMood: 'Extreme Greed' | 'Greed' | 'Neutral' | 'Fear' | 'Extreme Fear';
    institutionalAction: 'Aggressive Buying' | 'Accumulation' | 'Neutral' | 'Distribution' | 'Panic Selling';
    divergenceStatus: 'Bullish Divergence (Retail Fear / Inst Buy)' | 'Bearish Divergence (Retail Greed / Inst Sell)' | 'Aligned (Trend)';
    socialVolume: 'Exploding' | 'High' | 'Normal' | 'Low';
}

// NEW 6.0: Volatility Regime & Adaptive Strategy
export interface VolatilityAnalysis {
    vixValue?: number; // VIX or similar index value
    atrState: 'Expanding (扩张)' | 'Contracting (收缩)' | 'Stable (稳定)';
    regime: 'High Volatility (高波动/趋势)' | 'Low Volatility (低波动/震荡)' | 'Extreme (极端/崩盘)';
    adaptiveStrategy: 'Trend Following (趋势跟随)' | 'Mean Reversion (均值回归/高抛低吸)' | 'Breakout (突破)' | 'Defensive (防御/观望)';
    description: string; // Logic reasoning e.g. "VIX at 12, market is choppy. Avoid breakouts."
}

// NEW 7.0: Hard Data Validation (The "Truth" Layer)
export interface HardData {
    realTimeRsi: number; // The ACTUAL number found via search
    rsiStatus: 'Oversold (超卖)' | 'Neutral (中性)' | 'Overbought (超买)';
    peRatio: number; // 0 if not applicable
    pbRatio: number;
    marketCap: string;
    fiftyTwoWeekRange: string; // "100.00 - 150.00"
    volume24h: string;
    dataSource: string; // e.g. "Aggregated Public Data"
}

// NEW 7.0: Social Sentiment Aggregation (The "Buzz" Layer)
export interface SocialAnalysis {
    retailScore: number; // 0 (Panic) to 100 (Euphoria)
    institutionalScore: number; // 0 (Bearish) to 100 (Bullish)
    socialVolume: 'Low' | 'Normal' | 'High' | 'Explosive';
    trendingKeywords: string[];
    sentimentVerdict: 'Retail FOMO' | 'Smart Money Divergence' | 'Panic Selling' | 'Unified Bullish' | 'Unified Bearish';
    sources: string[]; // e.g. ["Reddit", "Bloomberg", "X"]
}

export interface AIAnalysis {
  signal: SignalType;
  realTimePrice?: number; 
  winRate: number; 
  scoreDrivers?: ScoreDrivers; 
  historicalWinRate: number; 
  entryPrice: number;
  entryStrategy: string; 
  takeProfit: number;
  stopLoss: number;
  supportLevel: number; 
  resistanceLevel: number; 
  riskRewardRatio: number;
  reasoning: string;
  volatilityAssessment: string; 
  strategyMatch: string; 
  marketStructure: string;
  keyFactors: string[]; 
  kLineTrend: string; 
  
  // New Enhanced Fields
  visualAnalysis?: string; // If Image provided
  dataMining?: DataMining; // If NO Image provided
  
  // NEW: Market Context to show specific logic (A-Share vs US)
  marketContext?: 'CN_ASHARE' | 'US_EQUITY' | 'CRYPTO' | 'GLOBAL_FX';

  trendResonance?: TrendResonance;
  
  marketRegime?: MarketRegime; 
  technicalIndicators?: TechnicalIndicators;
  institutionalData?: InstitutionalData;
  smartMoneyAnalysis?: SmartMoneyAnalysis; 

  // NEW 7.0 Fields
  hardData?: HardData;
  socialAnalysis?: SocialAnalysis;

  scenarios?: {
    bullish: MarketScenario;
    bearish: MarketScenario;
    neutral: MarketScenario;
  };
  
  // Consensus Matrix
  trinityConsensus?: TrinityConsensus; 

  // NEW 2.0 Fields
  correlationMatrix?: CorrelationMatrix;
  catalystRadar?: CatalystRadar;

  // NEW 3.0 Fields
  marketTribunal?: MarketTribunal;

  // NEW 4.0 Fields - Institutional Mechanics
  volumeProfile?: VolumeProfile;
  wyckoff?: WyckoffData;
  smc?: SMCData;

  // NEW 5.0 Fields - Derivatives & Sentiment
  optionsData?: OptionsData;
  sentimentDivergence?: SentimentDivergence;

  // NEW 6.0 Fields - Volatility Regime
  volatilityAnalysis?: VolatilityAnalysis;

  tradingSetup?: TradingSetup;
  redTeaming?: RedTeaming;
  
  confidenceDrivers: string[]; 
  guruInsights: GuruInsight[]; 
  modelFusionConfidence: number; 
  futurePrediction?: FuturePrediction; 
  riskManagement?: RiskManagement;
}

export type RealTimeAnalysis = AIAnalysis;

export interface StockSymbol {
  symbol: string;
  name: string;
  currentPrice: number;
}

export enum BacktestStrategy {
  ICT_SILVER_BULLET = "ICT Silver Bullet (聪明钱时间窗)",
  VWAP_MEAN_REVERSION = "VWAP Institutional Reversion (机构均值回归)",
  WYCKOFF_SPRING = "Wyckoff Spring/Upthrust (威科夫操盘法)",
  GAMMA_SQUEEZE = "Gamma Squeeze (期权伽马挤压)",
  DRAGON_RETURN = "Dragon Return (龙头首阴/反包)",
  SUPPLY_DEMAND_FLIP = "S/D Zone Flip (供需互换)",
  TURTLE_SOUP_PLUS = "Turtle Soup Plus (增强版海龟汤)",
  VOLATILITY_CONTRACTION = "VCP (波动率收缩突破)"
}

export enum BacktestPeriod {
  MONTH_1 = "近 1 个月",
  MONTH_3 = "近 3 个月",
  MONTH_6 = "近 6 个月",
  YEAR_1 = "近 1 年"
}

export interface BacktestResult {
  strategyName: string;
  period: string;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: string; 
  bestTrade: string;
  worstTrade: string;
  equityCurveDescription: string; 
  insights: string;
}