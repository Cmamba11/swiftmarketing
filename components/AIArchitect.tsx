
import React, { useState } from 'react';
import { 
  Sparkles, BrainCircuit, ShieldCheck, RefreshCw, Send, Check, Rocket, ListChecks, 
  Activity, Settings2, ArrowRight, Terminal, Zap, BadgeCheck, Loader2, 
  Target, BarChart3, Database, ChevronRight, AlertCircle, Info
} from 'lucide-react';
import { fineTuneSystemParams } from '../services/geminiService';
import { prisma } from '../services/prisma';
import { SystemConfig } from '../types';

interface AIArchitectProps {
  currentConfig: SystemConfig;
}

const AIArchitect: React.FC<AIArchitectProps> = ({ currentConfig }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [focusArea, setFocusArea] = useState('REVENUE_GROWTH');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleStartAnalysis = async () => {
    setLoading(true);
    try {
      const data = await fineTuneSystemParams(currentConfig, goal, focusArea);
      setResults(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Neural handshake failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersistence = async () => {
    setIsApplying(true);
    // Simulate complex DB operations
    await new Promise(r => setTimeout(r, 2000));
    
    prisma.config.update({
      recommendedCommissionRate: results.recommendedCommissionRate,
      targetEfficiencyMetric: results.targetEfficiencyMetric,
      customerSegmentationAdvice: results.customerSegmentationAdvice,
      logisticsThreshold: results.logisticsThreshold
    });

    setIsApplying(false);
    setApplied(true);
    setStep(4);
  };

  const reset = () => {
    setStep(1);
    setResults(null);
    setApplied(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 space-y-8 animate-in fade-in duration-500">
      {/* HUD HEADER */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><BrainCircuit size={280} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles size={16} className="text-swift-green animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Fine-Tuner v4.5</span>
          </div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Neural Workbench</h2>
          <p className="text-blue-200/60 font-medium max-w-xl">Re-calibrate your industrial logic based on real-time goals.</p>
          
          {/* STEP INDICATOR */}
          <div className="flex gap-4 mt-12">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-swift-green shadow-[0_0_15px_rgba(103,177,70,0.4)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* MAIN CONSOLE */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-200 p-12 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
          
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-left-4 duration-500">
              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-swift-navy uppercase italic tracking-tighter">Step 1: Goal Definition</h3>
                 <p className="text-slate-400 font-bold text-sm">Select your primary roadmap objective for this cycle.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'REVENUE_GROWTH', label: 'Scale Revenue', icon: Target },
                  { id: 'LOGISTICS_EFFICIENCY', label: 'Cut Logistics Cost', icon: Zap },
                  { id: 'PRODUCTION_SPEED', label: 'Speed Fulfillment', icon: Rocket }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setFocusArea(opt.id)}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${focusArea === opt.id ? 'bg-swift-navy text-white border-swift-navy shadow-xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <opt.icon size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Strategic Context / Specific Roadmap Goals</label>
                <textarea 
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  className="w-full h-48 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold outline-none focus:ring-8 focus:ring-swift-navy/5 focus:border-swift-navy transition-all resize-none"
                  placeholder="E.g. We need to focus on Lagos-based industrial rollers while capping diesel usage at 40L per dispatch..."
                />
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!goal}
                className="w-full py-6 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-swift-green transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Proceed to Analysis <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95">
               <div className="w-32 h-32 relative mb-10">
                  <div className="absolute inset-0 bg-swift-green/10 rounded-full animate-ping" />
                  <div className="absolute inset-4 bg-swift-green/20 rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center text-swift-green">
                    <BrainCircuit size={48} />
                  </div>
               </div>
               <h3 className="text-3xl font-black text-swift-navy uppercase italic tracking-tighter mb-4">Neural Synthesis In Progress</h3>
               <p className="text-slate-400 font-bold max-w-sm mx-auto mb-12">Analyzing database metrics and aligning them with your Strategic Context...</p>
               
               <button 
                onClick={handleStartAnalysis}
                disabled={loading}
                className="px-12 py-6 bg-swift-navy text-white rounded-full font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition shadow-2xl disabled:bg-slate-200"
               >
                 {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                 {loading ? 'Consulting Logic Engine...' : 'Initialize Analysis'}
               </button>
            </div>
          )}

          {step === 3 && results && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-swift-navy uppercase italic tracking-tighter">Step 3: Simulation Results</h3>
                    <p className="text-slate-400 font-bold text-sm italic">Projected ROI: <span className="text-swift-green font-black">{results.projectedImpact}</span></p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                     <BadgeCheck size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Logic Optimized</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Proposed Parameter Shift</p>
                     <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                           <span className="text-xs font-bold text-slate-500 uppercase">Comm. Rate</span>
                           <span className="text-3xl font-black text-swift-navy italic tracking-tighter">{results.recommendedCommissionRate}%</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                           <span className="text-xs font-bold text-slate-500 uppercase">Fuel Cap</span>
                           <span className="text-3xl font-black text-swift-navy italic tracking-tighter">{results.logisticsThreshold}L</span>
                        </div>
                     </div>
                  </div>
                  <div className="bg-swift-navy p-8 rounded-[2rem] text-white">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Target Efficiency Metric</p>
                     <p className="text-2xl font-black italic uppercase tracking-tighter leading-none">{results.targetEfficiencyMetric}</p>
                     <div className="mt-8 flex items-center gap-2 text-swift-green text-[10px] font-black uppercase">
                        <Zap size={12} fill="currentColor" /> Calculated by AI
                     </div>
                  </div>
               </div>

               <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ListChecks size={16} /> Deployment Roadmap
                  </h4>
                  <div className="space-y-6">
                    {results.roadmap.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-swift-navy text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-lg group-hover:bg-swift-red transition">{i+1}</div>
                        <div>
                          <p className="text-sm font-black text-swift-navy uppercase italic tracking-tight">{item.title}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-6">
                 {isApplying ? (
                    <div className="w-full py-8 bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center gap-4 animate-in fade-in">
                       <Loader2 className="animate-spin text-swift-green" size={32} />
                       <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Injecting parameters into Neon DB...</p>
                    </div>
                 ) : (
                    <button 
                      onClick={handlePersistence}
                      className="w-full py-8 bg-swift-green text-white rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-4"
                    >
                      <Database size={24} /> Commit Changes to Database
                    </button>
                 )}
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in zoom-in-95">
               <div className="w-40 h-40 bg-swift-green/10 rounded-full flex items-center justify-center text-swift-green mb-10 shadow-inner">
                  <BadgeCheck size={84} />
               </div>
               <h3 className="text-4xl font-black text-swift-navy uppercase italic tracking-tighter mb-4">System Re-Calibrated</h3>
               <p className="text-slate-400 font-bold max-w-sm mx-auto mb-12">The industrial logic has been updated in the cloud. Your dashboard and sales ledger now reflect the new fine-tuned metrics.</p>
               
               <button 
                onClick={reset}
                className="px-12 py-6 bg-swift-navy text-white rounded-full font-black uppercase tracking-widest flex items-center gap-3 hover:bg-swift-red transition shadow-2xl"
               >
                 <RefreshCw size={20} /> Start New Tune-Up
               </button>
            </div>
          )}
        </div>

        {/* SIDEBAR INTEL */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 -mr-6 -mt-6"><Settings2 size={120} /></div>
              <h4 className="text-lg font-black text-swift-navy uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                 <Terminal size={20} className="text-swift-red" />
                 Fine-Tuning Log
              </h4>
              <div className="space-y-4">
                 <div className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-swift-green mt-1.5" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">Neural Network mapped to <span className="text-swift-navy font-black">Prisma Schema v2</span></p>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-swift-green mt-1.5" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">Target Database: <span className="text-swift-navy font-black">Neon.tech AWS-US-East</span></p>
                 </div>
                 <div className="flex gap-4 items-start opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5" />
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">Awaiting persistence event...</p>
                 </div>
              </div>
           </div>

           <div className="bg-blue-50 p-8 rounded-[3rem] border border-blue-100">
              <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info size={16} /> Roadmap Note
              </h5>
              <p className="text-blue-900/70 text-sm font-medium leading-relaxed italic">
                Fine-tuning allows you to shift the business logic without changing code. Use Step 3 to audit recommendations before committing.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIArchitect;
