

import React, { useState } from 'react';
import { BacktestStrategy, BacktestPeriod, BacktestResult } from '../types';
import { performBacktest } from '../services/apiClient';
import { Loader2, X, TrendingUp, TrendingDown, Activity, PlayCircle, Trophy, AlertTriangle, Cpu } from 'lucide-react';

interface BacktestModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
}

const BacktestModal: React.FC<BacktestModalProps> = ({ isOpen, onClose, symbol }) => {
  const [strategy, setStrategy] = useState<BacktestStrategy>(BacktestStrategy.ICT_SILVER_BULLET);
  const [period, setPeriod] = useState<BacktestPeriod>(BacktestPeriod.MONTH_3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  if (!isOpen) return null;

  const handleRunBacktest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await performBacktest(symbol, strategy, period);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#151c24] border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-900/20 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-500" />
              策略历史回测
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold">Gemini 3 Pro</span>
                <span className="text-xs text-gray-500">
                对 {symbol} 历史行情的深度模拟
                </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">选择交易策略</label>
              <select 
                value={strategy} 
                onChange={(e) => setStrategy(e.target.value as BacktestStrategy)}
                className="w-full bg-[#0b1215] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                {Object.values(BacktestStrategy).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">回测时间范围</label>
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value as BacktestPeriod)}
                className="w-full bg-[#0b1215] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                {Object.values(BacktestPeriod).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleRunBacktest}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-blue-900/20 transform hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            {loading ? "Gemini Pro 正在深度推演..." : "启动高精策略回测"}
          </button>

          {/* Results Area */}
          {result && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <ResultCard label="历史胜率" value={`${result.winRate}%`} icon={<Trophy className="w-4 h-4 text-yellow-500" />} />
                <ResultCard label="净回报 (预估)" value={result.netProfit} icon={<TrendingUp className="w-4 h-4 text-green-500" />} highlight />
                <ResultCard label="盈亏比 (PF)" value={result.profitFactor.toString()} icon={<Activity className="w-4 h-4 text-blue-500" />} />
                <ResultCard label="总交易次数" value={result.totalTrades.toString()} icon={<Activity className="w-4 h-4 text-gray-500" />} />
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-[#0b1215]/50 border border-gray-800 rounded-xl p-5 mb-4 space-y-4">
                <div>
                   <h4 className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">资金曲线描述</h4>
                   <p className="text-sm text-gray-300 leading-relaxed">{result.equityCurveDescription}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                    <div className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> 最佳交易</div>
                    <div className="text-sm text-gray-200">{result.bestTrade}</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                    <div className="text-xs text-red-400 font-bold mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3"/> 最差交易</div>
                    <div className="text-sm text-gray-200">{result.worstTrade}</div>
                  </div>
                </div>

                <div>
                   <h4 className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-2 tracking-wider">
                    <Cpu className="w-3 h-3 text-blue-400" />
                    Gemini Pro 深度点评
                   </h4>
                   <p className="text-sm text-blue-200/80 italic border-l-2 border-blue-500/30 pl-3">
                      "{result.insights}"
                   </p>
                </div>
              </div>
              
              <div className="text-[10px] text-gray-600 text-center">
                * 回测数据基于 AI 对历史 K 线的检索与模拟，非精确逐笔成交回测，仅供参考。
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const ResultCard = ({ label, value, icon, highlight }: any) => (
  <div className={`bg-[#0b1215] p-4 rounded-xl border ${highlight ? 'border-green-500/30 bg-green-500/5' : 'border-gray-800'} flex flex-col items-center text-center hover:border-gray-700 transition-colors`}>
    <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
    </div>
    <div className="text-xl font-mono font-bold text-white">{value}</div>
  </div>
);

export default BacktestModal;