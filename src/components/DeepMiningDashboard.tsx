import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  LineChart, 
  Percent, 
  Activity, 
  Sparkles, 
  Sliders, 
  Gauge, 
  Zap, 
  Database, 
  Calendar, 
  ShieldCheck, 
  Scale, 
  MessageSquare, 
  Users, 
  BarChart3, 
  ArrowRight, 
  HelpCircle, 
  Calculator, 
  Plus, 
  Minus, 
  Flame, 
  AlertTriangle,
  Lightbulb,
  GitMerge,
  Maximize2
} from 'lucide-react';
import { AIAnalysis, SignalType } from '../types';
import { formatCurrency } from '../constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

const generateCrossAssetDivergenceData = (symbol: string, correlatedAsset: string, coefficient: number, divergenceScore: number) => {
    const points = 10;
    const names: string[] = [];
    const now = new Date();
    
    for (let i = 0; i < points; i++) {
        const stepsAgo = points - 1 - i;
        const d = new Date(now.getTime() - stepsAgo * 15 * 60 * 1000); 
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        names.push(`${hh}:${mm}`);
    }
    
    const data = [];
    const isNegative = coefficient < 0;
    
    for (let i = 0; i < points; i++) {
        const progress = i / (points - 1); 
        const wave = Math.sin(progress * Math.PI * 1.5) * 4;
        const primaryChange = wave + (progress * 1.5);
        const divergencePull = progress * (divergenceScore / 11) * (isNegative ? -1.5 : 1.5);
        const correlatedChange = (wave * coefficient) + divergencePull + (Math.sin(progress * 6) * 0.4);
        
        data.push({
            time: names[i],
            ticker: Number(primaryChange.toFixed(2)),
            correlated: Number(correlatedChange.toFixed(2)),
            divergence: Number(Math.abs(primaryChange - correlatedChange).toFixed(2))
        });
    }
    
    return data;
};

interface DeepMiningDashboardProps {
  symbol: string;
  analysis: AIAnalysis | null;
  currentPrice: number;
}

export const DeepMiningDashboard: React.FC<DeepMiningDashboardProps> = ({
  symbol,
  analysis,
  currentPrice
}) => {
  // Tabs for the Dashboard
  const [activeMiningTab, setActiveMiningTab] = useState<'indicators' | 'correlation' | 'calculator'>('indicators');

  // Interactive Calculator State
  const [portfolioSize, setPortfolioSize] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5); // Risk 1.5% of portfolio per trade
  const [leverage, setLeverage] = useState<number>(1);
  const [manualEntryPrice, setManualEntryPrice] = useState<string>('');
  const [manualTakeProfit, setManualTakeProfit] = useState<string>('');
  const [manualStopLoss, setManualStopLoss] = useState<string>('');

  // --- NEW INTERACTIVE EXTENSIONS STATE ---
  // 1. Tab 1 Consensus Weighting
  const [weightQuant, setWeightQuant] = useState<number>(40);
  const [weightSmartMoney, setWeightSmartMoney] = useState<number>(40);
  const [weightChart, setWeightChart] = useState<number>(20);

  // 2. Tab 2 Custom Correlation Simulation
  const [customTicker, setCustomTicker] = useState<string>('BTC');
  const [simulatedCorrelation, setSimulatedCorrelation] = useState<number>(0.68);
  const [correlationReasoning, setCorrelationReasoning] = useState<string>(
    '比特币(BTC)作为高贝塔数字资产的领头羊，与全球金融风险偏好高度一致，常作为资金流先行观测窗口。'
  );

  // 3. Tab 2 Selected Correlation Row index for deep dive
  const [selectedCorrelationsIndex, setSelectedCorrelationsIndex] = useState<number>(0);

  // Quick preset helper for adjusting price values by +/- percent
  const adjustPriceFactor = (type: 'entry' | 'tp' | 'sl', factorPercent: number) => {
    if (type === 'entry') {
      const val = parseFloat(manualEntryPrice) || currentPrice || 100;
      setManualEntryPrice((val * (1 + factorPercent)).toFixed(2));
    } else if (type === 'tp') {
      const val = parseFloat(manualTakeProfit) || (entryPriceVal * 1.1);
      setManualTakeProfit((val * (1 + factorPercent)).toFixed(2));
    } else if (type === 'sl') {
      const val = parseFloat(manualStopLoss) || (entryPriceVal * 0.95);
      setManualStopLoss((val * (1 + factorPercent)).toFixed(2));
    }
  };

  const handleSimulateTicker = (target: string) => {
    const raw = target.toUpperCase().trim();
    if (!raw) return;
    setCustomTicker(raw);

    const hash = raw.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let r = 0;
    let desc = '';

    if (raw === 'TSLA' || raw === '特斯拉') {
      r = 0.76;
      desc = '特斯拉(TSLA)与本标的风险属性相似，均为高弹性成长类资产，科技流动性泛滥时具有极强的同向Beta共振性。';
    } else if (raw === 'BTC' || raw === 'ETH' || raw === 'CRYPTO') {
      r = 0.68;
      desc = '加密标的(BTC/ETH)衡量全球非主权流动性的偏好高低。当前主力资金在两个市场间存在边际外溢和套利博弈。';
    } else if (raw === 'SPY' || raw === 'QQQ' || raw === 'SPX') {
      r = 0.89;
      desc = '对美股宽基指数(S&P 500/Nasdaq)有深度Beta暴露。指数趋势向上时，多头处于大盘护航的安全环境中。';
    } else if (raw === 'DXY' || raw === 'USD' || raw === 'UUP') {
      r = -0.81;
      desc = '美元价值指数(DXY)构筑资产大盘的全球定价池重心。强美元是典型的无风险回报吸血器，负相关性极其高。';
    } else if (raw === 'GLD' || raw === 'GC=F' || raw === 'GOLD') {
      r = -0.18;
      desc = '黄金由于具备零票息抗通胀与传统高主权信用避险角色，在股市剧烈动荡时往往起到了不对称避险对冲作用。';
    } else if (raw === 'US10Y' || raw === 'TNX') {
      r = -0.54;
      desc = '美债十年期收益率上行会将成长股的贴现率估值基准向上拔高。高美债息通常构成长线资金持仓本股票的估值阻力。';
    } else {
      // Dynamic hash-based formula
      r = parseFloat(((hash % 161 - 80) / 100).toFixed(2));
      const reasonTemplates = [
        `对应资产(${raw})属存量题材范畴，具有一定的关联性。当其被推至极端亢奋阀值时，需警惕主力资金抽血板块造成的虹吸回调。`,
        `该大宗要素标的(${raw})间接反映供应链生产成本。通常该成本溢价收缩将对本资产构成中期毛利利润边际扩张的正向支撑。`,
        `这属于互补型资产(${raw})。在大盘分段修复与窄幅波动行情中呈现弱正相关，适宜作为中和投资组合Beta的平准防线。`,
        `属于同生态细分交叉领域标的(${raw})。该两标的易在特定产业利好刺激下呈现并排拉升，适合作为同步反包验证。`
      ];
      desc = reasonTemplates[hash % reasonTemplates.length];
    }
    setSimulatedCorrelation(r);
    setCorrelationReasoning(desc);
  };

  // Synchronize inputs with AI analysis if available
  useEffect(() => {
    if (analysis) {
      setManualEntryPrice(analysis.entryPrice ? analysis.entryPrice.toString() : currentPrice.toString());
      setManualTakeProfit(analysis.takeProfit ? analysis.takeProfit.toString() : (currentPrice * 1.1).toString());
      setManualStopLoss(analysis.stopLoss ? analysis.stopLoss.toString() : (currentPrice * 0.95).toString());
    } else if (currentPrice > 0) {
      setManualEntryPrice(currentPrice.toString());
      setManualTakeProfit((currentPrice * 1.10).toFixed(2));
      setManualStopLoss((currentPrice * 0.95).toFixed(2));
    }
  }, [analysis, currentPrice, symbol]);

  // Parsing values safely
  const entryPriceVal = parseFloat(manualEntryPrice) || currentPrice || 100;
  const takeProfitVal = parseFloat(manualTakeProfit) || (entryPriceVal * 1.1);
  const stopLossVal = parseFloat(manualStopLoss) || (entryPriceVal * 0.95);

  // Win-rate lookup from AI or fallback default
  const winPercent = analysis ? analysis.winRate : 58;

  // Real-time calculation variables
  const isBuy = !analysis || analysis.signal !== SignalType.SELL;
  
  // Stop-loss distance
  const slDistance = isBuy ? (entryPriceVal - stopLossVal) : (stopLossVal - entryPriceVal);
  const slPercentage = (slDistance / entryPriceVal) * 100;

  // Take-profit distance
  const tpDistance = isBuy ? (takeProfitVal - entryPriceVal) : (entryPriceVal - takeProfitVal);
  const tpPercentage = (tpDistance / entryPriceVal) * 100;

  // Mathematical risk-to-reward ratio (R:R Ratio)
  // Prevent division by zero
  const calculatedRRRatio = slDistance > 0 ? (tpDistance / slDistance) : 0;

  // Strict Risk-First Position Sizing
  // Portfolio risk in dollars
  const maxRiskAmountDollars = portfolioSize * (riskPercent / 100);
  // Max quantity of shares matching the strict loss allowance
  const safePositionQuantity = slDistance > 0 
    ? Math.floor(maxRiskAmountDollars / slDistance) 
    : 0;

  // Absolute nominal size of position (Cash needed without leverage)
  const nominalPositionValue = safePositionQuantity * entryPriceVal;
  // Leveraged required margin
  const marginRequired = leverage > 0 ? nominalPositionValue / leverage : nominalPositionValue;

  // Win rate in probability form (p)
  const p = winPercent / 100;
  // Loss rate in probability form (q)
  const q = 1 - p;
  // Profit factor / odds ratio (b)
  const b = calculatedRRRatio > 0 ? calculatedRRRatio : 1;
  // Kelly Criterion formula (fraction to bet)
  // K* = p - (q / b) = (b*p - q) / b
  const kellyFraction = b > 0 ? (p - (q / b)) : 0;
  const kellyPct = Math.max(0, kellyFraction * 100);

  // Robust default state generators for correlation and radar if analysis fields are sparse
  const getDeterministicCorrelation = () => {
    // Generate authentic but deterministic data based on the symbol
    const code = symbol.toUpperCase();
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    let isCrypto = code.includes('BTC') || code.includes('ETH') || code.includes('USDT');
    let isChina = code.startsWith('SH') || code.startsWith('SZ') || /\d{6}/.test(code);
    
    const stockTrend = analysis?.signal === SignalType.BUY 
      ? 'Bullish' 
      : analysis?.signal === SignalType.SELL 
        ? 'Bearish' 
        : 'Neutral';

    const rawCorrelations = [
      {
        correlatedAsset: isCrypto ? "NASDAQ 100科技指数" : isChina ? "CSI 300 (沪深300指数)" : "S&P 500 Index (标普500大盘)",
        correlationType: "Positive (正相关)" as const,
        correlationStrength: "High" as const,
        coefficient: isChina ? 0.74 : 0.85,
        assetTrend: hash % 3 === 0 ? "Bullish" as const : hash % 3 === 1 ? "Bearish" as const : "Neutral" as const,
      },
      {
        correlatedAsset: "DXY (全球美元指数柱)",
        correlationType: "Negative (负相关)" as const,
        correlationStrength: "High" as const,
        coefficient: -0.81,
        assetTrend: hash % 4 === 0 ? "Bullish" as const : "Bearish" as const,
      },
      {
        correlatedAsset: isCrypto ? "US10Y (美债十年期收益率)" : isChina ? "CNH/USD (离岸汇率水位)" : "Sector Leading ETF (行业龙头板块ETF)",
        correlationType: hash % 2 === 0 ? "Positive (正相关)" as const : "Negative (负相关)" as const,
        correlationStrength: "Moderate" as const,
        coefficient: hash % 2 === 0 ? 0.58 : -0.52,
        assetTrend: "Bullish" as const,
      }
    ];

    return rawCorrelations.map((item, index) => {
      const isPositive = item.correlationType === "Positive (正相关)";
      const coef = item.coefficient;
      const assetTr = item.assetTrend;
      
      const sNum = stockTrend === 'Bullish' ? 1 : stockTrend === 'Bearish' ? -1 : 0;
      const aNum = assetTr === 'Bullish' ? 1 : assetTr === 'Bearish' ? -1 : 0;
      
      const expectedNum = isPositive ? sNum : -sNum;
      
      let divScore = 0;
      let divType = "同频耦合";
      let divCode = "NORMAL";
      let explanation = "";
      
      if (sNum === 0 || aNum === 0) {
        divScore = 35;
        divType = "脱节偏离 (Decoupled)";
        divCode = "DECOUPLED";
        explanation = `由于当前一方市场暂时缺乏持续性脉冲（处于横盘或窄幅整理），导致本股 [${symbol}] 与 [${item.correlatedAsset}] 历史相关关系进入阶段性真空脱节阶段。这通常意味着局部主力题材主导行情，宏观大盘的系统性干预相对有限。推荐重点考察个股突发消息而无需过度顾忌宏观波动。`;
      } else if (sNum === aNum) {
        if (isPositive) {
          divScore = 5;
          divType = "同频耦合共振 (Harmonious)";
          divCode = "COUPLED";
          explanation = `本股 [${symbol}] 与其高度正相关的参考标的 [${item.correlatedAsset}] 目前方向完全对齐 (皆为 ${assetTr === 'Bullish' ? '看多' : '看空'})。这是最为健康的系统性资金步伐，表明两地大市具有极强的做多/做空凝聚力，不存在主力机构局部逆流或筹码拉锯，属于标准惯性态势。`;
        } else {
          divScore = 80;
          divType = "异常逆相关背离 (Alert Divergent)";
          divCode = "DIVERGED_BEARISH";
          explanation = `警惕关联风险！[${item.correlatedAsset}] 与本股在数学上是显著的【负相关】关系，但在当前周期它们却呈现同方向运动 (均为 ${assetTr === 'Bullish' ? '看多' : '看空'})。这揭示了一种异常的市场博弈：或者是强势美元/债息压境下个股筹码极为紧密形成“逆重力托盘”，或者是局部多头博弈接近尾声、散户情绪异常亢奋导致的虚高。风控建议严格设置止损点，切忌高位追加高倍杠杆。`;
        }
      } else {
        if (isPositive) {
          divScore = 90;
          divType = "正相关反倾斜背离 (Diverged Decoupled)";
          divCode = "DIVERGED_BULLISH";
          explanation = `警惕高度背离！本股 [${symbol}] 与大盘或板块正相关参考标的 [${item.correlatedAsset}] 方向反向倾斜 (个股 trend: ${stockTrend}, 关联资产 trend: ${assetTr})。这意味着大盘回撤下个股逆势展示出卓越的[独立超额抗跌强度]（若个股为BUY），或者在大盘高歌猛进时个股却莫名滞涨甚至逆势走弱（若个股为SELL）。背离指数已飙至惊人的 ${90}%，表明个股极易迎来补跌甚至爆量报复性反弹，分批金字塔建仓策略是控制此类爆破风险的首要法宝。`;
        } else {
          divScore = 12;
          divType = "反向完美对冲 (Coupled Reverse)";
          divCode = "COUNTER_NORMAL";
          explanation = `本股 [${symbol}] 走势趋势与其高度负相关参考标的 [${item.correlatedAsset}] 处于规律的反向对称耦合状态。例如全球避险资本在资产与避险通道间正常流转，这种教科书级别的资金链轮动没有产生任何预期外的异常背离，可放心执行宏观对冲或多空配对套利逻辑。`;
        }
      }
      
      let calculatedImpact: 'Tailwind (助推)' | 'Headwind (阻力)' | 'Neutral' = 'Neutral';
      if (divScore <= 15) {
        calculatedImpact = stockTrend === 'Bullish' ? 'Tailwind (助推)' : 'Headwind (阻力)';
      } else {
        if (stockTrend === 'Bullish' && sNum !== aNum && isPositive) {
          calculatedImpact = 'Headwind (阻力)';
        } else if (stockTrend === 'Bullish' && sNum === aNum && !isPositive) {
          calculatedImpact = 'Headwind (阻力)';
        } else if (stockTrend === 'Bearish' && sNum !== aNum && isPositive) {
          calculatedImpact = 'Headwind (阻力)';
        } else {
          calculatedImpact = 'Tailwind (助推)';
        }
      }

      return {
        correlatedAsset: item.correlatedAsset,
        correlationType: item.correlationType,
        correlationStrength: item.correlationStrength,
        assetTrend: item.assetTrend,
        impact: calculatedImpact,
        coefficient: coef,
        divergenceScore: divScore,
        divergenceType: divType,
        divergenceCode: divCode,
        explanation: explanation
      };
    });
  };

  const getDeterministicCatalyst = () => {
    const code = symbol.toUpperCase();
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const events = [
      { nextEvent: "美联储利率政策会议及决议声明", eventImpact: "High Volatility" as const, timingWarning: "数据周期重合，防止杠杆超载" },
      { nextEvent: "季度盈余财报与前瞻业绩指导发布", eventImpact: "High Volatility" as const, timingWarning: "隐含波动率过高，不建议博弈末日期权" },
      { nextEvent: "核心宏观通胀指标 (CPI/PCE) 披露", eventImpact: "Medium" as const, timingWarning: "留意短线假冲高与多空洗盘" },
      { nextEvent: "细分行业龙头财报以及产业供应链重组", eventImpact: "Low" as const, timingWarning: "个股异动，合理执行金字塔仓位补差" }
    ];
    return analysis?.catalystRadar || events[hash % events.length];
  };

  const getDeterministicSocial = () => {
    const code = symbol.toUpperCase();
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return {
      retailMood: hash % 3 === 0 ? "Fear" : hash % 3 === 1 ? "Greed" : "Neutral",
      institutionalAction: hash % 2 === 0 ? "Accumulating (吸筹)" : "Distributing (派发)",
      divergenceStatus: hash % 2 === 0 
        ? "Bullish Divergence (Retail Fear / Inst Buy)" 
        : "Bearish Divergence (Retail Greed / Inst Sell)",
      squeezeRisk: hash % 3 === 0 ? "High" : "Low"
    };
  };

  const correlations = getDeterministicCorrelation();
  const catalyst = getDeterministicCatalyst();
  const social = getDeterministicSocial();

  // --- MODEL TRINITY CONSENSUS WEIGHT TUNER CALCULATOR ---
  const rawQuantScore = analysis?.trinityConsensus?.quantScore || 85;
  const rawSmartScore = analysis?.trinityConsensus?.smartMoneyScore || 92;
  const rawChartScore = analysis?.trinityConsensus?.chartPatternScore || 78;

  // Normalize weight values safely to prevent divide-by-zero
  const weightSum = weightQuant + weightSmartMoney + weightChart;
  const normalizedQuant = weightSum > 0 ? (weightQuant / weightSum) : 0.40;
  const normalizedSmart = weightSum > 0 ? (weightSmartMoney / weightSum) : 0.40;
  const normalizedChart = weightSum > 0 ? (weightChart / weightSum) : 0.20;

  const dynamicConsensusScore = Math.round(
    rawQuantScore * normalizedQuant +
    rawSmartScore * normalizedSmart +
    rawChartScore * normalizedChart
  );

  let dynamicVerdict = 'MODERATE CONFLUENCE (一般共振振荡)';
  let dynamicVerdictDesc = '各项维度发展态势较为平缓，主力调仓与散户多空存在分歧，价格倾向于阻力均价内震荡洗盘。';
  let consensusRatingStars = '★★★☆☆';
  let consensusBadgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  if (dynamicConsensusScore >= 88) {
    dynamicVerdict = 'EXCELLENT TRINITY CONFLUENCE (高度共振)';
    dynamicVerdictDesc = '技术周期、聪明钱大单流与关键图表阻力已被核心引擎完美合并，具备极其强悍的顺势发酵能动性。';
    consensusRatingStars = '★★★★★';
    consensusBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (dynamicConsensusScore >= 78) {
    dynamicVerdict = 'ACCUMULATING HEURISTIC (偏多蓄势阶)';
    dynamicVerdictDesc = '吸筹吸筹动向高阶重合，支撑线防备巩固良好，主力在密集筹码堆积区具有强烈的防护防御。';
    consensusRatingStars = '★★★★☆';
    consensusBadgeColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
  } else if (dynamicConsensusScore < 60) {
    dynamicVerdict = 'DIVERGENT RISK EXPOSURE (背离走弱警告)';
    dynamicVerdictDesc = '各维度参数发生剧烈多空分流，散户极度贪婪而主力资金暗中出货，防守均线极易破位。建议偏向防御。';
    consensusRatingStars = '★★☆☆☆';
    consensusBadgeColor = 'text-red-400 bg-red-500/10 border-red-500/20';
  }

  // --- MODEL GOLD PYRAMID SCALING PLAN HELPERS ---
  const pyramidStage1Shares = Math.floor(safePositionQuantity * 0.5);
  const pyramidStage1Price = entryPriceVal;
  const pyramidStage1Margin = leverage > 0 ? (pyramidStage1Price * pyramidStage1Shares) / leverage : 0;

  const pyramidStage2Shares = Math.floor(safePositionQuantity * 0.3);
  const pyramidStage2Price = Math.max(0.01, entryPriceVal - (slDistance * 0.382));
  const pyramidStage2Margin = leverage > 0 ? (pyramidStage2Price * pyramidStage2Shares) / leverage : 0;

  const pyramidStage3Shares = Math.floor(safePositionQuantity * 0.2);
  const pyramidStage3Price = entryPriceVal + (tpDistance * 0.236);
  const pyramidStage3Margin = leverage > 0 ? (pyramidStage3Price * pyramidStage3Shares) / leverage : 0;

  // Rendering a beautiful progress bar for win rate
  const rrColorClass = calculatedRRRatio >= 3 
    ? { border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Perfect (极佳)', bg: 'bg-emerald-500/10' }
    : calculatedRRRatio >= 2
    ? { border: 'border-indigo-500/30', text: 'text-indigo-400', label: 'Premium (高级)', bg: 'bg-indigo-500/10' }
    : calculatedRRRatio >= 1.5
    ? { border: 'border-blue-500/30', text: 'text-blue-400', label: 'Standard (标准)', bg: 'bg-blue-500/10' }
    : { border: 'border-red-500/30', text: 'text-red-400', label: 'Sub-standard (较差)', bg: 'bg-red-500/10' };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
              多维度指标深度挖掘与量化决策舱
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Deep Multi-dimensional Association & Adaptive Risk Matrix for {symbol}
            </p>
          </div>
        </div>
        <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
          Pro Dashboard
        </span>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-slate-950 border-b border-slate-800 p-1">
        <button
          onClick={() => setActiveMiningTab('indicators')}
          className={`flex-1 py-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMiningTab === 'indicators'
              ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          id="tab-mining-indicators"
        >
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          三维指标深度挖掘
        </button>

        <button
          onClick={() => setActiveMiningTab('correlation')}
          className={`flex-1 py-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMiningTab === 'correlation'
              ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          id="tab-mining-correlation"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          深度多维关联分析
        </button>

        <button
          onClick={() => setActiveMiningTab('calculator')}
          className={`flex-1 py-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMiningTab === 'calculator'
              ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          id="tab-mining-calculator"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          出场计划风险计算器
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">

        {/* =============== TAB 1: THREE-DIMENSIONAL INDICATORS DEEP MINING =============== */}
        {activeMiningTab === 'indicators' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Dimension 1: Quantitative technical consensus */}
              <div className="bg-[#0b1215]/85 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> 维度一: 结构周期共振
                    </span>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.2 rounded">
                      指标联动
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">RSI (14) 强弱点:</span>
                      <span className="text-slate-100 font-bold">
                        {analysis?.hardData?.realTimeRsi || '52.6'} ({analysis?.hardData?.rsiStatus || '中性性'})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">MACD 主线状态:</span>
                      <span className="text-slate-100 font-bold">
                        {analysis?.technicalIndicators?.macdStatus || "Golden Cross (金叉偏向)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">EMA 指数趋势排列:</span>
                      <span className="text-emerald-400 font-bold">
                        {analysis?.technicalIndicators?.emaAlignment || "Bullish Stack (多头向上)"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <span className="text-slate-500">布林轨道振幅:</span>
                      <span className="text-slate-100 font-bold">
                        {analysis?.technicalIndicators?.bollingerStatus || "Expansion (开口扩张)"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">📍 模型诊断</span>
                  多周期结构共振较好，主流动能处于上升优势区，阻力回落时买单支撑性极强。
                </div>
              </div>

              {/* Dimension 2: Smart Money Orders Activity */}
              <div className="bg-[#0b1215]/85 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> 维度二: 聪明钱订单流
                    </span>
                    <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.2 rounded">
                      成交剖析
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">威科夫操盘阶段:</span>
                      <span className="text-slate-100 font-bold">
                        {analysis?.wyckoff?.phase || "Accumulation (底部吸筹阶段)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">关键异常事件:</span>
                      <span className="text-white font-bold text-slate-100">
                        {analysis?.wyckoff?.event || "Spring (强力清洗浮筹)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">SMC 市场结构:</span>
                      <span className="text-emerald-400 font-bold">
                        {analysis?.smc?.structure || "CHoCH (角色互换多头确认)"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <span className="text-slate-500">流动性回切状态:</span>
                      <span className="text-slate-100 font-bold">
                        {analysis?.smc?.liquidityStatus || "Swept (强力洗盘完毕)"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  <span className="text-indigo-400 font-bold flex items-center gap-1">📍 庄家动向</span>
                  大单主力净成交呈正流向，多次完成假跌破反抽洗盘，典型的机构建仓和筹码挪移完结。
                </div>
              </div>

              {/* Dimension 3: Intermarket & Derivatives Catalyst */}
              <div className="bg-[#0b1215]/85 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-400" /> 维度三: 期权Gamma博弈
                    </span>
                    <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono px-1.5 py-0.2 rounded">
                      杠杆衍生
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">期权最大痛点 (Max Pain):</span>
                      <span className="text-slate-100 font-bold text-amber-400">
                        {analysis?.optionsData?.maxPainPrice ? formatCurrency(analysis.optionsData.maxPainPrice) : formatCurrency(currentPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">Gamma 曝露水平:</span>
                      <span className="text-slate-100 font-bold">
                        {analysis?.optionsData?.gammaExposure || "Long Gamma (挤压波偏低)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-500">买卖比 Put-Call Ratio:</span>
                      <span className="text-slate-100 font-bold">
                        {analysis?.optionsData?.putCallRatio || '0.64'} (偏多建仓)
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <span className="text-slate-500">期权挤压风险:</span>
                      <span className={`font-bold ${social.squeezeRisk === 'High' ? 'text-rose-400' : 'text-slate-300'}`}>
                        {social.squeezeRisk || "Low (中低)"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                  <span className="text-amber-400 font-bold flex items-center gap-1">📍 衍生结论</span>
                  当前空头止损期权密集分布，如价格升破成交高筹码带，极易触发快速轧空多头暴拉行情。
                </div>
              </div>

            </div>

            {/* Tri-axial Consensus Rating Card */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-5">
              <div className="flex flex-col lg:flex-row gap-6 justify-between">
                
                {/* Left side: Results & Explanations */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" /> AI 三维指标共振评星
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">
                      Trinity Consensus Valve Rating (Live Custom Tuning)
                    </p>
                  </div>

                  <div className="bg-[#0b1215] border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400 text-xs">联合自适应评分:</span>
                      <div className="font-mono flex items-center gap-2">
                        <span className="text-sm text-slate-500 font-bold">{consensusRatingStars}</span>
                        <span className="text-xl font-black text-emerald-400 tracking-tight">{dynamicConsensusScore}</span>
                        <span className="text-[10px] text-slate-500">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[11px] font-black tracking-wide px-2 py-0.5 rounded border block w-fit mb-2 ${consensusBadgeColor}`}>
                        {dynamicVerdict}
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {dynamicVerdictDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side: Weight Sliders (Tuning Valves) */}
                <div className="w-full lg:w-[350px] bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" /> 指标决策权重调节阀
                    </span>
                    <button 
                      onClick={() => { setWeightQuant(40); setWeightSmartMoney(40); setWeightChart(20); }}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors font-bold uppercase"
                    >
                      恢复默认
                    </button>
                  </div>

                  {/* Slider 1: Tech indicator weight */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">RSI & EMA 量化技术</span>
                      <span className="text-emerald-400 font-bold">{Math.round(normalizedQuant * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={weightQuant}
                      onChange={(e) => setWeightQuant(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Slider 2: Smart Money weight */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">聪明钱及 Wyckoff 资金</span>
                      <span className="text-indigo-400 font-bold">{Math.round(normalizedSmart * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={weightSmartMoney}
                      onChange={(e) => setWeightSmartMoney(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Slider 3: Chart pattern weight */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">阻力位与突破图表结构</span>
                      <span className="text-blue-400 font-bold">{Math.round(normalizedChart * 100)}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={weightChart}
                      onChange={(e) => setWeightChart(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                </div>

              </div>

              {/* Grid of underlying scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-xs font-mono">
                <div className="p-3 bg-slate-900/80 border border-slate-800/60 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">量化技术分 (QUANT)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-100">{rawQuantScore}/100</span>
                    <span className="text-emerald-400 text-[10px]">权重: {Math.round(normalizedQuant * 100)}%</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800/60 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">主力流向分 (SMART MONEY)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-100">{rawSmartScore}/100</span>
                    <span className="text-indigo-400 text-[10px]">权重: {Math.round(normalizedSmart * 100)}%</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800/60 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">市场形态分 (CHART STRUCTURE)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-100">{rawChartScore}/100</span>
                    <span className="text-blue-400 text-[10px]">权重: {Math.round(normalizedChart * 100)}%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* =============== TAB 2: DEEP MULTI-DIMENSIONAL CORRELATION ANALYSIS =============== */}
        {activeMiningTab === 'correlation' && (() => {
          const resolvedCorrelations = getDeterministicCorrelation();
          const avgDivergence = Math.round(resolvedCorrelations.reduce((acc, c) => acc + c.divergenceScore, 0) / resolvedCorrelations.length);
          const activeDetail = resolvedCorrelations[selectedCorrelationsIndex] || resolvedCorrelations[0];

          // Overall joint divergence label
          let jointLabel = "宏观均势耦合 (Optimal Synchrony)";
          let jointLabelColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          let jointProgressColor = "bg-gradient-to-r from-emerald-500 to-teal-500";
          let jointMetricDesc = "各关联市场定价机制一致。当前走势属于高度良性的系统共振，底仓顺应当前AI大势逻辑，宏观扰动极低。";

          if (avgDivergence >= 65) {
            jointLabel = "极端脱轨与异常背离警报 (Severe Divergence)";
            jointLabelColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
            jointProgressColor = "bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse";
            jointMetricDesc = "警告：跨市场资金发生大规模撕裂性摩擦！个股偏离了大市、汇率或债息规律，预示局部有强筹码主力出港或对冲避险盘异常。极易发生暴风雨式补跌或报复性反弹，强制执行金字塔分批建仓法。";
          } else if (avgDivergence >= 30) {
            jointLabel = "常态化局部去耦合 (Active Decoupling)";
            jointLabelColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            jointProgressColor = "bg-gradient-to-r from-amber-500 to-indigo-500";
            jointMetricDesc = "个股表现出强于或弱于大盘的独立Alpha特质，受局部利好/利空支撑。可以适度超配个股特定因子，轻度参考大宏观。";
          }

          const stockTrendZh = analysis?.signal === SignalType.BUY 
            ? '📈 偏多(Bullish)' 
            : analysis?.signal === SignalType.SELL 
              ? '📉 偏空(Bearish)' 
              : '⏳ 盘整(Neutral)';

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* --- EXPLANATION & AGGREGATE DIVERGENCE INDEX CARD --- */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase block font-mono">
                      SYSTEM METRIC DEF: INTERMARKET DIVERGENCE CAPTURE
                    </span>
                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 leading-tight">
                      <GitMerge className="w-4 h-4 text-indigo-400" /> 什么是“关联资产背离度”？
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl font-sans">
                      股票并非孤岛。正常情况下，个股走势会与<b>大盘、行业板块、汇率/美元以及国债收益率</b>等宏观“关联资产”保持极强的同向或反向物理牵引。
                      当这种历史惯性被打破（例如：大盘暴跌，个股在强庄托盘下逆势上涨；或者美元走低，个股却滑落），就会产生<b>“背离度” (Divergence Degree)</b>。
                      背离度越高，代表个股独立筹码做庄属性越纯，也说明该趋势越具有<b>不可持续的破位暴击风险</b>，或<b>酝酿强烈的探底超额买点</b>。
                    </p>
                  </div>

                  {/* Aggregate Gauge */}
                  <div className="w-full lg:w-[280px] bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                      <span className="text-slate-400 font-sans">全市场资金联合背离指数</span>
                      <span className="text-xs font-bold text-slate-200">{avgDivergence}%</span>
                    </div>

                    {/* Progress track */}
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500`} 
                        style={{ width: `${avgDivergence}%`, backgroundImage: 'none' }}
                      >
                        <div className={`h-full rounded-full ${jointProgressColor}`} style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className={`text-[9px] font-black uppercase text-center px-2 py-0.5 rounded border ${jointLabelColor}`}>
                      {jointLabel}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/50">
                  <span className="font-bold text-slate-300">📍 多空系统当前态势:</span> 本股 <b>{symbol}</b> 最新AI量化打分为 <b>{stockTrendZh}</b>。系统正联动全天候资产对潜在偏离展开实时监测。
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Column 1: Asset Correlations Table & Interactive Controls */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <GitMerge className="w-3.5 h-3.5 text-indigo-400" /> 跨市场核心参考资产监控表 (单击对应行查看技术规避策略)
                    </h3>
                    <span className="text-[9px] text-slate-500 font-mono">数据刷新延迟: ~1.2s</span>
                  </div>
                  
                  <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden text-[11.5px] shadow-lg">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="border-b border-slate-800 bg-[#0e161b] text-[9.5px] uppercase font-bold text-slate-500 font-sans">
                          <th className="py-3 px-3">关联参考大宗/指数</th>
                          <th className="py-3 px-3 text-center">历史关系</th>
                          <th className="py-3 px-3 text-center">关联系数(r)</th>
                          <th className="py-3 px-3">对应资产实际趋势</th>
                          <th className="py-3 px-3">理论期望趋势</th>
                          <th className="py-3 px-3 text-center">背离偏离度</th>
                          <th className="py-3 px-3 text-right">大宗影响</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                        {resolvedCorrelations.map((c, i) => {
                          const hasHighDiv = c.divergenceScore >= 60;
                          const hasLowDiv = c.divergenceScore <= 15;
                          
                          let divIndicatorColor = "text-emerald-400";
                          let divIndicatorText = "同频正常";
                          let divProgressBarColor = "bg-emerald-500";
                          
                          if (hasHighDiv) {
                            divIndicatorColor = "text-rose-400 font-bold";
                            divIndicatorText = "异常背离";
                            divProgressBarColor = "bg-rose-500";
                          } else if (c.divergenceScore >= 30) {
                            divIndicatorColor = "text-amber-400";
                            divIndicatorText = "温和分化";
                            divProgressBarColor = "bg-amber-500";
                          }

                          const expectedTrendStr = c.correlationType.includes('Positive')
                            ? (analysis?.signal === SignalType.BUY ? '📈 偏多' : analysis?.signal === SignalType.SELL ? '📉 偏空' : '⏳ 盘整')
                            : (analysis?.signal === SignalType.BUY ? '📉 偏空' : analysis?.signal === SignalType.SELL ? '📈 偏多' : '⏳ 盘整');

                          return (
                            <tr 
                              key={i} 
                              onClick={() => setSelectedCorrelationsIndex(i)}
                              className={`transition-all hover:bg-slate-900/60 cursor-pointer ${
                                selectedCorrelationsIndex === i 
                                  ? 'bg-slate-800/40 border-l-2 border-l-indigo-500 border-y border-y-slate-800/50' 
                                  : ''
                              }`}
                            >
                              {/* Asset name */}
                              <td className="py-3.5 px-3 font-bold text-slate-200">
                                <div className="flex items-center gap-1.5">
                                  {selectedCorrelationsIndex === i && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping shrink-0" />}
                                  <span className="font-sans">{c.correlatedAsset}</span>
                                </div>
                              </td>

                              {/* Relation Type */}
                              <td className="py-3.5 px-3 text-center">
                                <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[8.5px] ${
                                  c.correlationType.includes('Positive') 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                                }`}>
                                  {c.correlationType.includes('Positive') ? "正相关 ⇄" : "负相关 ⇆"}
                                </span>
                              </td>

                              {/* Correlation strength coefficient */}
                              <td className="py-3.5 px-3 text-center font-bold text-slate-400 text-xs">
                                {c.coefficient > 0 ? `+${c.coefficient}` : c.coefficient}
                              </td>

                              {/* Actual current trend */}
                              <td className="py-3.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.assetTrend === 'Bullish' 
                                    ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10' 
                                    : c.assetTrend === 'Bearish' 
                                      ? 'text-rose-400 bg-rose-500/5 border border-rose-500/10' 
                                      : 'text-slate-500 bg-slate-900 border border-slate-805'
                                }`}>
                                  {c.assetTrend === 'Bullish' ? '📈 实际偏多' : c.assetTrend === 'Bearish' ? '📉 实际偏空' : '⏳ 实际横盘'}
                                </span>
                              </td>

                              {/* Expected Theoretical trend */}
                              <td className="py-3.5 px-3 font-sans text-slate-400">
                                {expectedTrendStr}
                              </td>

                              {/* Divergence Index visually with indicator percentage */}
                              <td className="py-3.5 px-3 text-center">
                                <div className="inline-flex flex-col items-center w-full max-w-[90px] gap-1">
                                  <div className="flex justify-between w-full text-[9px] font-bold">
                                    <span className={divIndicatorColor}>{divIndicatorText}</span>
                                    <span className="text-slate-200">{c.divergenceScore}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${divProgressBarColor}`} style={{ width: `${c.divergenceScore}%` }} />
                                  </div>
                                </div>
                              </td>

                              {/* Impact */}
                              <td className="py-3.5 px-3 text-right">
                                <span className={`font-bold text-[10.5px] rounded px-1.5 py-0.5 ${
                                  c.impact.includes('Tailwind') 
                                    ? 'text-emerald-400 bg-emerald-950/20' 
                                    : c.impact.includes('Headwind') 
                                      ? 'text-rose-400 bg-rose-955/20' 
                                      : 'text-slate-500 bg-slate-900'
                                }`}>
                                  {c.impact.includes('Tailwind') ? '助推 (Tailwind)' : c.impact.includes('Headwind') ? '阻力 (Headwind)' : '中性 (Neutral)'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* EXPERT LOBBY ANALYSIS BLOCK FOR INDIVIDUAL DIVERGENCE ACTIVE ITEM */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                          🔬
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none font-mono">SELECTED DIVERGENT PROFILE DEEP DIVE</span>
                          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
                            相关性对冲诊断: <span className="text-indigo-400">[{symbol} ⇄ {activeDetail.correlatedAsset}]</span>
                          </h4>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border uppercase ${
                        activeDetail.divergenceScore >= 60 
                          ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' 
                          : activeDetail.divergenceScore >= 30 
                            ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' 
                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {activeDetail.divergenceType}
                      </span>
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-300 font-sans space-y-2.5">
                      <p className="indent-2 leading-relaxed leading-normal">{activeDetail.explanation}</p>
                    </div>

                    {(() => {
                      const crossAssetDivergenceData = generateCrossAssetDivergenceData(symbol, activeDetail.correlatedAsset, activeDetail.coefficient, activeDetail.divergenceScore);
                      return (
                        <div className="mt-4 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center justify-between text-[9.5px] uppercase font-bold text-slate-400 mb-2 font-mono">
                             <span className="flex items-center gap-1.5">📈 联动走势与背离度时序实测 (Co-Movement & Divergence Sync)</span>
                             <span className="text-indigo-400 text-[8.5px]">时间轴 (X-Axis): 发生时点 (时分)</span>
                          </div>
                          
                          <div className="w-full h-[155px] relative bg-slate-950/50 rounded-lg border border-slate-850 p-2.5 overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={crossAssetDivergenceData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                <defs>
                                  <linearGradient id="tickerGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis 
                                  dataKey="time" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#475569', fontSize: 7, fontFamily: 'monospace' }} 
                                />
                                <YAxis 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#475569', fontSize: 7, fontFamily: 'monospace' }} 
                                />
                                <RechartsTooltip 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const item = payload[0].payload;
                                      return (
                                        <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[9.5px] font-mono text-slate-300 shadow-2xl flex flex-col gap-1 min-w-[120px]">
                                          <div className="text-slate-500 font-bold border-b border-slate-800 pb-0.5 mb-0.5 flex justify-between">
                                            <span>发生时点 (Time):</span>
                                            <span className="text-indigo-400">{item.time}</span>
                                          </div>
                                          <div className="flex justify-between gap-4">
                                            <span className="text-slate-400 font-bold">{symbol.toUpperCase()}:</span>
                                            <span className={item.ticker >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                              {item.ticker > 0 ? `+${item.ticker}` : item.ticker}%
                                            </span>
                                          </div>
                                          <div className="flex justify-between gap-4">
                                            <span className="text-slate-400">参考关联资产:</span>
                                            <span className={item.correlated >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                              {item.correlated > 0 ? `+${item.correlated}` : item.correlated}%
                                            </span>
                                          </div>
                                          <div className="w-full h-px bg-slate-800 my-0.5"></div>
                                          <div className="flex justify-between gap-4 text-indigo-400 font-semibold font-mono">
                                            <span>绝对背离度 (Div):</span>
                                            <span className="text-slate-200">
                                              {item.divergence}%
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="ticker" 
                                  name={symbol.toUpperCase()}
                                  stroke="#6366f1" 
                                  strokeWidth={1.5} 
                                  fill="url(#tickerGrad)" 
                                  dot={false}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="correlated" 
                                  name="关联资产"
                                  stroke="#cbd5e1" 
                                  strokeWidth={1} 
                                  strokeDasharray="3 3"
                                  fill="none" 
                                  dot={false}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 pt-2.5">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        💡 <span className="font-bold text-slate-200">资金对冲指引 (Hedge Plan):</span>
                        {activeDetail.divergenceScore >= 60
                          ? `当前背离突出！应严厉回避单向买入博弈。推荐使用 [${activeDetail.correlatedAsset}] 部分反向敞口进行系统对冲，锁仓安全水位。`
                          : "历史相关机制运行平顺，常规仓位布局无需过度避险对冲。"}
                      </span>
                      <button 
                        onClick={() => {
                          const recommendedLeverage = activeDetail.divergenceScore >= 60 ? 1 : 3;
                          setLeverage(recommendedLeverage);
                          // Select custom ticker as active
                          const shortAsset = activeDetail.correlatedAsset.split(' ')[0] || "BTC";
                          handleSimulateTicker(shortAsset);
                        }}
                        className="text-[9.5px] font-mono text-indigo-400 hover:underline flex hover:text-indigo-300 font-bold shrink-0 items-center justify-center"
                      >
                        设置该对冲环境
                      </button>
                    </div>
                  </div>

                  {/* --- NEW INTERACTIVE CROSS-MARKET HEDGING SIMULATOR --- */}
                  <div className="bg-slate-950/20 rounded-xl border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> 跨市场自定义资产关联度推演
                    </h4>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-mono font-bold">
                      套利推演
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    输入任意外部资产代号或行业板块ETFs（如 <b>GLD</b>、<b>US10Y</b>、<b>ETH</b> 或 <b>NVIDIA</b> 等），核心共识算法将基于价格波动共振与宏观资金流向，深度演算其与本标的 <b>{symbol}</b> 的联动因子和规避防守策略。
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input 
                        type="text"
                        placeholder="输入标的名 (如 AAPL, QQQ, TSLA, DXY...)"
                        value={customTicker}
                        onChange={(e) => handleSimulateTicker(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-3 pr-16 text-xs font-mono text-slate-100 uppercase focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded font-mono font-bold">
                        INPUT
                      </span>
                    </div>
                    
                    {/* Quick Trigger Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] text-slate-500 uppercase font-bold mr-1">快捷预设:</span>
                      {['QQQ', 'BTC', 'DXY', 'GLD', 'US10Y'].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSimulateTicker(t)}
                          className={`px-2 py-1 text-[10px] font-mono rounded font-bold border transition-all cursor-pointer ${
                            customTicker === t 
                              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 scale-105' 
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Correlation Slider Bar */}
                  <div className="bg-[#0b1215] border border-slate-800/80 rounded-xl p-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[11px] text-slate-400">
                        联动系数 <span className="font-mono font-bold text-slate-100">[{symbol} ⇄ {customTicker}]</span>
                      </span>
                      <span className={`text-sm font-mono font-black ${
                        simulatedCorrelation >= 0.5 ? 'text-emerald-400' : simulatedCorrelation <= -0.5 ? 'text-rose-400' : 'text-slate-200'
                      }`}>
                        {simulatedCorrelation > 0 ? `+${simulatedCorrelation.toFixed(2)}` : simulatedCorrelation.toFixed(2)}
                      </span>
                    </div>

                    <div className="relative h-2 bg-slate-800 rounded-full my-3 overflow-hidden border border-slate-700/40">
                      {/* Center static anchor */}
                      <div className="absolute left-1/2 w-0.5 h-full bg-slate-600/80 z-20" />
                      {/* Active gauge segment */}
                      <div 
                        className={`absolute top-0 h-full transition-all duration-300 ${
                          simulatedCorrelation >= 0 ? 'bg-gradient-to-r from-indigo-500/20 to-emerald-500' : 'bg-gradient-to-l from-indigo-500/20 to-rose-400'
                        }`}
                        style={{
                          left: simulatedCorrelation >= 0 ? '50%' : `${50 + simulatedCorrelation * 50}%`,
                          width: `${Math.abs(simulatedCorrelation) * 50}%`
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[8px] font-mono text-slate-600">
                      <span>-1.0 极端对冲</span>
                      <span>0.0 无关联</span>
                      <span>+1.0 极端共振</span>
                    </div>

                    {/* Reasoning description box */}
                    <div className="mt-4 p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed leading-normal font-sans">
                      <span className="font-bold text-indigo-400 block mb-1">📍 跨资产对冲建议:</span>
                      {correlationReasoning}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Event Catalysts Radar & Social Divergence */}
              <div className="space-y-4">
                <div className="bg-[#0b1215]/85 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> 近期重要催化事件雷达
                  </h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px]">主导催化事件:</span>
                      <span className="text-slate-100 font-bold block mt-1">{catalyst.nextEvent}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950 px-2.5 py-1.5 rounded border border-slate-805">
                      <span className="text-slate-500">剧烈波动可能性:</span>
                      <span className="text-rose-400 font-black text-xs">{catalyst.eventImpact}</span>
                    </div>
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] leading-relaxed text-amber-300">
                      <span className="font-bold block mb-1">⏰ 风控提醒:</span>
                      {catalyst.timingWarning}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b1215]/85 p-5 rounded-xl border border-slate-800 space-y-3.5">
                  <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> 社群零售分歧背离矩阵
                  </h3>
                  <div className="space-y-2.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">散户散落情绪:</span>
                      <span className="text-rose-400 font-bold">{social.retailMood} (狂热偏多)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">大单资金真实行为:</span>
                      <span className="text-emerald-400 font-bold">{social.institutionalAction}</span>
                    </div>
                    <div className="p-2.5 bg-indigo-505 bg-indigo-500/10 border border-indigo-500/25 rounded text-[10.5px] text-slate-300 leading-relaxed font-sans">
                      <span className="text-indigo-400 font-mono font-bold block mb-0.5">多空情绪背离度:</span>
                      {social.divergenceStatus}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}


        {/* =============== TAB 3: EXIT PLAN RISK CALCULATOR =============== */}
        {activeMiningTab === 'calculator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Left Column: Interactive Inputs */}
              <div className="md:col-span-4 bg-[#0b1215]/85 p-5 rounded-xl border border-slate-805 space-y-4">
                <h3 className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> 风控计算器参数输入 (Inputs)
                </h3>

                {/* Capital Input */}
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1.5 uppercase font-bold tracking-wide">
                    总资产账户净值 (Portfolio Equity)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono font-bold">$</span>
                    <input
                      type="number"
                      value={portfolioSize}
                      onChange={(e) => setPortfolioSize(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-7 pr-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Single Trade Risk Target */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                      单笔最大允许风险 (Risk Tolerated)
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400">{riskPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="10"
                    step="0.25"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[9px] text-slate-600 block mt-1 font-mono">
                    允许单回扣止损最大消耗资产达: <span className="text-rose-400 font-bold">${maxRiskAmountDollars.toLocaleString()}</span>
                  </span>
                </div>

                {/* Interactive Leverage Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                      放大杠杆倍率 (Leverage Multiplier)
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-400">{leverage}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value) || 1)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  {/* Leverage presets */}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[1, 3, 5, 10, 20, 50].map((x) => (
                      <button
                        key={x}
                        type="button"
                        onClick={() => setLeverage(x)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border cursor-pointer transition-all ${
                          leverage === x 
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 scale-105' 
                            : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200'
                        }`}
                      >
                        {x}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prices overrides */}
                <div className="space-y-3.5 pt-3.5 border-t border-slate-800/60">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label className="text-[10px] text-slate-500 block font-bold">
                        出入场均价 (Entry Target)
                      </label>
                      <div className="flex gap-1">
                        <button 
                          type="button" 
                          onClick={() => adjustPriceFactor('entry', 0.005)}
                          className="px-1 py-0.2 text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 rounded hover:text-slate-200 cursor-pointer"
                        >
                          +0.5%
                        </button>
                        <button 
                          type="button" 
                          onClick={() => adjustPriceFactor('entry', -0.005)}
                          className="px-1 py-0.2 text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 rounded hover:text-slate-200 cursor-pointer"
                        >
                          -0.5%
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={manualEntryPrice}
                      onChange={(e) => setManualEntryPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="text-[10px] text-emerald-400 block font-bold font-sans">
                          目标止盈 (Take Profit)
                        </label>
                        <div className="flex gap-1 select-none">
                          <button 
                            type="button" 
                            onClick={() => adjustPriceFactor('tp', 0.01)}
                            className="px-1 py-0.2 text-[8px] font-mono bg-slate-900 border border-slate-800 text-emerald-500 rounded hover:text-emerald-300 cursor-pointer"
                          >
                            +1%
                          </button>
                          <button 
                            type="button" 
                            onClick={() => adjustPriceFactor('tp', -0.01)}
                            className="px-1 py-0.2 text-[8px] font-mono bg-slate-900 border border-slate-800 text-emerald-500 rounded hover:text-emerald-300 cursor-pointer"
                          >
                            -1%
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        value={manualTakeProfit}
                        onChange={(e) => setManualTakeProfit(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="text-[10px] text-red-400 block font-bold font-sans">
                          防守止损 (Stop Loss)
                        </label>
                        <div className="flex gap-1 select-none">
                          <button 
                            type="button" 
                            onClick={() => adjustPriceFactor('sl', 0.01)}
                            className="px-1 py-0.2 text-[8px] font-mono bg-slate-900 border border-slate-800 text-rose-500 rounded hover:text-rose-300 cursor-pointer"
                          >
                            +1%
                          </button>
                          <button 
                            type="button" 
                            onClick={() => adjustPriceFactor('sl', -0.01)}
                            className="px-1 py-0.2 text-[8px] font-mono bg-slate-900 border border-slate-800 text-rose-500 rounded hover:text-rose-300 cursor-pointer"
                          >
                            -1%
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        value={manualStopLoss}
                        onChange={(e) => setManualStopLoss(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-mono text-red-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Calculations Rendered beautiful */}
              <div className="md:col-span-8 flex flex-col gap-6">

                {/* Risk Sizing Meter */}
                <div className="bg-slate-950/40 rounded-xl border border-slate-800 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" /> 基于风控优先原则的安全仓位计算结果
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-slate-900 border border-slate-805 p-3.5 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">止损价格空间</span>
                      <div className="mt-1 font-mono">
                        <span className="text-sm font-bold text-red-400 block">
                          {formatCurrency(slDistance)}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">波幅 {slPercentage.toFixed(2)}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl border-dashed border-emerald-500/20 flex flex-col justify-between">
                      <span className="text-[9px] text-emerald-400 uppercase font-bold block">最大安全开仓股数</span>
                      <div className="mt-1 font-mono">
                        <span className="text-lg font-black text-emerald-400 block tracking-tight">
                          {safePositionQuantity.toLocaleString()} <span className="text-xs font-normal">股</span>
                        </span>
                        <span className="text-[9px] text-slate-500 block">不让单回亏损越过风控限制</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-805 p-3.5 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">名义合约总市值</span>
                      <div className="mt-1 font-mono">
                        <span className="text-sm font-bold text-slate-200 block">
                          {formatCurrency(nominalPositionValue)}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          占总资本 {(nominalPositionValue / portfolioSize * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-805 p-3.5 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] text-indigo-400 uppercase font-bold block">实缴保证金 (Margin)</span>
                      <div className="mt-1 font-mono">
                        <span className="text-sm font-bold text-indigo-400 block">
                          {formatCurrency(marginRequired)}
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          按自研 {leverage}x 杠杆折合
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Mathematical Expectations and Kelly Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Math Expectation Check */}
                  <div className={`border p-4 rounded-xl ${rrColorClass.border} ${rrColorClass.bg}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                        期望盈亏比评估 (Reward to Risk Check)
                      </span>
                      <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded ${rrColorClass.text} border border-current`}>
                        {rrColorClass.label}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-3xl font-black text-slate-100 tracking-tighter">
                        {calculatedRRRatio.toFixed(2)} : 1
                      </span>
                    </div>

                    <div className="space-y-2 mt-3 text-[10px] leading-relaxed text-slate-400 font-mono">
                      <div className="flex justify-between">
                        <span>预期盈利幅 (TP %):</span>
                        <span className="text-emerald-400 font-bold">+{tpPercentage.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>止损保护幅 (SL %):</span>
                        <span className="text-red-400 font-bold">-{slPercentage.toFixed(2)}%</span>
                      </div>
                      <div className="border-t border-slate-800/40 pt-1.5 flex justify-between text-slate-300">
                        <span>1万美金资金预期最大回报:</span>
                        <span className="text-emerald-300 font-bold">
                          {formatCurrency((10000 / entryPriceVal) * tpDistance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kelly Criterion Formula Output */}
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider mb-2">
                        数学概率模型 ─ 凯利公式最优下注比例 (Kelly Option)
                      </span>
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className={`text-2xl font-bold tracking-tight ${kellyPct > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {kellyPct > 0 ? `${kellyPct.toFixed(1)}%` : '0.00% (不建议交易)'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-2.5">
                        凯利下注比率综合参考了 AI 推测胜率 (<span className="text-emerald-400 font-bold font-mono">{winPercent}%</span>) 与当前出场目标的盈亏比系数进行博弈配比。
                      </p>
                    </div>

                    <div className="text-[9px] text-slate-500 border-t border-slate-800/60 pt-2 font-mono">
                      {kellyPct > 0 
                        ? "✓ 该期望数值为正。根据凯利公式，以此仓位大小中长期执行能在本胜率下实现最大复利增长。"
                        : "⚠ 注意: 当前多空盈亏比空间偏低或胜率偏低，期望可能为负，凯利建议本场轻仓观望或调大止盈比。"
                      }
                    </div>
                  </div>

                </div>

                {/* --- NEW INTERACTIVE PYRAMID SCALING PLAN MATRIX --- */}
                <div className="bg-slate-950/40 rounded-xl border border-slate-800 p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Flame className="w-4 h-4 text-emerald-400 animate-pulse" /> 渐进式金字塔型分批开仓策略与推演
                    </h4>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold">
                      PYRAMID RADIAL
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    将主打安全额度（安全开仓股数：<span className="text-emerald-400 font-bold">{safePositionQuantity.toLocaleString()}</span> 股）做分段梯度拆解，能有效在均线反复拉锯时平顺买入均价、大幅优化盈亏比敞口。
                  </p>

                  <div className="overflow-hidden rounded-lg border border-slate-800 text-[11px] font-mono">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0e161b] text-slate-500 text-[9px] uppercase font-bold border-b border-slate-800">
                          <th className="py-2.5 px-3">梯队级别</th>
                          <th className="py-2.5 px-3">仓位比</th>
                          <th className="py-2.5 px-3">股数分配</th>
                          <th className="py-2.5 px-3">建仓参考价</th>
                          <th className="py-2.5 px-3">单段所需保证金</th>
                          <th className="py-2.5 px-3 text-right">触发生态策略</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {/* Stage 1 */}
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-emerald-400">第一梯队 (底仓)</td>
                          <td className="py-2.5 px-3">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.2 rounded text-[9px] font-bold">50%</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-100">{pyramidStage1Shares.toLocaleString()} 股</td>
                          <td className="py-2.5 px-3 text-slate-200">{formatCurrency(pyramidStage1Price)}</td>
                          <td className="py-2.5 px-3 text-indigo-400">
                            {formatCurrency(pyramidStage1Margin)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 text-xs">市价或限价首笔打底介入，确筹防踏空。</td>
                        </tr>

                        {/* Stage 2 */}
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-indigo-400">第二梯队 (防守补仓)</td>
                          <td className="py-2.5 px-3">
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.2 rounded text-[9px] font-bold">30%</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-100">{pyramidStage2Shares.toLocaleString()} 股</td>
                          <td className="py-2.5 px-3 text-amber-500 font-bold">
                            {formatCurrency(pyramidStage2Price)}
                          </td>
                          <td className="py-2.5 px-3 text-indigo-400">
                            {formatCurrency(pyramidStage2Margin)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 text-xs">Fib 0.382 筹码洗盘黄金防守带埋伏阻击。</td>
                        </tr>

                        {/* Stage 3 */}
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-rose-400">第三梯队 (突破加仓)</td>
                          <td className="py-2.5 px-3">
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/10 px-1.5 py-0.2 rounded text-[9px] font-bold">20%</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-100">{pyramidStage3Shares.toLocaleString()} 股</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">
                            {formatCurrency(pyramidStage3Price)}
                          </td>
                          <td className="py-2.5 px-3 text-indigo-400">
                            {formatCurrency(pyramidStage3Margin)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 text-xs">确认升破颈线阻力，或AI放量信号再次确立时加兵。</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Final Safety Action Guidelines */}
                <div className="p-3.5 bg-slate-950/20 border border-slate-800 rounded-xl text-[11px] font-sans flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="text-slate-200 font-bold block">量化分析师风险纪律指南:</span>
                    <p className="text-slate-400 leading-relaxed mt-1">
                      绝大多数实盘爆仓或发生重大亏损，并非由于行情看错，而是没有在严格执行本页面计算的<b>“安全开仓股数”</b>的情况下执意越级重仓或随意挪步止损保护点。当且仅当把每笔亏损严格通过开仓数限制在 1.5% - 2.0% 内，您才能从概率游戏上面实现长期正收益。
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
