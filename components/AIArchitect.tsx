
import React, { useState } from 'react';
import { 
  Sparkles, BrainCircuit, ShieldCheck, RefreshCw, Send, Check, Rocket, ListChecks, 
  Activity, Settings2, ArrowRight, Terminal, Zap, BadgeCheck, Loader2, 
  Target, BarChart3, Database, ChevronRight, AlertCircle, Info, Map as MapIcon,
  Fingerprint, Cpu, Gauge, Radio
} from 'lucide-react';
import { fineTuneSystemParams } from '../services/geminiService';
import { api } from '../services/api';
import { SystemConfig } from '../types';

interface AIArchitectProps {
  currentConfig: SystemConfig;
}

const AIArchitect: React.FC<AIArchitectProps> = ({ currentConfig }) => {
  const [step, setStep] = useState(1);
  const [roadmapText, setRoadmapText] = useState('');
  const [focusArea, setFocusArea] = useState('REVENUE_GROWTH');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleStartAnalysis = async () => {
    setLoading(true);
    try {
      const data = await fineTuneSystemParams(currentConfig, roadmapText, focusArea);
      setResults(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Neural handshake failed. Ensure your Roadmap is descriptive.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersistence = async () => {
    setIsApplying(true);
    try {
      await api.config.update({
        recommendedCommissionRate: results.recommendedCommissionRate,
        targetEfficiencyMetric: results.targetEfficiencyMetric,
        customerSegmentationAdvice: results.customerSegmentationAdvice,
        logisticsThreshold: results.logisticsThreshold
      });
      setApplied(true);
      setStep(4);
    } catch (err) {
      alert("Failed to commit overrides to Sandbox Memory.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 space-y-8 animate-in fade-in duration-500">
      {/* HUD HEADER */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Cpu size={320} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-swift-green/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-swift-green/30">
            <Radio size={16} className="text-swift-green animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-swift-green">System Tuner Active</span>
          </div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Neural Workbench</h2>
          <p className="text-blue-200/60 font-medium max-w-2xl text-lg">
            Paste your business roadmap. I will analyze your goals and re-calibrate the entire OS to fit your specific workflow.
          </p>
          
          <div className="flex gap-4 mt-12">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-swift-green shadow-[0_0_20px_rgba(103,177,70,0.5)]' : 'bg-white/5'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white rounded-[4rem] border border-slate-200 p-12 shadow-sm min-h-[650px] flex flex-col relative overflow-hidden">
          
          {step === 1 && (
            <div className="space-y-12 animate-in slide-in-from-left-6 duration-500">
              <div className="space-y-3">
                 <h3 className="text-4xl font-black text-swift-navy uppercase italic tracking-tighter">1. Input Roadmap</h3>
                 <p className="text-slate-400 font-bold">What are your specific targets for the next 90 days?</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'REVENUE_GROWTH', label: 'Aggressive Scale', icon: Target, desc: 'Prioritize volume' },
                  { id: 'LOGISTICS_EFFICIENCY', label: 'Cost Reduction', icon: Gauge, desc: 'Optimize fuel/fleet' },
                  { id: 'MARKET_PENETRATION', label: 'New Territories', icon: MapIcon, desc: 'Acquire partners' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setFocusArea(opt.id)}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-start gap-4 text-left ${focusArea === opt.id ? 'bg-swift-navy text-white border-swift-navy shadow-2xl scale-[1.02]' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <opt.icon size={32} className={focusArea === opt.id ? 'text-swift-green' : 'text-slate-300'} />
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest block">{opt.label}</span>
                      <span className="text-[10px] font-bold opacity-60 uppercase">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Paste Roadmap Details / Strategic Notes</label>
                <textarea 
                  value={roadmapText}
                  onChange={e => setRoadmapText(e.target.value)}
                  className="w-full h-56 p-10 bg-slate-50 border border-slate-200 rounded-[3rem] font-bold outline-none focus:ring-[15px] focus:ring-swift-navy/5 focus:border-swift-navy transition-all resize-none text-lg"
                  placeholder="Example: We want to expand into the Northern markets. Our goal is to hit $200k in roller sales while keeping logistics costs under 10% per trip..."
                />
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!roadmapText || roadmapText.length < 10}
                className="w-full py-8 bg-swift-navy text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-swift-green transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:scale-95"
              >
                Launch Neural Scan <ArrowRight size={24} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-24 animate-in zoom-in-95">
               <div className="w-40 h-40 relative mb-12">
                  <div className="absolute inset-0 bg-swift-green/10 rounded-full animate-ping" />
                  <div className="absolute inset-4 bg-swift-green/20 rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center text-swift-green">
                    <BrainCircuit size={64} className="animate-bounce" />
                  </div>
               </div>
               <h3 className="text-4xl font-black text-swift-navy uppercase italic tracking-tighter mb-4">Synthesizing System Shift</h3>
               <p className="text-slate-400 font-bold max-w-sm mx-auto mb-16 leading-relaxed">
                 Translating your roadmap into binary overrides for the Swift OS engine...
               </p>
               
               <button 
                onClick={handleStartAnalysis}
                disabled={loading}
                className="px-16 py-8 bg-swift-navy text-white rounded-full font-black uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition shadow-3xl disabled:bg-slate-100 disabled:text-slate-300"
               >
                 {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                 {loading ? 'Crunching Variables...' : 'Initialize Override Calculation'}
               </button>
            </div>
          )}

          {step === 3 && results && (
            <div className="space-y-12 animate-in slide-in-from-right-6 duration-500">
               <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                  <div>
                    <h3 className="text-4xl font-black text-swift-navy uppercase italic tracking-tighter">2. Analysis Results</h3>
                    <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest">Calculated ROI Impact: <span className="text-swift-green font-black">{results.projectedImpact}</span></p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                     <BadgeCheck size={20} />
                     <span className="text-xs font-black uppercase tracking-widest">Logic Calibrated</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">System Overrides</p>
                     <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comm. Rate</span>
                           <span className="text-4xl font-black text-swift-navy italic tracking-tighter">{results.recommendedCommissionRate}%</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fuel Cap</span>
                           <span className="text-4xl font-black text-swift-navy italic tracking-tighter">{results.logisticsThreshold}L</span>
                        </div>
                     </div>
                  </div>
                  <div className="bg-swift-navy p-10 rounded-[3rem] text-white shadow-xl flex flex-col justify-center">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">Strategy Signature</p>
                     <p className="text-3xl font-black italic uppercase tracking-tighter leading-tight mb-4">"{results.targetEfficiencyMetric}"</p>
                     <div className="flex items-center gap-2 text-swift-green text-[10px] font-black uppercase tracking-widest">
                        <Radio size={12} className="animate-pulse" /> Neural Mapping Complete
                     </div>
                  </div>
               </div>

               <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <ListChecks size={20} className="text-swift-navy" /> Strategic Roadmap Output
                  </h4>
                  <div className="space-y-8">
                    {results.roadmap.map((item: any, i: number) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="w-12 h-12 rounded-2xl bg-swift-navy text-white text-xs font-black flex items-center justify-center shrink-0 shadow-lg group-hover:bg-swift-red transition duration-500 group-hover:rotate-6">{i+1}</div>
                        <div className="border-b border-slate-200/60 pb-6 w-full group-last:border-none">
                          <p className="text-lg font-black text-swift-navy uppercase italic tracking-tight">{item.title}</p>
                          <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-8">
                 {isApplying ? (
                    <div className="w-full py-10 bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center gap-6 animate-in fade-in">
                       <RefreshCw className="animate-spin text-swift-green" size={40} />
                       <p className="text-white text-[11px] font-black uppercase tracking-[0.4em]">Writing Logic Overrides to Sandbox...</p>
                    </div>
                 ) : (
                    <button 
                      onClick={handlePersistence}
                      className="w-full py-10 bg-swift-green text-white rounded-[3rem] font-black uppercase tracking-[0.4em] shadow-3xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-5 scale-100 hover:scale-[1.02] active:scale-95"
                    >
                      <Database size={28} /> Commit Roadmap To System
                    </button>
                 )}
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-24 animate-in zoom-in-95">
               <div className="w-48 h-48 bg-swift-green/10 rounded-full flex items-center justify-center text-swift-green mb-12 shadow-inner border-2 border-swift-green/20">
                  <BadgeCheck size={96} className="animate-in zoom-in-50 duration-700" />
               </div>
               <h3 className="text-5xl font-black text-swift-navy uppercase italic tracking-tighter mb-6">OS Optimized</h3>
               <p className="text-slate-400 font-bold max-w-md mx-auto mb-16 text-lg leading-relaxed">
                 The system has been successfully re-configured for your roadmap. Calculations across the dashboard now use your custom fine-tuned logic.
               </p>
               
               <button 
                onClick={() => setStep(1)}
                className="px-16 py-8 bg-swift-navy text-white rounded-full font-black uppercase tracking-widest flex items-center gap-4 hover:bg-swift-red transition shadow-3xl"
               >
                 <RefreshCw size={24} /> New Roadmap Tune-Up
               </button>
            </div>
          )}
        </div>

        {/* SIDEBAR INTELLIGENCE */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Terminal size={140} /></div>
              <h4 className="text-xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-4">
                 <Radio size={24} className="text-swift-green animate-pulse" />
                 Diagnostic Feed
              </h4>
              <div className="space-y-6">
                 <div className="flex gap-5 items-start">
                    <div className="w-2 h-2 rounded-full bg-swift-green mt-2 animate-pulse shadow-[0_0_10px_#67B146]" />
                    <p className="text-xs font-bold text-blue-100/60 leading-relaxed uppercase">Neural Handshake: <span className="text-white font-black">ESTABLISHED</span></p>
                 </div>
                 <div className="flex gap-5 items-start">
                    <div className="w-2 h-2 rounded-full bg-swift-green mt-2" />
                    <p className="text-xs font-bold text-blue-100/60 leading-relaxed uppercase">Memory Layer: <span className="text-white font-black">SANDBOX / LOCAL</span></p>
                 </div>
                 <div className="flex gap-5 items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 ${applied ? 'bg-swift-green' : 'bg-white/10'}`} />
                    <p className="text-xs font-bold text-blue-100/60 leading-relaxed uppercase">Logic Persistence: <span className={applied ? "text-white font-black" : "text-white/20"}>{applied ? 'VERIFIED' : 'AWAITING COMMIT'}</span></p>
                 </div>
              </div>
              
              <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
                 <p className="text-[10px] font-black text-swift-green uppercase tracking-[0.2em] mb-4">Current OS Profile</p>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="opacity-50 uppercase">Base Fulfill Speed:</span>
                       <span>3.0 Days</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="opacity-50 uppercase">Safety Margin:</span>
                       <span>12%</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-blue-50 p-10 rounded-[3.5rem] border border-blue-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-blue-600">
                <Info size={24} />
                <span className="text-xs font-black uppercase tracking-widest">Developer Note</span>
              </div>
              <p className="text-blue-900/60 text-sm font-medium leading-relaxed italic">
                Because you are using the <span className="text-blue-700 font-bold">Sandbox Engine</span>, these tuning changes happen entirely within your browser. This is perfect for rapid prototyping without needing a complex backend setup.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIArchitect;
