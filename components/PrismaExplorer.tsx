
import React, { useState, useEffect } from 'react';
import { Database, FileCode, Activity, Cloud, Terminal, ShieldCheck, Zap } from 'lucide-react';
import { prisma } from '../services/prisma';
import { externalDb } from '../services/database';

const PrismaExplorer: React.FC = () => {
  const [stats, setStats] = useState({ customers: 0, agents: 0, calls: 0, inventory: 0, users: 0, roles: 0 });

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
    window.addEventListener('prisma-mutation', updateStats);
    return () => window.removeEventListener('prisma-mutation', updateStats);
  }, []);

  const dbUri = externalDb.getTargetUri();
  const dbHost = dbUri.split('@')[1].split('/')[0];

  const schema = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Role {
  id            String  @id @default(uuid())
  name          String
  description   String
  isSystemAdmin Boolean @default(false)
  users         User[]
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  name      String
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
}

model Partner {
  id            String       @id @default(uuid())
  name          String
  email         String
  phone         String
  contactPerson String
  location      String
  address       String
  type          CustomerType
  assignedAgentId String
  status        String
  businessCategory String
  defaultRatePerKg Float?
}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Database size={300} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6 bg-emerald-500/10 w-fit px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-xl">
              <Zap size={18} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Neon Cloud Active</span>
            </div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter italic">Relational Engine</h2>
            <p className="text-blue-200 text-lg font-medium opacity-80 max-w-xl">
              The system is currently mapping all operations to the Neon PostgreSQL cluster. 
              The backend project serves as the bridge for ACID-compliant transactions.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 w-full md:w-80">
             <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Terminal size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Connection Pooler</span>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-white/30 uppercase">Host</p>
                <p className="text-xs font-mono break-all text-blue-100">{dbHost}</p>
             </div>
             <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-white/50 uppercase">
                <ShieldCheck size={12} className="text-emerald-500" /> SSL REQUIRED
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#1e1e1e] rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
            <div className="bg-slate-800/50 px-8 py-4 flex items-center justify-between">
               <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">schema.prisma</span>
            </div>
            <div className="p-10 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-blue-100/80">{schema}</pre>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2 uppercase italic tracking-tight"><Activity size={18} className="text-emerald-500" />Cloud Vitals</h4>
            <div className="space-y-4">
              {[
                { label: 'Partners', value: stats.customers },
                { label: 'Agents', value: stats.agents },
                { label: 'Users', value: stats.users },
                { label: 'Roles', value: stats.roles },
                { label: 'Logs', value: stats.inventory }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition group">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-600">{item.label}</span>
                  <span className="font-black text-slate-900 italic text-lg">{item.value}</span>
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
