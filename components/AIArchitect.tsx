
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, RefreshCw, Send, Check } from 'lucide-react';
import { fineTuneSystemParams } from '../services/geminiService';
import { prisma } from '../services/prisma';
import { SystemConfig } from '../types';

interface AIArchitectProps {
  currentConfig: SystemConfig;
}

const AIArchitect: React.FC<AIArchitectProps> = ({ currentConfig }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [applied, setApplied] = useState(false);

  const handleTune = async () => {
    if (!goal) return;
    setLoading(true);
    setApplied(false);
    try {
      const result = await fineTuneSystemParams(currentConfig, goal);
      setRecommendations(result);
    } catch (err) {
      console.error(err);
      alert("AI Analysis failed. Please check your API connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!recommendations) return;
    // Persist to actual simulation database
    prisma.config.update({
      recommendedCommissionRate: recommendations.recommendedCommissionRate,
      targetEfficiencyMetric: recommendations.targetEfficiencyMetric,
      customerSegmentationAdvice: recommendations.customerSegmentationAdvice,
      logisticsThreshold: recommendations.logisticsThreshold
    });
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-[#1A2B6D] to-indigo-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BrainCircuit size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Powered by Gemini 3 Pro</span>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tight">PolyFlow AI Architect</h2>
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
            Describe your manufacturing goals or supply chain challenges, 
            and I'll automatically reconfigure system thresholds for your specific needs.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
        <h3 className="text-xl font-black text-swift-navy mb-6 flex justify-between items-center uppercase italic tracking-tighter">
          Fine-Tuning Request
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current: {currentConfig.recommendedCommissionRate}% / {currentConfig.logisticsThreshold}L</span>
        </h3>
        <div className="space-y-4">
          <textarea 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: We want to optimize for high-volume roller sales in Industrial Zone A while capping fuel usage strictly for deliveries..."
            className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-swift-red outline-none transition resize-none font-medium"
          ></textarea>
          <button 
            onClick={handleTune}
            disabled={loading || !goal}
            className="w-full flex items-center justify-center gap-3 py-5 bg-[#E31E24] hover:opacity-90 disabled:bg-slate-300 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
            {loading ? 'Synthesizing Roadmap...' : 'Generate Optimization Plan'}
          </button>
        </div>
      </div>

      {recommendations && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-l-blue-600 border border-slate-200 shadow-sm group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recommended Commission</p>
              <p className="text-4xl font-black text-swift-navy group-hover:text-blue-600 transition tracking-tighter italic">{recommendations.recommendedCommissionRate}%</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-l-emerald-600 border border-slate-200 shadow-sm group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Efficiency Metric</p>
              <p className="text-4xl font-black text-swift-navy group-hover:text-emerald-600 transition tracking-tighter italic uppercase">{recommendations.targetEfficiencyMetric.split(' ')[0]}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-l-amber-600 border border-slate-200 shadow-sm group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logistics Threshold (Daily)</p>
              <p className="text-4xl font-black text-swift-navy group-hover:text-amber-600 transition tracking-tighter italic">{recommendations.logisticsThreshold}L</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-l-swift-red border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Integration</p>
              <div className="flex items-center gap-2 text-emerald-600 font-black uppercase italic">
                <ShieldCheck size={20} />
                <span>Plan Validated</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <h4 className="font-black text-swift-navy uppercase italic mb-6 text-xl tracking-tighter">AI Logic Summary</h4>
            <p className="text-slate-600 leading-relaxed mb-8 text-lg">
              {recommendations.summary}
            </p>
            
            <h4 className="font-black text-swift-navy uppercase italic mb-4 tracking-tight">Strategic Segmentation</h4>
            <ul className="space-y-3 mb-10">
              {recommendations.customerSegmentationAdvice.map((advice: string, i: number) => (
                <li key={i} className="flex items-start gap-4 text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-swift-red flex-shrink-0"></div>
                  <span className="font-medium">{advice}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={handleApply}
              className={`w-full py-5 flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition shadow-2xl active:scale-95 ${
                applied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-swift-navy hover:bg-swift-navy/90'
              }`}
            >
              {applied ? <Check size={20} /> : <RefreshCw size={18} />}
              {applied ? 'Parameters Locked & Persisted' : 'Apply New Fine-Tuned Roadmap'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIArchitect;
