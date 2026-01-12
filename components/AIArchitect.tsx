
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, RefreshCw, Send, Check } from 'lucide-react';
import { fineTuneSystemParams } from '../services/geminiService';
import { db } from '../services/db';
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
    db.updateConfig({
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
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BrainCircuit size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Powered by Gemini 3 Pro</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">PolyFlow AI Architect</h2>
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
            Describe your manufacturing goals or supply chain challenges, 
            and I'll automatically reconfigure system thresholds for your specific needs.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex justify-between items-center">
          Fine-Tuning Request
          <span className="text-xs font-medium text-slate-400">Current Config: {currentConfig.recommendedCommissionRate}% / {currentConfig.logisticsThreshold}L</span>
        </h3>
        <div className="space-y-4">
          <textarea 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: We want to optimize for high-volume roller sales in Industrial Zone A while capping fuel usage strictly for deliveries..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
          ></textarea>
          <button 
            onClick={handleTune}
            disabled={loading || !goal}
            className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
            {loading ? 'Synthesizing Roadmap...' : 'Generate Optimization Plan'}
          </button>
        </div>
      </div>

      {recommendations && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-blue-600 border border-slate-200 shadow-sm group">
              <p className="text-sm font-semibold text-slate-500 mb-1">Recommended Commission</p>
              <p className="text-3xl font-bold text-slate-800 group-hover:text-blue-600 transition">{recommendations.recommendedCommissionRate}%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-600 border border-slate-200 shadow-sm group">
              <p className="text-sm font-semibold text-slate-500 mb-1">Target Efficiency Metric</p>
              <p className="text-3xl font-bold text-slate-800 group-hover:text-emerald-600 transition">{recommendations.targetEfficiencyMetric}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-amber-600 border border-slate-200 shadow-sm group">
              <p className="text-sm font-semibold text-slate-500 mb-1">Logistics Threshold (Daily)</p>
              <p className="text-3xl font-bold text-slate-800 group-hover:text-amber-600 transition">{recommendations.logisticsThreshold}L</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-indigo-600 border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-500 mb-1">System Integration</p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <ShieldCheck size={20} />
                <span>Plan Validated</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 text-lg">AI Logic Summary</h4>
            <p className="text-slate-600 leading-relaxed mb-6">
              {recommendations.summary}
            </p>
            
            <h4 className="font-bold text-slate-800 mb-3">Strategic Segmentation</h4>
            <ul className="space-y-2 mb-8">
              {recommendations.customerSegmentationAdvice.map((advice: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={handleApply}
              className={`w-full py-4 flex items-center justify-center gap-2 text-white font-bold rounded-xl transition shadow-lg ${
                applied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {applied ? <Check size={20} /> : <RefreshCw size={18} />}
              {applied ? 'Parameters Applied Locally' : 'Apply New Parameters to PolyFlow'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIArchitect;
