
import React, { useState, useEffect } from 'react';
import { 
  Database, FileCode, Activity, Zap, RefreshCw, 
  Wifi, WifiOff, Server, BadgeCheck, Cpu, Terminal, 
  Rocket, Code2, Copy, ChevronRight, HardDrive, Info
} from 'lucide-react';
import { api } from '../services/api';
import { externalDb } from '../services/database';

const PrismaExplorer: React.FC = () => {
  const [stats, setStats] = useState({ partners: 0, agents: 0, calls: 0, orders: 0, users: 0 });
  const [health, setHealth] = useState<{ status: 'IDLE' | 'CHECKING' | 'ONLINE' | 'OFFLINE'; latency?: number }>({ status: 'IDLE' });
  const [activeTab, setActiveTab] = useState<'DEPLOY' | 'SERVER' | 'SCHEMA'>('DEPLOY');

  const updateStats = async () => {
    try {
      const [p, a, c, o, u] = await Promise.all([
        api.partners.getAll(),
        api.agents.getAll(),
        api.calls.getAll(),
        api.orders.getAll(),
        api.users.getAll()
      ]);
      setStats({
        partners: p.length,
        agents: a.length,
        calls: c.length,
        orders: o.length,
        users: u.length,
      });
    } catch (e) {}
  };

  useEffect(() => {
    updateStats();
    const checkStatus = async () => {
      const result = await externalDb.checkHealth();
      setHealth({ status: result.status, latency: result.latency });
    };
    checkStatus();
    
    const interval = setInterval(checkStatus, 5000);
    window.addEventListener('prisma-mutation', updateStats);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('prisma-mutation', updateStats);
    };
  }, []);

  const runDiagnostics = async () => {
    setHealth({ status: 'CHECKING' });
    const result = await externalDb.checkHealth();
    setHealth({ status: result.status, latency: result.latency });
    updateStats();
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    alert(`Copied: ${cmd}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu size={300} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6 bg-emerald-500/10 w-fit px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-xl">
              <Zap size={18} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Connection Console</span>
            </div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter italic leading-none">
              {health.status === 'ONLINE' ? 'Bridge Active' : 'Offline Engine'}
            </h2>
            <p className="text-blue-100 text-lg font-medium opacity-80 mb-8 leading-relaxed">
              Your UI is ready to bridge. Sync requires the <code className="text-emerald-400 bg-white/5 px-2 py-1 rounded font-mono">server.ts</code> engine on port 3001.
            </p>
            <div className="flex flex-wrap gap-4">
               <button 
                onClick={runDiagnostics}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border border-white/10"
               >
                 {health.status === 'CHECKING' ? <RefreshCw className="animate-spin" size={14} /> : <Wifi size={14} />}
                 {health.status === 'ONLINE' ? 'Sync Established' : 'Attempt Handshake'}
               </button>
               {health.status === 'ONLINE' && (
                 <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
                    <BadgeCheck size={14} /> Live Sync: {health.latency}ms
                 </div>
               )}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 w-full md:w-80 shadow-inner">
             <div className="flex items-center gap-2 mb-6 text-emerald-400">
                <Server size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cloud Relay Node</span>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Target Database</p>
                   <p className="text-[10px] font-mono break-all text-blue-100/80 leading-relaxed italic">Neon.tech Relational Grid</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[8px] font-black uppercase text-amber-400">
                  <Activity size={10} className="text-emerald-400" /> Relational Link Ready
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
             <div className="flex border-b border-slate-100 p-2 overflow-x-auto scrollbar-none">
                {[
                  { id: 'DEPLOY', label: 'Launch Protocol', icon: Terminal },
                  { id: 'SERVER', label: 'server.ts', icon: Code2 },
                  { id: 'SCHEMA', label: 'schema.prisma', icon: FileCode }
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
                           <h4 className="text-blue-900 font-black uppercase italic tracking-tighter text-xl mb-2">Connect Your Frontend</h4>
                           <p className="text-blue-900/70 text-sm font-medium leading-relaxed italic">
                              The system is strictly <span className="text-blue-600 font-bold">Relational/Online Only</span>. To interact with data, run the following in your terminal:
                           </p>
                        </div>
                     </div>

                     <div className="space-y-8 ml-4 border-l-2 border-slate-100 pl-10">
                        {[
                          { 
                            title: "Initialize Dependencies", 
                            desc: "Install the core stack for the Swift Express bridge.",
                            cmd: "npm install express cors @prisma/client",
                            icon: HardDrive
                          },
                          { 
                            title: "Client Generation", 
                            desc: "Pull technical metadata from the Neon.tech instance.",
                            cmd: "npx prisma generate",
                            icon: RefreshCw
                          },
                          { 
                            title: "Ignite Engine", 
                            desc: "Start the server. The UI will establish the link automatically.",
                            cmd: "npx ts-node server.ts",
                            icon: Zap
                          }
                        ].map((step, i) => (
                          <div key={i} className="relative group">
                            <div className="absolute -left-[53px] top-0 w-6 h-6 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center font-black text-[9px] text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900 transition">{i+1}</div>
                            <div className="space-y-4">
                               <div>
                                  <h5 className="font-black text-slate-900 uppercase italic tracking-tight text-lg flex items-center gap-2">
                                     <step.icon size={18} className="text-slate-900" /> {step.title}
                                  </h5>
                                  <p className="text-slate-400 text-sm font-medium mt-1 leading-relaxed">{step.desc}</p>
                               </div>
                               <div className="bg-slate-900 p-5 rounded-2xl flex items-center justify-between border border-white/5 shadow-inner">
                                  <code className="text-emerald-400 font-mono text-xs">{step.cmd}</code>
                                  <button onClick={() => copyCommand(step.cmd)} className="text-white/20 hover:text-white transition"><Copy size={14} /></button>
                               </div>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'SERVER' && (
                  <div className="space-y-6 animate-in fade-in">
                     <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Express Implementation</span></div>
                     <div className="bg-slate-900 rounded-3xl p-8 border border-white/5 shadow-2xl overflow-x-auto max-h-[600px]">
                        <pre className="text-emerald-400 font-mono text-xs leading-relaxed">
{`import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors() as any);
app.use(express.json() as any);

// Heartbeat for Bridge Discovery
app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', database: 'NEON_CLOUD' });
});

// Relational CRUD...`}
                        </pre>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 -mr-4 -mt-4"><Activity size={100} /></div>
            <h4 className="font-black text-slate-900 mb-10 flex items-center gap-3 uppercase italic tracking-tighter text-xl">
              <Activity size={24} className="text-emerald-500" />
              Cloud Live Feed
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Cloud Partners', value: stats.partners, icon: Database },
                { label: 'Active Pipeline', value: stats.orders, icon: Zap },
                { label: 'Security Tokens', value: stats.users, icon: BadgeCheck },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3">
                     <item.icon size={16} className="text-slate-400" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="font-black text-slate-900 italic text-sm tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismaExplorer;
