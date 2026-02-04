import React, { useState } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, RefreshCw, Send, Check, Rocket, ListChecks, Activity, Settings2, ArrowRight } from 'lucide-react';
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
      alert("AI Analysis failed. Please check your connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!recommendations) return;
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-swift-navy via-[#0A192F] to-indigo-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 -mr-16 -mt-16 rotate-12">
          <BrainCircuit size={320} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
            <Sparkles size={20} className="text-swift-green animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">GenAI System Architect • v4.0</span>
          </div>
          <h2 className="text-6xl font-black mb-6 uppercase italic tracking-tighter leading-none">Swift Strategy Tuner</h2>
          <p className="text-blue-100 text-xl font-medium opacity-80 leading-relaxed">
            Specify your manufacturing objectives or logistical bottlenecks. 
            I will generate a technical roadmap and re-calibrate your system parameters automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Controls */}
        <div className="lg:col-span-5 bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm sticky top-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter flex items-center gap-3">
              <Settings2 size={24} className="text-swift-red" />
              Strategic Goal
            </h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              Last Sync: {new Date(currentConfig.lastUpdated).toLocaleDateString()}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Objective Context</label>
              <textarea 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="E.g. Transition focus to high-margin industrial rollers while reducing dispatch fuel waste in the Northern territory..."
                className="w-full h-48 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-swift-navy/5 focus:border-swift-navy outline-none transition resize-none font-bold text-slate-800 placeholder:opacity-30"
              ></textarea>
            </div>
            
            <button 
              onClick={handleTune}
              disabled={loading || !goal}
              className="w-full flex items-center justify-center gap-4 py-6 bg-swift-navy text-white font-black uppercase tracking-[0.2em] rounded-[2rem] transition-all shadow-2xl active:scale-95 disabled:bg-slate-200 group"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              {loading ? 'Synthesizing Architecture...' : 'Architect System Roadmap'}
            </button>
          </div>
        </div>

        {/* Results / Roadmap */}
        <div className="lg:col-span-7 space-y-8">
          {!recommendations && !loading && (
            <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 opacity-50 bg-slate-50/50">
               <Activity size={64} className="mb-4" />
               <p className="font-black uppercase tracking-[0.4em] text-xs">Waiting for Strategist Prompt</p>
            </div>
          )}

          {loading && (
             <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-full w-48" />
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded-full w-full" />
                  <div className="h-4 bg-slate-100 rounded-full w-5/6" />
                  <div className="h-4 bg-slate-100 rounded-full w-4/6" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-slate-100 rounded-[2rem]" />
                  <div className="h-32 bg-slate-100 rounded-[2rem]" />
                </div>
             </div>
          )}

          {recommendations && !loading && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              {/* Parameter Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition group">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Commission Rate</p>
                   <p className="text-4xl font-black text-swift-navy italic tracking-tighter group-hover:text-swift-red transition">{recommendations.recommendedCommissionRate}%</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition group">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Daily Logistics Cap</p>
                   <p className="text-4xl font-black text-swift-navy italic tracking-tighter group-hover:text-swift-green transition">{recommendations.logisticsThreshold}L</p>
                </div>
              </div>

              {/* Phased Roadmap */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 -mr-8 -mt-8 rotate-12"><ListChecks size={160} /></div>
                <h3 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter mb-8 flex items-center gap-4 relative z-10">
                  <Activity size={24} className="text-swift-green" />
                  Implementation Roadmap
                </h3>
                
                <div className="space-y-8 relative z-10">
                  {recommendations.roadmap.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-swift-navy text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-swift-red transition shrink-0">
                          {step.phase}
                        </div>
                        {idx !== recommendations.roadmap.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-2" />}
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-white group-hover:shadow-xl transition-all border-l-4 border-l-slate-200 group-hover:border-l-swift-green flex-1">
                        <h4 className="font-black text-swift-navy uppercase italic tracking-tight text-lg mb-1">{step.title}</h4>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-4">{step.description}</p>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
                           <Check size={12} className="text-swift-green" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Milestone: {step.milestone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-10 border-t border-slate-100 space-y-6">
                   <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShieldCheck size={14} /> System Architect Reasoning
                      </h4>
                      <p className="text-blue-900 text-sm font-medium leading-relaxed italic">
                        "{recommendations.summary}"
                      </p>
                   </div>
                   
                   <button 
                    onClick={handleApply}
                    className={`w-full py-6 flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.3em] rounded-[2rem] transition-all shadow-2xl active:scale-95 ${
                      applied ? 'bg-swift-green hover:bg-emerald-600' : 'bg-swift-navy hover:bg-swift-navy/90'
                    }`}
                  >
                    {applied ? <Check size={20} /> : <ArrowRight size={20} />}
                    {applied ? 'Roadmap Applied & Persisted' : 'Execute System Overhaul'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIArchitect;