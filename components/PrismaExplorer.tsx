
import React, { useState, useEffect } from 'react';
import { Database, Copy, FileCode, Server, Share2, Terminal, Activity, RefreshCw, Layers, Users, PhoneCall, Truck } from 'lucide-react';
import { prisma } from '../services/db';

const PrismaExplorer: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [stats, setStats] = useState({
    customers: 0,
    agents: 0,
    calls: 0,
    logistics: 0,
    inventory: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats({
        customers: prisma.customer.findMany().length,
        agents: prisma.agent.findMany().length,
        calls: prisma.callReport.findMany().length,
        logistics: prisma.logistics.findMany().length,
        inventory: prisma.inventory.findMany().length
      });
    };

    updateStats();
    window.addEventListener('db-update', updateStats);
    return () => window.removeEventListener('db-update', updateStats);
  }, []);

  const schema = `// This is your Prisma schema file,
// generated specifically for Swift Plastics Inc.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Wholesaler {
  id              String         @id @default(uuid())
  name            String
  type            CustomerType
  email           String         @unique
  location        String
  assignedAgent   SalesAgent     @relation(fields: [assignedAgentId], references: [id])
  assignedAgentId String
  status          String         @default("Active")
  inventory       Inventory[]
  calls           CallReport[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model SalesAgent {
  id                String            @id @default(uuid())
  name              String
  role              String
  performanceScore  Int               @default(0)
  customersAcquired Int               @default(0)
  routes            Wholesaler[]
  deliveries        LogisticsReport[]
  commissions       Commission[]
  calls             CallReport[]
}

model CallReport {
  id          String       @id @default(uuid())
  wholesaler  Wholesaler   @relation(fields: [customerId], references: [id])
  customerId  String
  agent       SalesAgent   @relation(fields: [agentId], references: [id])
  agentId     String
  date        DateTime     @default(now())
  duration    Int
  outcome     VisitOutcome
  notes       String?      @db.Text
}

model Inventory {
  id            String     @id @default(uuid())
  wholesaler    Wholesaler @relation(fields: [customerId], references: [id])
  customerId    String
  productName   String
  quantity      Int
  unit          String
  status        StockStatus
  lastRestocked DateTime
}

model LogisticsReport {
  id              String     @id @default(uuid())
  agent           SalesAgent @relation(fields: [agentId], references: [id])
  agentId         String
  vehicleId       String
  fuelUsage       Float
  distanceCovered Float
  date            DateTime
}

enum CustomerType {
  NEW
  EXISTING
  TARGETED
}

enum VisitOutcome {
  INTERESTED
  NOT_INTERESTED
  FOLLOW_UP
  ORDER_PLACED
}

enum StockStatus {
  IN_STOCK
  LOW_STOCK
  OUT_OF_STOCK
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schema);
    alert('Prisma Schema copied to clipboard!');
  };

  const handleMigration = () => {
    if (confirm("Execute Migration? This will reset all factory data to production defaults.")) {
      setIsResetting(true);
      localStorage.removeItem('polyflow_db');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Database size={240} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Database Connected: Swift-Plastics-Prod</span>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Prisma Schema Architect</h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Real-time link established between UI and Storage. 
            All factory modules interact via the Type-Safe Prisma Client simulation.
          </p>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-emerald-50 transition active:scale-95 shadow-lg"
            >
              <Copy size={18} />
              Export .prisma
            </button>
            <button 
              onClick={handleMigration}
              disabled={isResetting}
              className="flex items-center gap-2 px-6 py-3 bg-swift-red text-white rounded-xl font-bold hover:opacity-90 transition active:scale-95 shadow-lg disabled:opacity-50"
            >
              <RefreshCw size={18} className={isResetting ? 'animate-spin' : ''} />
              {isResetting ? 'Migrating...' : 'Run Migration (Reset)'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-[#1e1e1e] rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 bg-[#252526] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-blue-400" />
                <span className="text-sm font-mono text-slate-300">schema.prisma</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/20"></div>
              </div>
            </div>
            <div className="p-8 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                {schema.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-slate-600 w-6 text-right select-none">{i + 1}</span>
                    <span className="text-slate-300">
                      {line.includes('model') || line.includes('enum') || line.includes('generator') || line.includes('datasource') ? (
                        <span className="text-purple-400">{line}</span>
                      ) : line.includes('@') ? (
                        <span className="text-blue-400">{line}</span>
                      ) : line.includes('//') ? (
                        <span className="text-slate-500 italic">{line}</span>
                      ) : (
                        line
                      )}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-50 flex items-center justify-center -mr-4 -mt-4">
              <Server className="text-emerald-200" size={48} />
            </div>
            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
              <Activity size={18} className="text-emerald-500" />
              Live DB Stats
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-blue-500" />
                  <span className="text-xs font-bold text-slate-600">Wholesalers</span>
                </div>
                <span className="font-black text-slate-800">{stats.customers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <PhoneCall size={14} className="text-swift-red" />
                  <span className="text-xs font-bold text-slate-600">Call Reports</span>
                </div>
                <span className="font-black text-slate-800">{stats.calls}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600">Inventory</span>
                </div>
                <span className="font-black text-slate-800">{stats.inventory}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-slate-600">Logistics</span>
                </div>
                <span className="font-black text-slate-800">{stats.logistics}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Share2 size={18} className="text-swift-red" />
              Entity Relations
            </h4>
            <div className="space-y-2 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-swift-red"></div>
                SalesAgent <span className="font-bold text-slate-700">1:N</span> Wholesalers
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-swift-red"></div>
                Wholesaler <span className="font-bold text-slate-700">1:N</span> Inventory
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-swift-red"></div>
                Wholesaler <span className="font-bold text-slate-700">1:N</span> CallReports
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-2 text-sm flex items-center gap-1.5">
              <Terminal size={14} />
              Query Performance
            </h4>
            <p className="text-[10px] text-emerald-700 leading-relaxed uppercase font-bold tracking-tight">
              Optimization enabled: Indices on Wholesaler(email), Agent(id), CallReport(date).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismaExplorer;
