
import React, { useState, useEffect } from 'react';
import { 
  Database, FileCode, Activity, Cloud, Terminal, ShieldCheck, Zap, RefreshCw, 
  Wifi, WifiOff, Globe, Server, BadgeCheck, User, Info, CheckCircle2, 
  ExternalLink, Copy, AlertTriangle, ChevronRight, Rocket, Code2, Save, Send, Settings, ListChecks,
  Key, HardDrive, FileJson, Cpu
} from 'lucide-react';
import { prisma } from '../services/prisma';
import { externalDb } from '../services/database';

const PrismaExplorer: React.FC = () => {
  const [stats, setStats] = useState({ customers: 0, agents: 0, calls: 0, inventory: 0, users: 0, roles: 0 });
  const [health, setHealth] = useState<{ status: 'IDLE' | 'CHECKING' | 'ONLINE' | 'OFFLINE' | 'UNCONFIGURED'; latency?: number }>({ status: 'IDLE' });
  const [activeTab, setActiveTab] = useState<'DEPLOY' | 'SERVER' | 'SCHEMA'>('DEPLOY');

  useEffect(() => {
    const updateStats = () => {
      setStats({
        customers: prisma.partner.findMany().length,
        agents: prisma.salesAgent.findMany().length,
        calls: prisma.callReport.findMany().length,
        inventory: prisma.inventory.findMany().length,
        users: prisma.user.findMany().length,
        roles: prisma.role.findMany().length
      });
    };
    updateStats();
    const checkStatus = async () => {
      const result = await externalDb.checkHealth();
      setHealth({ status: result.status, latency: result.latency });
    };
    checkStatus();
    window.addEventListener('prisma-mutation', updateStats);
    return () => window.removeEventListener('prisma-mutation', updateStats);
  }, []);

  const runDiagnostics = async () => {
    setHealth({ status: 'CHECKING' });
    const result = await externalDb.checkHealth();
    setHealth({ status: result.status, latency: result.latency });
  };

  const dbHost = externalDb.getTargetUri().split('@')[1].split('/')[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      {/* HUD HEADER */}
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu size={300} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6 bg-emerald-500/10 w-fit px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-xl">
              <Zap size={18} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">System Core Monitor</span>
            </div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter italic leading-none">Local Bridge: {health.status === 'ONLINE' ? 'ACTIVE' : 'IDLE'}</h2>
            <p className="text-blue-100 text-lg font-medium opacity-80 mb-8">
              Backend files generated. Run <code className="text-emerald-400 bg-white/5 px-2 py-1 rounded">ts-node server.ts</code> to start the engine.
            </p>
            <div className="flex gap-4">
               <button 
                onClick={runDiagnostics}
                disabled={health.status === 'CHECKING'}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border border-white/10"
               >
                 {health.status === 'CHECKING' ? <RefreshCw className="animate-spin" size={14} /> : <Wifi size={14} />}
                 {health.status === 'ONLINE' ? 'Refresh Link' : 'Wake Up Server'}
               </button>
               {health.status === 'ONLINE' && (
                 <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <BadgeCheck size={14} /> Handshake Stable: {health.latency}ms
                 </div>
               )}
               {health.status === 'OFFLINE' && (
                 <div className="flex items-center gap-2 px-6 py-3 bg-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/20 shadow-lg">
                    <WifiOff size={14} /> Server Not Detected
                 </div>
               )}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 w-full md:w-80 shadow-inner">
             <div className="flex items-center gap-2 mb-6 text-emerald-400">
                <Server size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Database Node</span>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Host Instance</p>
                   <p className="text-[10px] font-mono break-all text-blue-100/80 leading-relaxed italic">{dbHost}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[8px] font-black uppercase text-amber-400">
                  <CheckCircle2 size={10} className="text-emerald-400" /> Relational Link Ready
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN CONSOLE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
             <div className="flex border-b border-slate-100 p-2 overflow-x-auto scrollbar-none">
                {[
                  { id: 'DEPLOY', label: 'Local Run Guide', icon: Terminal },
                  { id: 'SERVER', label: 'server.ts (Source)', icon: Code2 },
                  { id: 'SCHEMA', label: 'schema.prisma (Source)', icon: FileCode }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[140px] py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition rounded-2xl ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
             </div>

             <div className="p-10 min-h-[500px]">
                {activeTab === 'DEPLOY' && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-left-4">
                     <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex items-start gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Rocket size={120} /></div>
                        <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm"><Info size={24} /></div>
                        <div className="relative z-10">
                           <h4 className="text-blue-900 font-black uppercase italic tracking-tighter text-xl mb-2">Bridge is Now Present</h4>
                           <p className="text-blue-900/70 text-sm font-medium leading-relaxed italic">
                              I have generated the backend files in your project directory. Follow these steps to start the industrial engine.
                           </p>
                        </div>
                     </div>

                     <div className="space-y-8 ml-4 border-l-2 border-slate-100 pl-10">
                        {[
                          { 
                            title: "Verify Files", 
                            desc: "Ensure 'server.ts', 'schema.prisma', and '.env' are in your folder.",
                            cmd: "ls -a",
                            icon: HardDrive
                          },
                          { 
                            title: "Sync Prisma Client", 
                            desc: "Generate the type-safe client for your local Node environment.",
                            cmd: "npx prisma generate",
                            icon: RefreshCw
                          },
                          { 
                            title: "Ignite Backend", 
                            desc: "Start the Express server. The UI will automatically detect the bridge at port 3001.",
                            cmd: "npx ts-node server.ts",
                            icon: Zap
                          }
                        ].map((step, i) => (
                          <div key={i} className="relative group">
                            <div className="absolute -left-[53px] top-0 w-6 h-6 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center font-black text-[9px] text-slate-400 group-hover:border-swift-navy group-hover:text-swift-navy transition">{i+1}</div>
                            <div className="space-y-4">
                               <div>
                                  <h5 className="font-black text-slate-900 uppercase italic tracking-tight text-lg flex items-center gap-2">
                                     <step.icon size={18} className="text-swift-navy" /> {step.title}
                                  </h5>
                                  <p className="text-slate-400 text-sm font-medium mt-1 leading-relaxed">{step.desc}</p>
                               </div>
                               <div className="bg-slate-900 p-5 rounded-2xl flex items-center justify-between border border-white/5 shadow-inner">
                                  <code className="text-swift-green font-mono text-xs">{step.cmd}</code>
                                  <button onClick={() => navigator.clipboard.writeText(step.cmd)} className="text-white/20 hover:text-white transition"><Copy size={14} /></button>
                               </div>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'SERVER' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Point: server.ts</span>
                        <button onClick={() => navigator.clipboard.writeText('...')} className="text-slate-400 hover:text-swift-navy"><Copy size={16} /></button>
                     </div>
                     <div className="bg-slate-900 rounded-3xl p-8 border border-white/5 shadow-2xl overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10">
                        <pre className="text-swift-green font-mono text-xs leading-relaxed">
{`import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// API Implementation Logic...
// Full source code is available in your file system.`}
                        </pre>
                     </div>
                  </div>
                )}

                {activeTab === 'SCHEMA' && (
                  <div className="bg-slate-900 rounded-3xl p-8 overflow-x-auto animate-in fade-in">
                    <pre className="font-mono text-sm leading-relaxed text-blue-100/70">
{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Partner {
  id               String   @id @default(uuid())
  name             String
  assignedAgentId  String?
  // ... (Full Model in your local schema.prisma)
}`}
                    </pre>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* VITALS PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 -mr-4 -mt-4"><Activity size={100} /></div>
            <h4 className="font-black text-slate-900 mb-10 flex items-center gap-3 uppercase italic tracking-tighter text-xl">
              <Activity size={24} className="text-emerald-500" />
              Neural Topology
            </h4>
            <div className="space-y-4">
              {[
                { label: 'API Endpoint', value: '3001/api', icon: Globe },
                { label: 'ORM Version', value: 'Prisma 5.x', icon: Database },
                { label: 'Security Context', value: 'Neon Cloud', icon: ShieldCheck },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3">
                     <item.icon size={16} className="text-slate-400 group-hover/item:text-swift-navy transition" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="font-black text-slate-900 italic text-sm tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className={`mt-10 p-8 rounded-[2.5rem] border text-center transition-all duration-700 ${health.status === 'ONLINE' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transition-all duration-700 ${health.status === 'ONLINE' ? 'bg-white text-emerald-500 shadow-emerald-500/10' : 'bg-white text-slate-300'}`}>
                  {health.status === 'ONLINE' ? <BadgeCheck size={24} className="animate-bounce" /> : <RefreshCw size={24} />}
               </div>
               <p className={`font-black uppercase italic tracking-tighter text-lg mb-1 ${health.status === 'ONLINE' ? 'text-emerald-900' : 'text-slate-400'}`}>
                 {health.status === 'ONLINE' ? 'Bridge Live' : 'Bridge Inactive'}
               </p>
               <p className="text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                  {health.status === 'ONLINE' ? 'Syncing to Neon.tech' : 'Awaiting Local Ignition'}
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismaExplorer;
