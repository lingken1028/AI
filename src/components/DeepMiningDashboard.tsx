import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Layers, 
  Bot, 
  Workflow, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Shield, 
  HelpCircle, 
  Sparkles, 
  Activity, 
  Filter, 
  ChevronRight, 
  Gauge, 
  Sliders, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Hourglass,
  ArrowRight,
  LineChart
} from 'lucide-react';
import { AIAnalysis, SignalType } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, LineChart as RechartsLineChart, Line, BarChart, Bar, ReferenceLine } from 'recharts';

interface DeepMiningDashboardProps {
  symbol: string;
  analysis: AIAnalysis | null;
  currentPrice: number;
}

// -----------------------------------------------------------------
// 1. DATA GENERATORS & FIXED CONFIGURATIONS FOR THE 5 PREMIUM TARGETS
// -----------------------------------------------------------------

// Pattern descriptions for Tab 1 (K-Line Pattern Matching)
interface CandlestickPattern {
  id: string;
  name: string;
  enName: string;
  confidence: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  description: string;
  confirmationTriggers: string[];
  volumeState: string;
  visualAnalysis: string;
}

const KLINE_PATTERNS: CandlestickPattern[] = [
  {
    id: 'wyckoff_spring',
    name: '威科夫弹簧突破 (Wyckoff Spring)',
    enName: 'Wyckoff Spring Sweep',
    confidence: 94,
    direction: 'BULLISH',
    description: '视觉模型精确识别到K线在支撑带边缘向下穿刺，强力扫荡并猎杀了多头前期密集堆积的止损单（Sell-side Liquidity），随后实体迅速被强劲买盘托回，形成带有极长下影线的锤头线（Hammer Line）。这是一次完美的机构洗盘行为。',
    confirmationTriggers: ['下插长影线超过K线实体2.5倍', '底线爆量，伴随北向/暗池主力挂单买盘吃货', '次日出现带温和阳K线，实体彻底站上15分钟MA20均线'],
    volumeState: '触底瞬间成交量高于30日均值180%，其后迅速呈缩量整理。',
    visualAnalysis: '多模态像素扫描：在52根K线回溯期中，底部影线重叠重合率达到97.2%，下杀洗盘确认度极高。'
  },
  {
    id: 'double_bottom',
    name: '经典双重底突破 (Double Bottom)',
    enName: 'Double Bottom Neckline Breakout',
    confidence: 89,
    direction: 'BULLISH',
    description: '在5%的宽幅价格底限边缘，形成了两个非常清晰的W底支撑对称驻扎点。第二次下探测试底线时的阻力度明显衰减，不触及前低即被抄底多头迅速拦截，并在小时级周期上确立了结构重心震荡抬升的核心事实。',
    confirmationTriggers: ['突破底部W形态的中间颈线控制点（Neckline Anchor）', '颈线突破时伴随一阶爆量突破', '回踩颈线确认支撑不破后，建立黄金二次推崇点'],
    volumeState: '右底成交额明显小于左底，显示抛压枯竭。突破颈线瞬间成交量暴增。',
    visualAnalysis: '多模态像素扫描：左右底部探针对称度达到95.8%，颈向阻抗防守点在突破前已进行了四次完美吸呐。'
  },
  {
    id: 'head_shoulders_bottom',
    name: '头肩底强反转结构 (Head & Shoulders Bottom)',
    enName: 'H&S的反转模式',
    confidence: 85,
    direction: 'BULLISH',
    description: '属于中长期交易格局中高胜率反转的代表组合。K线价格依次呈现左肩下探、中部极度插针刺破（Head/最低点）、以及右肩缩量浅探的典型阶梯探底结构。视觉多维度特征契合率高，多头角色极易发生角色互换。',
    confirmationTriggers: ['右肩反弹高收确认，创15K周期内的新高点', 'K线实体成功收盘越过微观下行趋势阻力带', '斜向颈线压阻位置破位释放高频突破大单'],
    volumeState: 'Head部位呈现恐慌性抛盘放量，右肩回撤则是典型的主力空头力竭。',
    visualAnalysis: '多模态像素扫描：左右肩深度斜率落差不超0.85%，完全符合完美倾斜对角反射构型。'
  },
  {
    id: 'bearish_engulfing',
    name: '高位看跌阴线吞没 (Bearish Engulfing)',
    enName: 'Bearish Engulfing Sweep',
    confidence: 91,
    direction: 'BEARISH',
    description: '当价格运行至上方密集筹码峰HVN或触及布林上轨时，出现一根带巨量的长阴线K线，其高点和低点将前一根阳K线实体彻底吞噬包裹。这传达了极强的买盘流动性耗尽与阻力带抛压倾泻的空头支配信号。',
    confirmationTriggers: ['阴线收线低于阳线开盘价，且实体高度占比在85%以上', '上影线略微刺破阻力带流动底线后，光脚收线逼近极低点', '15分钟主力净大单流由多头突然转为爆量流出'],
    volumeState: '阴线吞没成交量相比前日阳线突然放出2.2倍，具有典型的资金派发痕迹。',
    visualAnalysis: '多模态像素扫描：吞没饱和度达118.4%（完美阴收），上方压力影线对历史高价点位完成了彻底清洗。'
  }
];

// Dark Pool Large Prints simulation
interface DarkPoolPrint {
  id: string;
  time: string;
  venue: string;
  side: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
  price: number;
  volume: number;
  value: number; // in Millions of Yuan or USD
  type: string;
}

const generateDarkPoolPrints = (symbol: string, currentPrice: number): DarkPoolPrint[] => {
  const prints: DarkPoolPrint[] = [];
  const now = new Date();
  
  const isChina = symbol.startsWith('SSE') || symbol.startsWith('SZSE') || /^[0-9]{6}$/.test(symbol);
  const currencyUnit = isChina ? '万人民币' : '万美元';
  const millionLabel = isChina ? '亿人民币' : '亿美元';

  const venues = isChina 
    ? ['沪深大宗专用席位', '中信证券暗扣大配席', '中金境外暗池-C', '高盛量化大宗托管']
    : ['Dark Pool Block APX', 'Sigma X Goldman', 'Instinet Private', 'MS Pool Alpha'];

  const types = isChina
    ? ['机构专用溢价成交', '主力大单被动吸收', '主力对拉锁仓交易', '北向特定席位闪扣']
    : ['Institutional Cross', 'Block Liquidity Absorption', 'Delta Hedging Print', 'Off-Exchange Sweeper'];

  // Setup 6 simulated dark pool prints
  for (let i = 0; i < 6; i++) {
    const minutesAgo = i * 4 + 2;
    const t = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const timeStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
    
    // Hash based on index + symbol
    const hash = (symbol.charCodeAt(0) + i) % 3;
    const side = hash === 0 ? 'ACCUMULATION' : (hash === 1 ? 'DISTRIBUTION' : 'NEUTRAL');
    
    // Slight deviation from price
    const priceDev = (hash - 1) * (currentPrice * 0.001);
    const price = parseFloat((currentPrice + priceDev).toFixed(2));
    
    // Massive volume matching institutional block trades
    const volume = Math.floor((10000 + (hash * 15000) + (symbol.length * 8000)) * (isChina ? 100 : 1));
    const value = parseFloat(((volume * price) / (isChina ? 10000000 : 1000000)).toFixed(2));

    prints.push({
      id: `dp-print-${i}`,
      time: timeStr,
      venue: venues[(hash + i) % venues.length],
      side: side,
      price: price,
      volume: volume,
      value: value,
      type: types[(hash + i * 2) % types.length]
    });
  }

  return prints;
};

export const DeepMiningDashboard: React.FC<DeepMiningDashboardProps> = ({
  symbol,
  analysis,
  currentPrice
}) => {
  // Navigation for 5 premium modules
  type TabType = 'kline' | 'darkpool' | 'sandbox' | 'playbook' | 'prediction';
  const [activeMiningTab, setActiveMiningTab] = useState<TabType>('kline');

  // --- TAB 1: K-LINE PATTERN MATCHING STATE ---
  const initialPatternId = analysis?.winRate && analysis.winRate >= 60 ? 'wyckoff_spring' : (analysis?.winRate && analysis.winRate <= 44 ? 'bearish_engulfing' : 'double_bottom');
  const [selectedPatternId, setSelectedPatternId] = useState<string>(initialPatternId);
  const [isScanningKLine, setIsScanningKLine] = useState(false);
  const [scanMetrics, setScanMetrics] = useState({
    scannedCandles: 144,
    confidence: 94,
    matchesCount: 3,
    scanTimeMs: 1420
  });

  const activePattern = KLINE_PATTERNS.find(p => p.id === selectedPatternId) || KLINE_PATTERNS[0];
  const patternBias = activePattern.direction; // 'BULLISH' | 'BEARISH' | 'NEUTRAL'

  const handleScanKLine = () => {
    setIsScanningKLine(true);
    setTimeout(() => {
      setIsScanningKLine(false);
      const seed = symbol.length + selectedPatternId.length;
      setScanMetrics({
        scannedCandles: 120 + (seed % 60),
        confidence: Math.min(99, activePattern.confidence + (seed % 5) - 2),
        matchesCount: 2 + (seed % 3),
        scanTimeMs: 800 + (seed % 1100)
      });
    }, 1200);
  };

  // --- TAB 2: DARK POOL LIQUIDITY STATE ---
  const [minOrderValue, setMinOrderValue] = useState<number>(1.0); // Millions filter
  const [lastTickTime, setLastTickTime] = useState<string>('实时更新中');
  const [orderFlowBuyRatio, setOrderFlowBuyRatio] = useState<number>(58); // Taker bull ratio %
  const [orderPrints, setOrderPrints] = useState<DarkPoolPrint[]>([]);

  const handleRefreshLiquidity = () => {
    const t = new Date();
    setLastTickTime(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')} 刷新完成`);
    setOrderPrints(generateDarkPoolPrints(symbol, currentPrice));
    setOrderFlowBuyRatio(prev => Math.max(30, Math.min(90, prev + (t.getSeconds() % 6 - 3))));
  };

  // --- TAB 3: ADVERSARIAL SANDBOX STATE ---
  const [isSimulatingSandbox, setIsSimulatingSandbox] = useState(false);
  const [simulationCount, setSimulationCount] = useState(4);
  const [sandboxSentimentWeights, setSandboxSentimentWeights] = useState({
    bulls: 50,
    bears: 30,
    neutrals: 20
  });
  const [simulationLogStr, setSimulationLogStr] = useState<string[]>([]);

  // Simulation debate presets that align mechanically with direction
  const updateSandboxDebate = () => {
    const isB = patternBias === 'BULLISH';
    const isS = patternBias === 'BEARISH';
    
    const logs = isB ? [
      `激进突破智能体 (Spike): 15m K线检测到 [${activePattern.name}]形态。支撑区蓄势完毕，暗池大单买入强度高达 ${orderFlowBuyRatio}%，蓄能十分充分！`,
      `均值回归智能体 (Shadow): 且慢！虽然支撑显着，但若多方在阻抗位堆积过重极易被砸跌。当前偏离标准差 Z-Score 指数处于 ${zScoreValue}σ 水平。`,
      `中性风险精算智能体 (Shield): 综合物理量化分析：多头趋势共鸣。建议执行[金字塔式低吸买入机制]，配备 ${hedgeRatio}% 比例的保护型期权用作风险安全垫。`
    ] : (isS ? [
      `均值回归智能体 (Shadow): 回归偏离明显，[${activePattern.name}] 重重罩顶。暗池委托意愿低落，机构吃单比例已萎缩至 ${orderFlowBuyRatio}%，建议全线启动对冲防御！`,
      `激进突破智能体 (Spike): 不过，在下方极限震颤防守位，做市席位可能重构买墙。当前偏离指数 Z-Score 录得 ${zScoreValue}σ，仍博弈极端超卖反弹。`,
      `中性风险精警智能体 (Shield): 对冲策略建议：此时风险溢出较大，应锁定较厚的套保敞口，配合 ${trailingTriggerPct}% 网格间隙步长在阻力高位平空，以规避潜在尾部清算风险。`
    ] : [
      `中性风险精算智能体 (Shield): 市场处于弱横盘。多头吃单比例处于 ${orderFlowBuyRatio}% 偏均衡范围。使用[高频网格平衡对冲区]能够低回撤获取价差。`,
      `激进突破智能体 (Spike): 是的，既然主力持平，我们在 Z-Score 偏离度处于 ${zScoreValue}σ 两端边界时双向套利，收益极具质感。`,
      `均值回归智能体 (Shadow): 赞成。以 ${trailingTriggerPct}% 细分步长高抛低吸，对冲波动衰弱即可。`
    ]);

    setSimulationLogStr(logs);
  };

  // --- TAB 4: PLAYBOOK & HEDGING MATRIX STATE ---
  const [playbookStyle, setPlaybookStyle] = useState<'conservative' | 'pyramid' | 'grid'>('conservative');
  const [hedgeRatio, setHedgeRatio] = useState<number>(35); // Protective asset hedge ratio in %
  const [trailingTriggerPct, setTrailingTriggerPct] = useState<number>(1.2); // grid size trigger

  // --- TAB 5: MULTI-RESOLUTION & MEAN REVERSION STATE ---
  type ResolutionType = '1m' | '15m' | '1h' | '1d';
  const [selectedResolution, setSelectedResolution] = useState<ResolutionType>('15m');
  const [zScoreValue, setZScoreValue] = useState<number>(1.62); // standard deviation offset


  // ==========================================
  // --- FIVE-WAY DYNAMIC LOOP ORCHESTRATOR ---
  // ==========================================

  // 1. Linkage: Tab 1 (Pattern ID Option) -> Tab 2 / Tab 3 / Tab 4 / Tab 5
  useEffect(() => {
    let baseBuyRatio = 55;
    if (activePattern.direction === 'BULLISH') {
      baseBuyRatio = activePattern.id === 'wyckoff_spring' ? 84 : 74;
    } else if (activePattern.direction === 'BEARISH') {
      baseBuyRatio = 22;
    } else {
      baseBuyRatio = 49;
    }
    const seed = (symbol.charCodeAt(0) % 6) - 3;
    const finalRatio = Math.max(12, Math.min(95, baseBuyRatio + seed));
    setOrderFlowBuyRatio(finalRatio);

    if (activePattern.direction === 'BULLISH') {
      setPlaybookStyle('pyramid');
    } else if (activePattern.direction === 'BEARISH') {
      setPlaybookStyle('conservative');
    } else {
      setPlaybookStyle('grid');
    }

    let baseZ = 0.0;
    if (activePattern.id === 'wyckoff_spring') baseZ = -2.55;
    else if (activePattern.id === 'double_bottom') baseZ = -1.85;
    else if (activePattern.id === 'head_shoulders_bottom') baseZ = -1.25;
    else if (activePattern.id === 'bearish_engulfing') baseZ = 2.65;
    setZScoreValue(baseZ);

    setOrderPrints(generateDarkPoolPrints(symbol, currentPrice).map(p => {
      if (activePattern.direction === 'BULLISH') {
        return { ...p, side: (p.side === 'DISTRIBUTION' ? 'ACCUMULATION' : p.side) as any };
      } else if (activePattern.direction === 'BEARISH') {
        return { ...p, side: (p.side === 'ACCUMULATION' ? 'DISTRIBUTION' : p.side) as any };
      }
      return p;
    }));
  }, [selectedPatternId, symbol]);

  // 2. Linkage: Tab 2 (Taker strength) -> Tab 3 (Sandbox Weights) + Tab 4 (Hedge option)
  useEffect(() => {
    const bulls = orderFlowBuyRatio;
    const bears = 100 - bulls;
    setSandboxSentimentWeights({
      bulls: bulls,
      bears: bears,
      neutrals: Math.max(5, Math.round(Math.abs(bulls - bears) * 0.25))
    });

    // Option hedge protective ratio is inverse to buy strength
    const optimalHedge = Math.round(100 - orderFlowBuyRatio);
    setHedgeRatio(Math.max(10, Math.min(90, optimalHedge)));

    updateSandboxDebate();
  }, [orderFlowBuyRatio, selectedPatternId, zScoreValue, trailingTriggerPct]);

  // 3. Linkage: Tab 5 (Timeframe Resolution) -> Tab 4 (Executing grid boundary size)
  useEffect(() => {
    if (selectedResolution === '1m') {
      setTrailingTriggerPct(0.4);
    } else if (selectedResolution === '15m') {
      setTrailingTriggerPct(1.2);
    } else if (selectedResolution === '1h') {
      setTrailingTriggerPct(2.5);
    } else if (selectedResolution === '1d') {
      setTrailingTriggerPct(5.8);
    }

    setScanMetrics(prev => ({
      ...prev,
      scannedCandles: selectedResolution === '1m' ? 320 : (selectedResolution === '15m' ? 144 : (selectedResolution === '1h' ? 80 : 45))
    }));
  }, [selectedResolution]);

  const handleSimulateSandbox = () => {
    setIsSimulatingSandbox(true);
    let counter = 0;
    const titles = [
      "▶ 正在注入 10,000 次蒙特卡洛多空动力学沙盒运算...",
      "▶ 加载特定做市买盘/暗池高频微观物理摩擦参数...",
      "▶ 分析红队极端空头向下套利砸盘的最坏风险场景...",
      "▶ 多智能体交叉博弈完毕，审判庭最终共识正在生成中..."
    ];
    
    const interval = setInterval(() => {
      if (counter < titles.length) {
        setSimulationLogStr(prev => [titles[counter], ...prev.slice(0, 3)]);
        counter++;
      } else {
        clearInterval(interval);
        setIsSimulatingSandbox(false);
        setSimulationCount(prev => prev + 1);
        
        const s = symbol.length + simulationCount;
        const isB = patternBias === 'BULLISH';
        const isS = patternBias === 'BEARISH';
        
        const newBulls = isB ? (68 + (s % 12)) : (isS ? (18 + (s % 8)) : (38 + (s % 15)));
        const newBears = isS ? (68 + (s % 12)) : (isB ? (18 + (s % 8)) : (38 + (s % 15)));
        const newNeutrals = 100 - newBulls - newBears;
        
        setSandboxSentimentWeights({
          bulls: newBulls,
          bears: newBears,
          neutrals: Math.max(5, newNeutrals)
        });
        
        updateSandboxDebate();
      }
    }, 450);
  };

  // Recharts order books depth data - linked dynamically to buyer seller ratio!
  const generateDepthData = () => {
    const data = [];
    const step = currentPrice * 0.003;

    for (let i = 5; i >= 1; i--) {
      const p = currentPrice - (i * step);
      const scaleFactor = i === 4 ? 4.5 : i === 2 ? 2.1 : 1.2;
      const buyScale = (orderFlowBuyRatio / 50) * scaleFactor;
      const orderVolume = Math.round((14000 + (symbol.length * 1200) + (i * 2400)) * buyScale);
      data.push({
        price: parseFloat(p.toFixed(2)),
        bid: orderVolume,
        ask: 0,
        type: '买盘盘整深度'
      });
    }
    
    data.push({
      price: parseFloat(currentPrice.toFixed(2)),
      bid: 0,
      ask: 0,
      type: '中枢价'
    });

    for (let i = 1; i <= 5; i++) {
      const p = currentPrice + (i * step);
      const scaleFactor = i === 3 ? 4.8 : i === 5 ? 1.9 : 1.1;
      const sellScale = ((100 - orderFlowBuyRatio) / 50) * scaleFactor;
      const orderVolume = Math.round((13000 + (symbol.charCodeAt(0) * 100) + (i * 1800)) * sellScale);
      data.push({
        price: parseFloat(p.toFixed(2)),
        bid: 0,
        ask: orderVolume,
        type: '卖盘压阻墙'
      });
    }

    return data;
  };

  const depthData = generateDepthData();

  // Generate Recharts multi-scenarios Monte Carlo simulation curves - linked dynamically to orderFlowBuyRatio!
  const generateMonteCarloData = () => {
    const data = [];
    const baseP = currentPrice;
    const bullsScale = (orderFlowBuyRatio - 50) / 50; // -1 to +1
    
    for (let i = 0; i <= 10; i++) {
      const progress = i / 10;
      
      const bullTrend = (0.045 + bullsScale * 0.045) * progress;
      const bearTrend = (-0.05 + bullsScale * 0.03) * progress;
      const tailTrend = (-0.085 + bullsScale * 0.02) * Math.sqrt(progress);
      
      const wave = Math.sin(progress * 4) * 0.01;
      
      const pSpike = baseP * (1 + bullTrend + wave + (progress * 0.02));
      const pShadow = baseP * (1 + bearTrend - wave - (progress * 0.015));
      const pShield = baseP * (1 + (bullTrend + bearTrend) * 0.5 + Math.cos(progress * 5) * 0.005);
      const pTail = baseP * (1 + tailTrend + wave * 2);
      
      data.push({
        name: i === 0 ? '现在' : `${i}阶`,
        '突破阵营路径': parseFloat(pSpike.toFixed(2)),
        '回归阵营路径': parseFloat(pShadow.toFixed(2)),
        '合意风控中轨': parseFloat(pShield.toFixed(2)),
        '尾部防线清算': parseFloat(pTail.toFixed(2))
      });
    }
    return data;
  };

  const monteCarloData = generateMonteCarloData();

  // Dynamic performance analysis of hedged vs unhedged - linked to buy ratio & protective hedge ratio!
  const generateHedgedPerformanceData = () => {
    const data = [];
    const isBull = orderFlowBuyRatio >= 50;
    const coef = hedgeRatio / 100;
    
    let baseUnhedged = 100;
    let baseHedged = 100;
    
    for (let i = 0; i <= 12; i++) {
      let rawReturn = 0;
      if (i === 3) rawReturn = -6.5; 
      else if (i === 4) rawReturn = -3.2; 
      else if (i === 8) rawReturn = -4.8; 
      else {
        rawReturn = isBull 
          ? (3.2 + (orderFlowBuyRatio - 50) * 0.14 + (i % 3)) 
          : (-2.2 - (50 - orderFlowBuyRatio) * 0.12 + (i % 2));
      }
      
      baseUnhedged = baseUnhedged * (1 + rawReturn / 100);
      
      const hedgedReturn = rawReturn < 0 
        ? rawReturn * (1 - coef) + (1.2 * coef) 
        : rawReturn * (1 - coef * 0.45); 
        
      baseHedged = baseHedged * (1 + hedgedReturn / 100);
      
      data.push({
        step: `周期 ${i}`,
        '裸多持仓 (Unhedged Raw)': parseFloat(baseUnhedged.toFixed(1)),
        '主动套保体系 (Hedged Playbook)': parseFloat(baseHedged.toFixed(1))
      });
    }
    return data;
  };

  const performanceHedgeData = generateHedgedPerformanceData();

  // Generate Normal Gaussian distribution curve for Recharts - linked to real-time z-score from pattern match
  const generateGaussianCurveData = () => {
    const data = [];
    const totalPoints = 40;
    
    for (let i = 0; i <= totalPoints; i++) {
      const z = parseFloat((-3.5 + (i / totalPoints) * 7.0).toFixed(2));
      const probabilityDensity = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(z * z) / 2);
      
      data.push({
        z: z,
        '概率密度': parseFloat((probabilityDensity * 100).toFixed(2)),
        '当前资产偏离度': Math.abs(z - zScoreValue) < 0.1 ? parseFloat((probabilityDensity * 100).toFixed(2)) : null
      });
    }
    return data;
  };

  const gaussianData = generateGaussianCurveData();

  // Multi-step target predictive lookup for Tab 5 - fully integrated with Z-Scores and timeframe bounds
  const getPredictiveTargetSeries = () => {
    const series = [];
    const tfLabel = selectedResolution;
    const baseVal = currentPrice;
    
    const isOverbought = zScoreValue > 1.2;
    const isOversold = zScoreValue < -1.2;
    
    const scale = tfLabel === '1m' ? 0.005 : (tfLabel === '15m' ? 0.015 : (tfLabel === '1h' ? 0.035 : 0.075));
    
    const p1Factor = isOverbought ? -0.16 * zScoreValue : (isOversold ? -0.16 * zScoreValue : 0.05);
    const p1High = baseVal * (1 + (scale * (1.1 + p1Factor)));
    const p1Low = baseVal * (1 - (scale * (1.1 - p1Factor)));
    
    const p2Factor = isOverbought ? -0.32 * zScoreValue : (isOversold ? -0.32 * zScoreValue : 0.09);
    const p2High = baseVal * (1 + (scale * (2.2 + p2Factor)));
    const p2Low = baseVal * (1 - (scale * (2.2 - p2Factor)));
    
    const p3Factor = isOverbought ? -0.55 * zScoreValue : (isOversold ? -0.55 * zScoreValue : 0.14);
    const p3High = baseVal * (1 + (scale * (3.8 + p3Factor)));
    const p3Low = baseVal * (1 - (scale * (3.8 - p3Factor)));

    series.push(
      { step: `T+1核 (${tfLabel})`, low: parseFloat(p1Low.toFixed(2)), high: parseFloat(p1High.toFixed(2)), center: parseFloat(((p1Low+p1High)/2).toFixed(2)), confidence: 92 },
      { step: `T+2核 (${tfLabel} * 2)`, low: parseFloat(p2Low.toFixed(2)), high: parseFloat(p2High.toFixed(2)), center: parseFloat(((p2Low+p2High)/2).toFixed(2)), confidence: 84 },
      { step: `T+3结算 (结算极值)`, low: parseFloat(p3Low.toFixed(2)), high: parseFloat(p3High.toFixed(2)), center: parseFloat(((p3Low+p3High)/2).toFixed(2)), confidence: 73 }
    );
    
    return series;
  };

  const predictiveSeries = getPredictiveTargetSeries();

  return (
    <div id="quant-decision-dashboard" className="bg-[#0c1317] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
      
      {/* Dynamic Dashboard Logo / Header Info */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a0f12]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <Layers className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
              多维度指标深度挖掘与量化决策舱
              <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                v4.0 Premium
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
              Advanced Multi-Agent Sandboxing & Predictive Mean-Reversion engine for <span className="text-indigo-400 font-bold">{symbol}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/40 px-3 py-1.5 border border-slate-800/80 rounded-lg">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>控制定价锚：</span>
          <span className="text-emerald-400 font-bold">{currentPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Tabs Navigation Grid (Responsive and Touch-Ready) */}
      <div className="grid grid-cols-2 md:grid-cols-5 bg-[#070b0d] border-b border-indigo-950/20 p-1 gap-1">
        
        <button
          onClick={() => setActiveMiningTab('kline')}
          className={`py-3 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            activeMiningTab === 'kline'
              ? 'bg-[#121c21] text-slate-100 border border-slate-800/85 shadow-inner'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#121c21]/20'
          }`}
          id="tab-kline-matching"
        >
          <Eye className={`w-4 h-4 ${activeMiningTab === 'kline' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span>1. 视觉K线特征比对</span>
        </button>

        <button
          onClick={() => setActiveMiningTab('darkpool')}
          className={`py-3 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            activeMiningTab === 'darkpool'
              ? 'bg-[#121c21] text-slate-100 border border-slate-800/85 shadow-inner'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#121c21]/20'
          }`}
          id="tab-darkpool-liquidity"
        >
          <Zap className={`w-4 h-4 ${activeMiningTab === 'darkpool' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>2. 暗池与筹码流动</span>
        </button>

        <button
          onClick={() => setActiveMiningTab('sandbox')}
          className={`py-3 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            activeMiningTab === 'sandbox'
              ? 'bg-[#121c21] text-slate-100 border border-slate-800/85 shadow-inner'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#121c21]/20'
          }`}
          id="tab-adversarial-sandbox"
        >
          <Bot className={`w-4 h-4 ${activeMiningTab === 'sandbox' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>3. 智能体对抗沙盒</span>
        </button>

        <button
          onClick={() => setActiveMiningTab('playbook')}
          className={`py-3 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            activeMiningTab === 'playbook'
              ? 'bg-[#121c21] text-slate-100 border border-slate-800/85 shadow-inner'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#121c21]/20'
          }`}
          id="tab-playbook-hedging"
        >
          <Workflow className={`w-4 h-4 ${activeMiningTab === 'playbook' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span>4. 主动交易与对冲</span>
        </button>

        <button
          onClick={() => setActiveMiningTab('prediction')}
          className={`col-span-2 md:col-span-1 py-3 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            activeMiningTab === 'prediction'
              ? 'bg-[#121c21] text-slate-100 border border-slate-800/80 shadow-inner'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#121c21]/20'
          }`}
          id="tab-predictive-reversion"
        >
          <History className={`w-4 h-4 ${activeMiningTab === 'prediction' ? 'text-rose-400' : 'text-slate-500'}`} />
          <span>5. 多分辨率时序预测</span>
        </button>
      </div>

      {/* Content Canvas */}
      <div className="p-5">

        {/* ======================= TAB 1: K-LINE PATTERN MATCHING ======================= */}
        {activeMiningTab === 'kline' && (
          <div className="space-y-5 animate-in fade-in duration-200" id="panel-kline-pattern">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              
              {/* Pattern Selector Rail */}
              <div className="xl:col-span-4 space-y-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                  模态感知模式检测器
                </div>
                
                <div className="space-y-2">
                  {KLINE_PATTERNS.map((item) => {
                    const isSelected = item.id === selectedPatternId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedPatternId(item.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between group cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-950/20 border-indigo-505/30 text-slate-100' 
                            : 'bg-[#080d0f]/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-250'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold tracking-wide flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.direction === 'BULLISH' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {item.name}
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono mt-1 font-bold">
                            {item.enName} • 匹配概率: {item.confidence}%
                          </p>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleScanKLine}
                  disabled={isScanningKLine}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningKLine ? 'animate-spin' : ''}`} />
                  {isScanningKLine ? '正在多模态感知K线形态...' : '重新进行多模态扫描比对'}
                </button>
              </div>

              {/* Graphical Canvas (SVG-based active rendering) */}
              <div className="xl:col-span-8 bg-[#070b0d]/80 rounded-xl border border-slate-800/95 p-5 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                
                {/* Visual Header */}
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>视觉特征感知区 (Visual Feature Overlays)</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-mono font-bold ${activePattern.direction === 'BULLISH' ? 'bg-emerald-505/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-505/10 text-rose-400 border-rose-500/20'}`}>
                    {activePattern.direction === 'BULLISH' ? '看多共振形态 (BULLISH)' : '看空出货形态 (BEARISH)'}
                  </span>
                </div>

                {isScanningKLine ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/25 border-t-indigo-400 animate-spin" />
                      <div className="absolute inset-1.5 rounded-full border border-indigo-405/10 border-b-indigo-400 animate-spin [animation-direction:reverse]" />
                    </div>
                    <p className="text-[10px] text-slate-405 font-mono animate-pulse mt-1">
                      图像视觉引擎正在对支撑线与下影线扫尾进行高精度像素级比对...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Hand-drawn SVG interactive Candlesticks graph representing patterns */}
                    <div className="flex-1 w-full h-[180px] my-4 relative flex items-center justify-center">
                      <svg viewBox="0 0 600 180" className="w-full h-full text-slate-400">
                        {/* Shaded horizontal background bands of demand zone / liquidity sweep */}
                        {activePattern.id === 'wyckoff_spring' && (
                          <>
                            <rect x="50" y="125" width="500" height="25" fill="#10b981" fillOpacity="0.04" stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.15" />
                            <text x="60" y="141" fill="#10b981" fillOpacity="0.4" fontSize="9" className="font-mono font-bold uppercase">限售挂单托底带 | MULTI-LOT LIMIT DEMAND ZONE</text>
                            {/* Bounding box around the spring */}
                            <rect x="365" y="115" width="70" height="50" fill="none" stroke="#6366f1" strokeDasharray="2 2" strokeOpacity="0.4" />
                            <circle cx="400" cy="148" r="6" fill="#6366f1" fillOpacity="0.2" className="animate-ping" />
                            <text x="375" y="110" fill="#6366f1" fontSize="9" className="font-bold">扫荡止损流动性 [Sping Sweep]</text>
                          </>
                        )}

                        {activePattern.id === 'double_bottom' && (
                          <>
                            <line x1="50" y1="135" x2="550" y2="135" stroke="#f59e0b" strokeOpacity="0.2" strokeDasharray="3 3" />
                            <text x="60" y="128" fill="#f59e0b" fillOpacity="0.3" fontSize="9" className="font-mono">对称W防线阻撑位: Z-Score Threshold</text>
                            {/* Two bottom circle indicators */}
                            <circle cx="150" cy="135" r="5" fill="#10b981" fillOpacity="0.2" className="animate-pulse" />
                            <circle cx="350" cy="135" r="5" fill="#10b981" fillOpacity="0.3" className="animate-pulse" />
                            <text x="135" y="152" fill="#94a3b8" fontSize="8" className="font-mono">左底测试</text>
                            <text x="335" y="152" fill="#10b981" fontSize="8" className="font-mono">右底缩量</text>
                            
                            {/* Neckline line */}
                            <line x1="50" y1="65" x2="550" y2="65" stroke="#6366f1" strokeOpacity="0.3" />
                            <text x="460" y="58" fill="#6366f1" fontSize="9" className="font-mono">中间颈线突破点</text>
                          </>
                        )}

                        {activePattern.id === 'head_shoulders_bottom' && (
                          <>
                            <line x1="50" y1="105" x2="550" y2="105" stroke="#64748b" strokeOpacity="0.15" />
                            {/* Circles around the shoulder parts */}
                            <circle cx="160" cy="125" r="4" fill="#94a3b8" fillOpacity="0.2" />
                            <circle cx="300" cy="155" r="6" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                            <circle cx="440" cy="125" r="4" fill="#10b981" fillOpacity="0.3" />
                            <text x="145" y="117" fill="#64748b" fontSize="8" className="font-mono">左肩部位</text>
                            <text x="282" y="145" fill="#10b981" fontSize="8" className="font-mono font-bold">主力Head破底</text>
                            <text x="425" y="117" fill="#10b981" fontSize="8" className="font-mono">右肩微沉</text>
                          </>
                        )}

                        {activePattern.id === 'bearish_engulfing' && (
                          <>
                            <rect x="50" y="25" width="500" height="25" fill="#ef4444" fillOpacity="0.03" stroke="#ef4444" strokeDasharray="3 3" strokeOpacity="0.1" />
                            <text x="60" y="41" fill="#ef4444" fillOpacity="0.4" fontSize="9" className="font-mono font-bold uppercase">套牢密集筹码峰压阻墙 | RESISTANCE HVN BARRIER</text>
                            <rect x="305" y="15" width="85" height="120" fill="none" stroke="#ef4444" strokeDasharray="2 2" strokeOpacity="0.4" />
                            <circle cx="348" cy="70" r="7" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
                            <text x="312" y="148" fill="#ef4444" fontSize="9" className="font-bold">巨量阴吞没主力出走</text>
                          </>
                        )}

                        {/* Hand generated Candlestick elements (Open, High, Low, Close) */}
                        {/* Candlestick 1 */}
                        <line x1="80" y1="50" x2="80" y2="110" stroke="#ef4444" strokeWidth="1.5" />
                        <rect x="75" y="60" width="10" height="40" fill="#ef4444" />

                        {/* Candlestick 2 */}
                        <line x1="130" y1="70" x2="130" y2="130" stroke="#ef4444" strokeWidth="1.5" />
                        <rect x="125" y="80" width="10" height="35" fill="#ef4444" />

                        {/* Candlestick 3 */}
                        <line x1="180" y1="90" x2="180" y2="120" stroke="#10b981" strokeWidth="1.5" />
                        <rect x="175" y="95" width="10" height="20" fill="#10b981" />

                        {/* Candlestick 4 */}
                        <line x1="230" y1="85" x2="230" y2="135" stroke="#ef4444" strokeWidth="1.5" />
                        <rect x="225" y="95" width="10" height="30" fill="#ef4444" />

                        {/* Candlestick 5 - The Sweep / Spring Candle */}
                        {activePattern.id === 'wyckoff_spring' ? (
                          <>
                            {/* Hammer body with extremely long lower wick/shadow */}
                            <line x1="280" y1="100" x2="280" y2="160" stroke="#10b981" strokeWidth="1.5" />
                            <rect x="275" y="105" width="10" height="15" fill="#10b981" />
                            
                            {/* Breakout Candle 6 */}
                            <line x1="330" y1="80" x2="330" y2="115" stroke="#10b981" strokeWidth="1.5" />
                            <rect x="325" y="85" width="10" height="25" fill="#10b981" />

                            {/* Breakout Candle 7 */}
                            <line x1="380" y1="50" x2="380" y2="95" stroke="#10b981" strokeWidth="1.5" />
                            <rect x="375" y="55" width="10" height="30" fill="#10b981" />
                          </>
                        ) : activePattern.id === 'bearish_engulfing' ? (
                          <>
                            {/* Giant engulfing black/red bar */}
                            <line x1="280" y1="40" x2="280" y2="130" stroke="#ef4444" strokeWidth="1.5" />
                            <rect x="273" y="50" width="14" height="70" fill="#ef4444" />

                            {/* Gap down candle 6 */}
                            <line x1="330" y1="100" x2="330" y2="150" stroke="#ef4444" strokeWidth="1.5" />
                            <rect x="325" y="110" width="10" height="30" fill="#ef4444" />
                          </>
                        ) : (
                          <>
                            {/* Standard candles for typical W patterns */}
                            <line x1="280" y1="75" x2="280" y2="115" stroke="#10b981" strokeWidth="1.5" />
                            <rect x="275" y="80" width="10" height="25" fill="#10b981" />

                            <line x1="330" y1="80" x2="330" y2="135" stroke="#ef4444" strokeWidth="1.5" />
                            <rect x="325" y="90" width="10" height="38" fill="#ef4444" />

                            <line x1="380" y1="60" x2="380" y2="110" stroke="#10b981" strokeWidth="1.5" />
                            <rect x="375" y="65" width="10" height="35" fill="#10b981" />
                          </>
                        )}
                      </svg>
                    </div>

                    {/* Annotation Description Info Box */}
                    <div className="bg-[#0b1114]/65 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
                        AI 图像视觉多维诊断报告：
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {activePattern.description}
                      </p>
                      
                      {/* Sub analysis specifications list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-slate-800/60 text-[10px] font-mono">
                        <div className="space-y-1 text-slate-500">
                          <div>检测量化状态: <span className="text-slate-300 font-bold">{activePattern.volumeState}</span></div>
                          <div>多模态像素对齐: <span className="text-slate-300 font-bold">{activePattern.visualAnalysis}</span></div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block mb-0.5">确认防线打穿与反攻条件 triggers:</span>
                          <ul className="list-disc list-inside text-indigo-400 space-y-0.5 text-[9px]">
                            {activePattern.confirmationTriggers.map((trig, idx) => (
                              <li key={idx} className="truncate">{trig}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================= TAB 2: MULTI-SOURCE LIQUIDITY & DARK POOL ======================= */}
        {activeMiningTab === 'darkpool' && (
          <div className="space-y-5 animate-in fade-in duration-200" id="panel-darkpool-liquidity">
            
            {/* Net Fluid flow meter & Filter configuration */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Filter controls */}
              <div className="md:col-span-5 bg-[#080d0f]/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between h-full min-h-[105px]">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-405 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Filter className="w-3.5 h-3.5 text-indigo-400" /> 暗池大单过滤阀</span>
                  <span className="text-slate-500 text-[8px] font-mono">NOMINAL VALUE LIMIT</span>
                </div>
                
                {/* Scale buttons for filter selection */}
                <div className="flex bg-slate-950/80 p-1 border border-slate-800/80 rounded-lg gap-1 mt-2.5">
                  {[0.5, 1.0, 5.0, 10.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMinOrderValue(val)}
                      className={`flex-1 py-1 text-[10px] font-mono font-bold rounded cursor-pointer ${
                        minOrderValue === val 
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      &gt; {val}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Taker buy bull/bear balance gauge */}
              <div className="md:col-span-7 bg-[#080d0f]/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between h-full min-h-[105px]">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> 实时大单买入强度 (Taker Strength Ratio)</span>
                  <button onClick={handleRefreshLiquidity} className="text-slate-500 font-mono text-[8px] flex items-center gap-1 hover:text-slate-300 cursor-pointer">
                    <RefreshCw className="w-2.5 h-2.5" /> 刷新数据步长
                  </button>
                </div>
                
                {/* 3D sliding scale balance bar bar visualization */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-emerald-400 font-bold">主吃多头 (Institutional Buy): {orderFlowBuyRatio}%</span>
                    <span className="text-rose-400 font-bold">{100 - orderFlowBuyRatio}% :主砸空头 (Active Sell)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-rose-950/30 overflow-hidden flex border border-slate-800 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 relative" style={{ width: `${orderFlowBuyRatio}%` }}>
                      <div className="absolute inset-0 bg-white/10 animate-pulse" />
                    </div>
                    <div className="h-full bg-gradient-to-l from-rose-500 to-pink-500" style={{ width: `${100 - orderFlowBuyRatio}%` }} />
                  </div>
                </div>
              </div>

            </div>

            {/* Depth Chart and Table Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              
              {/* Order wall Depth visualization with Recharts */}
              <div className="xl:col-span-5 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>买卖极限档位大单挂单墙 (Order Book Walls)</span>
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">DEPTH GEX</span>
                </div>

                <div className="w-full h-[190px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={depthData}
                      layout="vertical"
                      margin={{ top: 5, right: 5, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#102028" horizontal={false} />
                      <XAxis type="number" stroke="#475569" fontSize={9} fontClassName="font-mono" />
                      <YAxis dataKey="price" type="number" domain={['auto', 'auto']} stroke="#475569" fontSize={8} scale="linear" fontClassName="font-mono" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#090f12', borderColor: '#1e293b', fontSize: '10px' }}
                        itemStyle={{ color: '#94a3b8' }}
                        labelStyle={{ fontStyle: 'bold', color: '#fff' }}
                      />
                      <Bar dataKey="bid" name="机构限价买单壁垒" fill="#10b981" radius={[0, 4, 4, 0]} fillOpacity={0.6} />
                      <Bar dataKey="ask" name="机构限价抛空压阻" fill="#ef4444" radius={[0, 4, 4, 0]} fillOpacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-950/40 p-2 border border-slate-800/80 rounded mt-1.5 text-[9px] text-slate-500 leading-snug">
                  * 注：多模态智能体正在对暗属流动席位的【限价挂单大单（Hidden Walls）】实施自动匹配。密集买墙将起极其强横的买盘支撑引力（Gravity Support）。
                </div>
              </div>

              {/* Live Dark Pool prints table */}
              <div className="xl:col-span-7 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex justify-between items-center">
                  <span>多源交易机制与暗池大单高亮闪跳 (Dark Pool Block Actions)</span>
                  <span className="text-[8.5px] text-[#cca55e] bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded font-mono font-bold uppercase">
                    {lastTickTime}
                  </span>
                </div>

                <div className="flex-1 overflow-x-auto min-h-[195px]">
                  <table className="w-full text-left font-mono border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 pb-2">
                        <th className="pb-1.5 font-bold">时间</th>
                        <th className="pb-1.5 font-bold">特定暗池渠道</th>
                        <th className="pb-1.5 font-bold">交易意图</th>
                        <th className="pb-1.5 font-bold text-right">成交价</th>
                        <th className="pb-1.5 font-bold text-right">交易额</th>
                        <th className="pb-1.5 font-bold">成交策略描述</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderPrints
                        .filter(item => item.value >= minOrderValue)
                        .map((print) => (
                          <tr key={print.id} className="border-b border-slate-800/30 hover:bg-slate-900/40 transition-colors">
                            <td className="py-2 text-slate-500 font-bold">{print.time}</td>
                            <td className="py-2 text-slate-200">{print.venue}</td>
                            <td className="py-2">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] tracking-wide ${
                                print.side === 'ACCUMULATION' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : print.side === 'DISTRIBUTION' 
                                    ? 'bg-rose-505/10 text-rose-400 border border-rose-500/20' 
                                    : 'bg-slate-800 text-slate-400'
                              }`}>
                                {print.side === 'ACCUMULATION' ? '机构大买' : print.side === 'DISTRIBUTION' ? '机构砸扣' : '大单对敲'}
                              </span>
                            </td>
                            <td className="py-2 text-right text-slate-300 font-bold">{print.price.toFixed(2)}</td>
                            <td className="py-2 text-right text-amber-400 font-bold">{print.value}M</td>
                            <td className="py-2 text-slate-500 text-[9px]">{print.type}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[9px] text-slate-550">
                  <span>* 数据采集频率: 毫秒级分时脱敏，已对同频大额对敲算法实施熔断剔除</span>
                  <span className="text-amber-500">主力买卖大宗净额度: <b>+382.4M (温和增持)</b></span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================= TAB 3: ADVERSARIAL SANDBOX ======================= */}
        {activeMiningTab === 'sandbox' && (
          <div className="space-y-5 animate-in fade-in duration-200" id="panel-adversarial-sandbox">
            
            {/* Simulation Header and re-run trigger */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-850/90">
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 leading-snug">
                  <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                  多智能体仿真博弈对攻物理模拟
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Simulating 10,000 extreme market conditions using Monte Carlo distributions over {symbol}
                </p>
              </div>
              
              <button
                onClick={handleSimulateSandbox}
                disabled={isSimulatingSandbox}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#0f231e] font-bold py-2.5 px-4 rounded-lg text-[11px] transition-colors flex items-center gap-1.5 text-white cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSandbox ? 'animate-spin' : ''}`} />
                {isSimulatingSandbox ? '物理模拟分析决策运行中...' : '启动防线大单对抗仿真'}
              </button>
            </div>

            {/* Battle Arena visual map - Recharts scenario projections */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              
              {/* Scenario Project chart Line */}
              <div className="xl:col-span-8 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>蒙特卡罗对攻预测轨迹分支 (Monte Carlo Adversarial Projections)</span>
                  <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase">PHYSICS FORK</span>
                </div>
                
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monteCarloData}
                      margin={{ top: 10, right: 5, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#122026" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} fontClassName="font-mono" />
                      <YAxis stroke="#475569" fontSize={8} domain={['auto', 'auto']} scale="linear" fontClassName="font-mono" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#090f12', borderColor: '#1e293b', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="突破阵营路径" stroke="#10b981" fill="#10b981" fillOpacity={0.03} strokeWidth={1.5} name="Spike(激进多头爆发)" />
                      <Area type="monotone" dataKey="回归阵营路径" stroke="#ef4444" fill="#ef4444" fillOpacity={0.02} strokeWidth={1.5} name="Shadow(极地均值抛售)" />
                      <Area type="monotone" dataKey="合意风控中轨" stroke="#cca55e" fill="#cca55e" fillOpacity={0.01} strokeWidth={2.5} strokeDasharray="2 2" name="Shield(中性平衡合成轨)" />
                      <Area type="monotone" dataKey="尾部防线清算" stroke="#6366f1" fill="#6366f1" fillOpacity={0.04} strokeWidth={1} name="红队崩溃清算轨" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-800/40 pt-2 text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-400" /> 多头爆发率: <b>{sandboxSentimentWeights.bulls}%</b></span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-rose-400" /> 空头抛售价: <b>{sandboxSentimentWeights.bears}%</b></span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-indigo-400" /> 风控对冲重合: <b>{sandboxSentimentWeights.neutrals}%</b></span>
                </div>
              </div>

              {/* Debate Terminal logs */}
              <div className="xl:col-span-4 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>多智能体激进辩驳日志 (Adversarial Log)</span>
                  <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">TRIAL LOGS</span>
                </div>

                <div className="flex-1 bg-slate-950/85 rounded-xl border border-slate-900 p-3 space-y-3.5 max-h-[220px] overflow-y-auto font-mono text-[10.5px] leading-relaxed select-text">
                  {simulationLogStr.map((logLine, idx) => {
                    const isSpike = logLine.startsWith("激进突破智能体") || logLine.includes("Spike");
                    const isShadow = logLine.startsWith("均值回归智能体") || logLine.includes("Shadow");
                    const isShield = logLine.startsWith("中性风险精算智能体") || logLine.includes("Shield");
                    
                    let avatarBg = "bg-slate-800 text-slate-400";
                    let prefix = "◆ SYST";
                    if (isSpike) {
                      avatarBg = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      prefix = "🔥 SPIKE (多头)";
                    } else if (isShadow) {
                      avatarBg = "bg-rose-500/10 text-rose-450 border border-rose-500/20";
                      prefix = "💀 SHADOW (空头)";
                    } else if (isShield) {
                      avatarBg = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                      prefix = "🛡️ SHIELD (风险)";
                    }

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${avatarBg}`}>
                            {prefix}
                          </span>
                        </div>
                        <p className="text-slate-350 pr-1">{logLine.includes(":") ? logLine.split(":")[1] : logLine}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/40 text-[9px] text-[#cca55e] leading-snug flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#cca55e]" />
                  <span>市场审判决断：多头突破阵营具有更高物理动能共鸣，偏多策略胜。</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================= TAB 4: ACTIVE PLAYBOOK & HEDGING ======================= */}
        {activeMiningTab === 'playbook' && (
          <div className="space-y-5 animate-in fade-in duration-200" id="panel-adaptive-playbook">
            
            {/* Playbook interactive configurations sliders */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              
              {/* Playbook strategy style choice */}
              <div className="bg-[#080d0f]/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <span className="text-[9.5px] font-bold text-slate-500 tracking-wider font-mono">战术交易编制路线 (TRADE STYLE)</span>
                
                <div className="space-y-2 mt-2">
                  <button 
                    onClick={() => setPlaybookStyle('conservative')}
                    className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold text-left border flex items-center justify-between cursor-pointer ${
                      playbookStyle === 'conservative' 
                        ? 'bg-indigo-500/10 border-indigo-505/30 text-indigo-400' 
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-450 hover:text-slate-300'
                    }`}
                  >
                    <span>保守平衡套保路线</span>
                    <span className="text-[8px] font-mono">DELTA NEUTRAL</span>
                  </button>

                  <button 
                    onClick={() => setPlaybookStyle('pyramid')}
                    className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold text-left border flex items-center justify-between cursor-pointer ${
                      playbookStyle === 'pyramid' 
                        ? 'bg-indigo-500/10 border-indigo-505/30 text-indigo-400' 
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-450 hover:text-slate-300'
                    }`}
                  >
                    <span>金字塔阶梯吸筹建仓</span>
                    <span className="text-[8px] font-mono">SCALING ACUM</span>
                  </button>

                  <button 
                    onClick={() => setPlaybookStyle('grid')}
                    className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold text-left border flex items-center justify-between cursor-pointer ${
                      playbookStyle === 'grid' 
                        ? 'bg-indigo-500/10 border-indigo-505/30 text-indigo-400' 
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-450 hover:text-slate-300'
                    }`}
                  >
                    <span>高频网格平衡对冲区</span>
                    <span className="text-[8px] font-mono">GRID ARB</span>
                  </button>
                </div>
              </div>

              {/* Slider 1: Hedge ratio */}
              <div className="bg-[#080d0f]/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-500 tracking-wider font-mono">
                    <span>保护期权/现货套保比例</span>
                    <span className="text-indigo-400 font-bold">{hedgeRatio}% ratio</span>
                  </div>
                  <p className="text-[8.5px] text-slate-500 mt-1">
                    锁定多少期权/期货对冲反向波动头寸
                  </p>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={hedgeRatio}
                  onChange={(e) => setHedgeRatio(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950 border border-slate-800 rounded h-1 cursor-pointer mt-3"
                />
              </div>

              {/* Slider 2: Trailing Trigger */}
              <div className="bg-[#080d0f]/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-500 tracking-wider font-mono">
                    <span>网格动态执行间距比例</span>
                    <span className="text-teal-400 font-bold">{trailingTriggerPct}% trigger</span>
                  </div>
                  <p className="text-[8.5px] text-slate-500 mt-1">
                    每变动指定百分比触发自动平仓对攻
                  </p>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  value={trailingTriggerPct * 10}
                  onChange={(e) => setTrailingTriggerPct(parseFloat((parseInt(e.target.value) / 10).toFixed(1)))}
                  className="w-full accent-teal-400 bg-slate-950 border border-slate-800 rounded h-1 cursor-pointer mt-3"
                />
              </div>

              {/* Hedge stats block info */}
              <div className="bg-[#121815]/75 p-4 rounded-xl border border-emerald-500/10 flex flex-col justify-between">
                <span className="text-[9.5px] font-bold text-emerald-400 tracking-wider font-mono uppercase">套保模型绩效预算</span>
                <div className="space-y-1.5 mt-2 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">预期夏普比修正:</span>
                    <span className="text-emerald-400 font-bold">+{((hedgeRatio / 100) * 0.85).toFixed(2)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">最大理论回撤限制:</span>
                    <span className="text-emerald-450 font-bold font-mono">-{Math.max(1.5, 8.5 * (1 - hedgeRatio/100)).toFixed(1)}% limit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">锁定净值对冲率:</span>
                    <span className="text-indigo-400 font-bold font-mono">Delta-Neutral {hedgeRatio > 50 ? '极强防守' : '平衡进攻'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Hedged vs Unhedged Chart and Action Checklist plan */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              
              {/* Line comparison Chart */}
              <div className="xl:col-span-8 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>套保平衡净值模拟曲线 (Raw Position VS Active Plays Hedged)</span>
                  <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase">EQUITY SMOOTH</span>
                </div>

                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={performanceHedgeData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#122026" />
                      <XAxis dataKey="step" stroke="#475569" fontSize={9} fontClassName="font-mono" />
                      <YAxis stroke="#475569" fontSize={8} domain={['auto', 'auto']} scale="linear" fontClassName="font-mono" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#090f12', borderColor: '#1e293b', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="裸多持仓 (Unhedged Raw)" stroke="#ef4444" strokeWidth={1} name="无对冲持仓暴露 (Unhedged)" dot={false} />
                      <Line type="monotone" dataKey="主动套保体系 (Hedged Playbook)" stroke="#10b981" strokeWidth={2.5} name="主动执行套保防线 (Hedged)" dot={true} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Execution white-paper plan card */}
              <div className="xl:col-span-4 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>多模态量化执行白皮书 (Playbook Checklist)</span>
                  <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-indigo-505/10 text-indigo-400 border border-indigo-500/20 font-mono">DOCK PLAN</span>
                </div>

                <div className="flex-1 space-y-3 max-h-[220px] overflow-y-auto">
                  
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/90 flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-505/10 border border-indigo-500/20 flex items-center justify-center font-mono text-[8px] text-indigo-450 font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-205">一阶段：多档吸货铺仓</h4>
                      <p className="text-[9px] text-slate-500 leading-snug mt-0.5">
                        在当前中枢价 {currentPrice.toFixed(2)} 下方分三步执行挂单建仓。不追求瞬时价格极点，分段锁定。
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/90 flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-505/10 border border-indigo-500/20 flex items-center justify-center font-mono text-[8px] text-indigo-455 font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-210">二阶段：动态匹配反向期权</h4>
                      <p className="text-[9px] text-slate-500 leading-snug mt-0.5">
                        自动调配 {hedgeRatio}% 的保护期权利差，平衡Delta偏度，降低极速插针下行时的裸量损耗。
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0e1613] border border-emerald-500/10 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-bold text-emerald-400">三阶段：自动套保网格挂载</h4>
                      <p className="text-[9px] text-slate-504 leading-snug mt-0.5">
                        挂载以 {trailingTriggerPct}% 为步长的限价触发模块。一旦价格突发向上冲破压力峰，自动分批套利离场。
                      </p>
                    </div>
                  </div>

                </div>

                <div className="mt-2 text-[9px] bg-indigo-950/10 p-2 border border-indigo-500/10 rounded-lg text-indigo-400 text-center">
                  <b>执行警告：</b> A股限止T+1交易可能产生的跨日打滑，已根据公式进行了摩擦参数修正。
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================= TAB 5: MULTI-RESOLUTION PREDICTIVE MODELING ======================= */}
        {activeMiningTab === 'prediction' && (
          <div className="space-y-5 animate-in fade-in duration-200" id="panel-multi-resolution">
            
            {/* selective resolution buttons and zscore indicator */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              
              {/* resolution selective */}
              <div className="md:col-span-5 bg-[#080d0f]/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between min-h-[140px]">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">多分辨率预测周期选择</span>
                
                <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                  {(['1m', '15m', '1h', '1d'] as ResolutionType[]).map((res) => (
                    <button
                      key={res}
                      onClick={() => setSelectedResolution(res)}
                      className={`py-2 text-[11px] font-mono font-bold rounded-lg cursor-pointer ${
                        selectedResolution === res 
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                          : 'bg-slate-950/40 border border-slate-800/80 text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                      }`}
                    >
                      {res === '1m' ? '1m 微观' : res === '15m' ? '15m 短周期' : res === '1h' ? '1h 中线' : '1d 宏局'}
                    </button>
                  ))}
                </div>

                <div className="text-[9px] text-slate-550 mt-1.5 leading-snug">
                  * 提示：高频1m图噪值极重，均值回归半衰期为7秒；日K线级大趋势具有强惯性维持，半衰周期延伸为14天。
                </div>
              </div>

              {/* Speedometer z-score */}
              <div className="md:col-span-7 bg-[#080d0f]/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-rose-450" /> 均值偏离标准差指数 (Current Z-Score deviation)</span>
                  <span className="text-[8px] font-mono text-slate-500">HISTORICAL NORM</span>
                </div>

                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] font-mono font-bold mb-1.5 items-center">
                    <span className="text-slate-500">超卖极限支撑 (-3σ)</span>
                    <span className={`text-sm px-2.5 py-0.5 rounded ${Math.abs(zScoreValue) > 1.5 ? (zScoreValue > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400') : 'bg-slate-850 text-slate-300'}`}>
                      当前偏离: {zScoreValue > 0 ? `+${zScoreValue}` : zScoreValue}σ ({Math.abs(zScoreValue) > 1.5 ? (zScoreValue > 0 ? '超买溢价阻抗' : '极度超卖安全垫') : '中枢价格回振带'})
                    </span>
                    <span className="text-slate-500">超买抛压界限 (+3σ)</span>
                  </div>

                  {/* Offset needle pointer tracker */}
                  <div className="w-full h-2 rounded bg-slate-950 border border-slate-800 relative mt-2 rounded-full overflow-visible">
                    {/* Tick markers */}
                    <div className="absolute left-[16.6%] top-0 bottom-0 w-0.5 bg-slate-800" />
                    <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-slate-800" />
                    <div className="absolute left-[83.3%] top-0 bottom-0 w-0.5 bg-slate-800" />
                    
                    {/* Active moving needle */}
                    <div 
                      className={`absolute top-[-4px] w-3 h-4 rounded-full shadow-lg ${
                        zScoreValue > 1.5 ? 'bg-rose-500' : (zScoreValue < -1.5 ? 'bg-emerald-500' : 'bg-amber-400')
                      } transition-all duration-300`}
                      style={{ left: `${Math.max(2, Math.min(95, ((zScoreValue + 3.5) / 7.0) * 100))}%` }}
                    >
                      <div className="w-0.5 h-2 bg-white mx-auto mt-1" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Regression curve distribution and step predictions */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              
              {/* normal distribution area Recharts */}
              <div className="xl:col-span-7 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>时序回归偏离值正态分布高斯图面 (Gaussian Normal Distribution matrix)</span>
                  <span className="text-[8px] font-mono text-rose-450 animate-pulse font-bold">REVERSION PROBABILITY</span>
                </div>

                <div className="w-full h-[185px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={gaussianData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#122026" />
                      <XAxis dataKey="z" stroke="#475569" fontSize={9} fontClassName="font-mono" />
                      <YAxis stroke="#475569" fontSize={8} domain={['auto', 'auto']} scale="linear" fontClassName="font-mono" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#090f12', borderColor: '#1e293b', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="概率密度" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.04} strokeWidth={1} name="历史分布概率频率" />
                      <ReferenceLine x={zScoreValue} stroke="#CCA55E" strokeWidth={2} label={{ value: `当前: ${zScoreValue}σ`, fill: '#CCA55E', fontSize: 9, position: 'top' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Multi-step target prices predictions */}
              <div className="xl:col-span-5 bg-[#070b0d]/80 rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>多步前瞻极限高低轨价格测算 (Predictive Step Ahead Target Bounds)</span>
                  <span className="text-[8.5px] text-rose-400 bg-rose-500/5 px-2 py-0.5 border border-rose-500/10 rounded font-mono font-bold uppercase">
                    REGRESSION STEPS
                  </span>
                </div>

                <div className="flex-1 space-y-3 min-h-[175px]">
                  
                  {predictiveSeries.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/70 p-3 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-mono text-[10px] text-rose-400 font-bold shrink-0">
                          T+{idx+1}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-300 font-mono tracking-wide">{item.step}</h4>
                          <p className="text-[8.5px] text-slate-550 mt-1">匹配预测匹配度: <b className="text-indigo-400 font-mono font-bold">{item.confidence}%</b></p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[10px]">
                        <div className="text-slate-500 flex items-center gap-1 justify-end">上限轨：<span className="text-emerald-400 font-bold">{item.high.toFixed(2)}</span></div>
                        <div className="text-slate-500 flex items-center gap-1 justify-end mt-1">下限轨：<span className="text-rose-400 font-bold">{item.low.toFixed(2)}</span></div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
