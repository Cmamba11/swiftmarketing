
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Briefcase, Target, TrendingUp, Handshake, ShoppingCart, 
  ArrowUpRight, Award, History, Weight, AlertCircle, 
  DollarSign, BarChart4, Repeat, Zap, ShieldCheck, UserCircle, ChevronDown 
} from 'lucide-react';
import { Agent, Partner, Order, Sale, CallReport, User } from '../types';

interface PortfolioViewProps {
  currentUser: User;
  agents: Agent[];
  partners: Partner[];
  orders: Order[];
  sales: Sale[];
  reports: CallReport[];
  isAdmin: boolean;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ currentUser, agents, partners, orders, sales, reports, isAdmin }) => {
  // Local state to handle admin switching between agents
  const [viewedAgentId, setViewedAgentId] = useState<string>('');

  // Effect to set initial agent to view
  useEffect(() => {
    if (currentUser.agentId) {
      setViewedAgentId(currentUser.agentId);
    } else if (agents.length > 0) {
      setViewedAgentId(agents[0].id);
    }
  }, [currentUser.agentId, agents]);

  // Find the currently selected agent
  const myAgent = useMemo(() => {
    return agents.find(a => a.id === viewedAgentId) || agents[0];
  }, [agents, viewedAgentId]);

  const myPartners = useMemo(() => {
    if (!myAgent) return [];
    return partners.filter(p => p.assignedAgentId === myAgent.id);
  }, [partners, myAgent]);

  const myOrders = useMemo(() => {
    if (myPartners.length === 0) return [];
    return orders.filter(o => myPartners.some(p => p.id === o.partnerId));
  }, [orders, myPartners]);

  const mySales = useMemo(() => {
    if (!myAgent) return [];
    return sales.filter(s => s.agentId === myAgent.id);
  }, [sales, myAgent]);

  const myReports = useMemo(() => {
    if (!myAgent) return [];
    return reports.filter(r => r.agentId === myAgent.id);
  }, [reports, myAgent]);

  if (!myAgent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300">
          <AlertCircle size={48} />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter">No Active Personnel</h3>
          <p className="text-slate-400 max-w-sm mt-2 font-medium">There are no sales agents currently registered in the system. Create an agent profile to see portfolio metrics.</p>
        </div>
      </div>
    );
  }

  // --- KPI CALCULATIONS ---
  
  // 1. Value and Volume
  const totalVolume = mySales.reduce((acc, s) => acc + s.quantity, 0);
  const totalValue = mySales.reduce((acc, s) => acc + (s.quantity * (s.unitPrice || 10)), 0);

  // 2. Active Customers Introduced
  const introductionCount = myPartners.length;

  // 3. Frequency of Repeat Orders
  const repeatFrequency = introductionCount > 0 
    ? (myOrders.length / introductionCount).toFixed(1) 
    : '0';

  // 4. Timeliness and Accuracy
  const dataIntegrity = ((myAgent.dataAccuracyScore + myAgent.timelinessScore) / 2).toFixed(1);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* GLOBAL AGENT SELECTOR (ADMIN ONLY) */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-swift-red rounded-2xl">
              <UserCircle size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Audit Control</p>
              <h3 className="text-xl font-black text-swift-navy uppercase italic tracking-tighter">Select Sales Force Personnel</h3>
            </div>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <select 
              value={viewedAgentId} 
              onChange={(e) => setViewedAgentId(e.target.value)}
              className="w-full p-4 pl-6 bg-swift-navy text-white rounded-2xl font-black uppercase italic tracking-tight outline-none border-4 border-slate-100 hover:border-swift-red transition-all cursor-pointer appearance-none"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id} className="bg-white text-swift-navy">{a.name} - {a.region}</option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-white pointer-events-none group-hover:animate-bounce" />
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-swift-navy to-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Briefcase size={240} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
             <Award size={20} className="text-swift-red" />
             <span className="text-xs font-black uppercase tracking-[0.2em]">Sales Force Performance Matrix</span>
          </div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-2">{myAgent.name}</h2>
          <div className="flex items-center gap-6">
            <p className="text-blue-100 text-lg font-medium opacity-80 uppercase tracking-widest">Employee ID: {myAgent.employeeId || 'N/A'}</p>
            <div className="h-1.5 w-1.5 rounded-full bg-swift-red" />
            <p className="text-blue-100 text-lg font-medium opacity-80 uppercase tracking-widest">{myAgent.region || 'National'} Territory</p>
          </div>
        </div>
      </div>

      {/* PRIMARY KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* KPI 1: Value & Volume */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-50 text-swift-red rounded-2xl group-hover:bg-swift-red group-hover:text-white transition-colors">
              <BarChart4 size={28} />
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales Generation</p>
          <p className="text-4xl font-black text-swift-navy italic tracking-tighter mb-2">${totalValue.toLocaleString()}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Weight size={12} /> {totalVolume.toLocaleString()} Units Total Volume
          </p>
        </div>

        {/* KPI 2: Introductions */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 text-swift-navy rounded-2xl group-hover:bg-swift-navy group-hover:text-white transition-colors">
              <Handshake size={28} />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Introductions</p>
          <p className="text-4xl font-black text-swift-navy italic tracking-tighter mb-2">{introductionCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase">Onboarded Industrial Entities</p>
        </div>

        {/* KPI 3: Repeat Frequency */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Repeat size={28} />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Frequency Rate</p>
          <p className="text-4xl font-black text-swift-navy italic tracking-tighter mb-2">{repeatFrequency}x</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase">Avg. Repeat Orders per Partner</p>
        </div>

        {/* KPI 4: Timeliness & Accuracy */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck size={28} />
            </div>
            {Number(dataIntegrity) > 90 ? <Zap size={18} className="text-amber-400 fill-amber-400" /> : null}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Integrity Index</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-swift-navy italic tracking-tighter">{dataIntegrity}%</p>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase">Timeliness & Accuracy Score</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm p-12">
          <h3 className="text-2xl font-black text-swift-navy uppercase italic mb-8 flex items-center gap-4 border-b border-slate-50 pb-6">
            <Handshake size={28} className="text-swift-red" />
            Managed High-Value Accounts ({myPartners.length})
          </h3>
          <div className="space-y-4">
            {myPartners.length > 0 ? myPartners.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:shadow-lg hover:bg-white transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-swift-navy font-black shadow-sm group-hover:bg-swift-navy group-hover:text-white transition-colors text-xl uppercase italic">{p.name[0]}</div>
                  <div>
                    <p className="font-black text-slate-900 uppercase italic tracking-tighter leading-none text-lg">{p.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-widest">{p.businessCategory}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-swift-navy italic tracking-tighter leading-none">{orders.filter(o => o.partnerId === p.id).length} Orders</p>
                  <button className="mt-2 p-2 bg-white rounded-xl text-slate-300 hover:text-swift-red transition shadow-sm"><ArrowUpRight size={18} /></button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No assigned partners found for this personnel</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm p-12">
          <h3 className="text-2xl font-black text-swift-navy uppercase italic mb-8 flex items-center gap-4 border-b border-slate-50 pb-6">
            <History size={28} className="text-swift-red" />
            Performance History
          </h3>
          <div className="space-y-8">
            {myReports.length > 0 ? myReports.slice(0, 4).map(report => (
              <div key={report.id} className="relative pl-10 border-l-2 border-slate-100 pb-2">
                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-white border-4 border-swift-navy shadow-sm" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  {new Date(report.date).toLocaleDateString()}
                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                  {new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:shadow-md transition">
                  <p className="font-black text-swift-navy text-base uppercase italic tracking-tighter leading-tight">Interaction with {partners.find(p => p.id === report.customerId)?.name || 'Unknown Partner'}</p>
                  <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed italic">"{report.notes}"</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No recent interaction data found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
