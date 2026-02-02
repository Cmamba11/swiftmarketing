
import React, { useState, useEffect } from 'react';
import { Database, FileCode, Activity } from 'lucide-react';
import { prisma } from '../services/prisma';

const PrismaExplorer: React.FC = () => {
  const [stats, setStats] = useState({ customers: 0, agents: 0, calls: 0, inventory: 0, users: 0, roles: 0 });

  useEffect(() => {
    const updateStats = () => {
      setStats({
        // Fix: Use prisma.partner instead of prisma.wholesaler
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

  const schema = `model Role {
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
}

model SalesAgent {
  id               String       @id @default(uuid())
  name             String
  email            String
  phone            String
  region           String
  performanceScore Int
}

model CallReport {
  id         String     @id @default(uuid())
  customerId String
  agentId    String
  date       DateTime   @default(now())
  duration   Int        // Talk Time in Mins
  outcome    VisitOutcome
  notes      String
}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Database size={240} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Database Live</span>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Relational Schema Architect</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-[#1e1e1e] rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
            <div className="p-8 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed text-slate-300">{schema}</pre>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity size={18} className="text-emerald-500" />System Vitals</h4>
            <div className="space-y-4">
              {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{key}</span>
                  <span className="font-black text-slate-900">{val}</span>
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
