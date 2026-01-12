
import React from 'react';
import { Database, Copy, FileCode, Server, Share2, Terminal } from 'lucide-react';

const PrismaExplorer: React.FC = () => {
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Database size={240} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            <Terminal size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Prisma ORM Engine</span>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Schema Architect</h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Standardize your manufacturing data layer. Below is the relational schema 
            used to power the Swift Plastics OS, optimized for PostgreSQL deployment.
          </p>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-emerald-50 transition active:scale-95 shadow-lg"
            >
              <Copy size={18} />
              Export .prisma
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition backdrop-blur-md">
              <Server size={18} />
              Database Sync
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Share2 size={18} className="text-swift-red" />
              Entity Relations
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SalesAgent 1:N</p>
                <p className="text-sm font-bold text-swift-navy">Wholesalers</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wholesaler 1:N</p>
                <p className="text-sm font-bold text-swift-navy">InventoryItems</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SalesAgent 1:N</p>
                <p className="text-sm font-bold text-swift-navy">CallReports</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-2">Performance Tip</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Indices have been automatically added to <code className="bg-white/50 px-1 rounded">wholesaler.email</code> and <code className="bg-white/50 px-1 rounded">agent.id</code> for rapid query execution during peak factory dispatch hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismaExplorer;
