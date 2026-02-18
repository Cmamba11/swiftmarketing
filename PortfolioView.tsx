
import React, { useMemo, useState, useEffect } from 'react';
import { Briefcase, Award, TrendingUp, Target, ShoppingCart, User, MapPin, PhoneCall, ReceiptText, BarChart3, Clock, DollarSign, Percent, ChevronRight, RefreshCw, ShieldCheck, UserCheck, Fingerprint, Handshake, BadgeDollarSign, Calculator, Link2, AlertCircle } from 'lucide-react';
import { Agent, Partner, Order, Sale, CallReport, User as UserType, InventoryItem } from '../types';
import { BUSINESS_LOGIC } from './constants';

interface PortfolioViewProps {
  currentUser: UserType;
  agents: Agent[];
  partners: Partner[];
  orders: Order[];
  sales: Sale[];
  reports: CallReport[];
  inventory: InventoryItem[];
  isAdmin: boolean;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ currentUser, agents, partners, orders, sales, reports, inventory, isAdmin }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(currentUser.agentId || '');

  useEffect(() => {
    if (currentUser.agentId) setSelectedAgentId(currentUser.agentId);
  }, [currentUser]);

  const activeAgent = useMemo(() => {
    const found = agents.find(a => a.id === selectedAgentId);
    if (found) return found;
    return isAdmin && agents.length > 0 ? agents[0] : null;
  }, [selectedAgentId, agents, isAdmin]);

  const myPartners = useMemo(() => {
    if (!activeAgent) return [];
    return partners.filter(p => p.assignedAgentId === activeAgent.id);
  }, [activeAgent, partners]);

  const mySalesData = useMemo(() => {
    if (!activeAgent || myPartners.length === 0) return [];
    
    const partnerIds = new Set(myPartners.map(p => p.id));
    const relevantSales = sales.filter(s => s.agentId === activeAgent.id || partnerIds.has(s.partnerId))
                               .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return relevantSales.map(sale => {
      const invItem = inventory.find(i => i.id === sale.inventoryItemId);
      const partner = partners.find(p => p.id === sale.partnerId);
      
      const revenueValue = invItem?.productType === 'ROLLER' 
        ? (sale.totalKg * sale.unitPrice)
        : (sale.volume * sale.unitPrice);
      
      // FINE-TUNED MATH: Using constants from Logic Core
      const commissionableBase = revenueValue * BUSINESS_LOGIC.COMMISSION_REVENUE_BASE;
      const commissionRate = (activeAgent.commissionRate || BUSINESS_LOGIC.DEFAULT_AGENT_COMMISSION_RATE) / 100;
      const commissionValue = Number((commissionableBase * commissionRate).toFixed(2));

      return {
        ...sale,
        revenueValue,
        commissionValue,
        partnerName: partner?.name || 'Linked Partner',
        productName: invItem?.productName || 'Industrial Asset'
      };
    });
  }, [activeAgent, myPartners, sales, inventory, partners]);

  const { totalRevenue, totalCommission } = useMemo(() => {
    return mySalesData.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + curr.revenueValue,
      totalCommission: acc.totalCommission + curr.commissionValue
    }), { totalRevenue: 0, totalCommission: 0 });
  }, [mySalesData]);

  const myCalls = useMemo(() => {
    if (!activeAgent) return [];
    return reports.filter(r => r.agentId === activeAgent.id);
  }, [activeAgent, reports]);

  if (!activeAgent) {
    return (
      <div className="h-full flex items-center justify-center p-20 text-center flex-col gap-6 animate-in fade-in duration-700">
        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 shadow-inner">
           <Link2 size={60} className="animate-pulse" />
        </div>
        <div>
           <h3 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter">Personnel Linkage Missing</h3>
           <p className="text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 max-w-sm mx-auto leading-relaxed">
             Your login identity is not yet linked to a Sales Force Profile.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-gradient-to-br from-swift-navy to-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Briefcase size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
               <Handshake size={20} className="text-swift-green" />
               <span className="text-xs font-black uppercase tracking-[0.2em]">Personnel Portfolio V{BUSINESS_LOGIC.SYSTEM_VERSION}</span>
            </div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-2 leading-none">{activeAgent.name}</h2>
            <div className="flex items-center gap-6">
              <p className="text-blue-100 text-lg font-medium opacity-80 uppercase tracking-widest flex items-center gap-2">
                <Fingerprint size={18} /> {activeAgent.employeeId}
              </p>
              <div className="h-1.5 w-1.5 rounded-full bg-swift-green" />
              <p className="text-blue-100 text-lg font-medium opacity-80 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={18} /> {activeAgent.region}
              </p>
            </div>
          </div>
          
          {isAdmin && (
             <div className="bg-white/5 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-2">
                <p className="text-[10px] font-black text-swift-green uppercase tracking-widest ml-4 flex items-center gap-2">
                   <UserCheck size={12} /> Personnel Audit Switch
                </p>
                <select 
                  className="bg-transparent border-none outline-none text-white font-black uppercase italic text-sm p-2 w-64 cursor-pointer"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                   {agents.map(a => <option key={a.id} value={a.id} className="bg-slate-800 text-white">{a.name} ({a.employeeId})</option>)}
                </select>
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue Attribution', value: `${BUSINESS_LOGIC.CURRENCY_SYMBOL}${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-swift-navy', bg: 'bg-slate-100' },
          { label: `Net Payout Potential`, value: `${BUSINESS_LOGIC.CURRENCY_SYMBOL}${totalCommission.toLocaleString()}`, icon: BadgeDollarSign, color: 'text-swift-green', bg: 'bg-emerald-50' },
          { label: 'Market Accounts', value: myPartners.length, icon: Handshake, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Field Interaction Index', value: myCalls.length, icon: PhoneCall, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition duration-1000"><stat.icon size={100} /></div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-4 shadow-sm`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 italic tracking-tighter relative z-10 tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-start gap-4">
         <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Calculator size={20}/></div>
         <div>
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Fine-Tuned Policy Core</h4>
            <p className="text-blue-900/70 text-xs font-medium leading-relaxed">
              Calculated at <span className="font-black">{(BUSINESS_LOGIC.COMMISSION_REVENUE_BASE * 100).toFixed(0)}% Revenue Base</span> with an individual rate of <span className="text-swift-navy font-black">{activeAgent.commissionRate}%</span>.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <h3 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter mb-8 flex items-center gap-4 relative z-10">
            <ShoppingCart size={24} className="text-swift-green" />
            Revenue Event Trace
          </h3>
          <div className="space-y-4 relative z-10">
            {mySalesData.length > 0 ? mySalesData.slice(0, 10).map(sale => (
              <div key={sale.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group/item hover:bg-white hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-swift-navy font-black shadow-sm group-hover/item:bg-swift-navy group-hover/item:text-white transition">
                     <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 uppercase italic tracking-tight">{sale.partnerName}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                       <Clock size={10} /> {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-swift-navy tracking-tighter text-xl italic tabular-nums">{BUSINESS_LOGIC.CURRENCY_SYMBOL}{sale.revenueValue.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Comm: +{BUSINESS_LOGIC.CURRENCY_SYMBOL}{sale.commissionValue.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-24 opacity-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <RefreshCw size={48} className="animate-spin duration-[10s]" />
                <p className="text-xs font-black uppercase tracking-[0.3em] mt-4">Awaiting Market Movement</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <h3 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter mb-8 flex items-center gap-4 relative z-10">
            <MapPin size={24} className="text-swift-navy" />
            Strategic Accounts
          </h3>
          <div className="grid grid-cols-1 gap-4 relative z-10">
            {myPartners.map(p => (
              <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group/p hover:bg-white hover:shadow-xl transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-swift-navy text-xl uppercase italic shadow-sm border border-slate-200 group-hover/p:bg-swift-navy group-hover/p:text-white transition">
                     {p.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 uppercase italic tracking-tight text-lg">{p.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.location}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Revenue</p>
                   <p className="font-black text-swift-navy italic tabular-nums">
                     {BUSINESS_LOGIC.CURRENCY_SYMBOL}{mySalesData.filter(s => s.partnerId === p.id).reduce((sum, s) => sum + s.revenueValue, 0).toLocaleString()}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
