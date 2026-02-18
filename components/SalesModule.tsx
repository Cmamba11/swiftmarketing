
import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, DollarSign, Package, UserCircle, Calculator, 
  BadgeCheck, Shield, Send, RefreshCw, ShoppingCart, UserCheck
} from 'lucide-react';
import { Sale, Order, Partner, Agent, User as UserType, Role } from '../types';
import { api } from '../services/api';

interface SalesModuleProps {
  sales: Sale[];
  orders: Order[];
  partners: Partner[];
  agents: Agent[];
  currentUser: UserType;
  roles: Role[];
}

const SalesModule: React.FC<SalesModuleProps> = ({ sales, orders, partners, agents, currentUser, roles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'PENDING'>('LEDGER');
  const [settlingOrderId, setSettlingOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [settlementDraft, setSettlementDraft] = useState({
    totalKg: 0,
    volume: 0,
    notes: ''
  });

  const currentUserRole = roles.find(r => r.id === currentUser.roleId);
  const isAdmin = currentUserRole?.isSystemAdmin;
  const isAgentHead = isAdmin || currentUserRole?.canApproveAsAgentHead;
  const isAccountOfficer = isAdmin || currentUserRole?.canApproveAsAccountOfficer;

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const partner = partners.find(p => p.id === s.partnerId)?.name.toLowerCase() || '';
      const agent = agents.find(a => a.id === s.agentId)?.name.toLowerCase() || '';
      const orderId = orders.find(o => o.id === s.orderId)?.internalId.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return partner.includes(search) || agent.includes(search) || orderId.includes(search);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm, partners, agents, orders]);

  const pendingSettlements = useMemo(() => {
    return orders.filter(o => o.status === 'READY_FOR_DISPATCH');
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return sales.reduce((acc, s) => {
      return acc + (s.productType === 'ROLLER' ? (s.totalKg * s.unitPrice) : (s.volume * s.unitPrice));
    }, 0);
  }, [sales]);

  const settlingOrder = useMemo(() => {
    return orders.find(o => o.id === settlingOrderId);
  }, [settlingOrderId, orders]);

  const handleApproveSettlement = async (orderId: string, type: 'ADMIN' | 'AGENT_HEAD' | 'ACCOUNT_OFFICER') => {
    setIsProcessing(true);
    try {
      if (settlementDraft.totalKg > 0 || settlementDraft.volume > 0) {
        await api.orders.updateSettlementData(orderId, settlementDraft);
      }
      await api.orders.approveSettlement(orderId, type);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitSale = async (order: Order) => {
    if (!order.settlementAdminApproved || !order.settlementAgentHeadApproved || !order.settlementAccountOfficerApproved) {
      alert("Triple-Verification Required for final dispatch.");
      return;
    }

    setIsProcessing(true);
    try {
      const firstItem = order.items[0];
      await api.sales.create({
        orderId: order.id,
        agentId: currentUser.agentId || 'system',
        partnerId: order.partnerId || '',
        productName: firstItem?.productName || 'Order Settlement',
        productType: firstItem?.productType || 'ROLLER',
        totalKg: order.finalWeight || 0,
        volume: order.finalUnits || 0,
        unitPrice: firstItem?.ratePerKg || 0,
        notes: order.settlementNotes || '',
        date: new Date().toISOString()
      } as any);
      setSettlingOrderId(null);
      setSettlementDraft({ totalKg: 0, volume: 0, notes: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-swift-navy to-[#0F172A] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><ReceiptText size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
               <DollarSign size={20} className="text-swift-red" />
               <span className="text-xs font-black uppercase tracking-[0.2em]">Revenue Ledger</span>
            </div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">Market Income</h2>
            <p className="text-white text-4xl font-black tabular-nums italic">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-xl">
             <button onClick={() => setActiveTab('LEDGER')} className={`px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'LEDGER' ? 'bg-white text-swift-navy' : 'text-white/40'}`}>Ledger</button>
             <button onClick={() => setActiveTab('PENDING')} className={`px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all relative ${activeTab === 'PENDING' ? 'bg-swift-red text-white' : 'text-white/40'}`}>
               Pending
               {pendingSettlements.length > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-swift-red text-white rounded-full items-center justify-center text-[10px] font-black border border-white/20">{pendingSettlements.length}</span>}
             </button>
          </div>
        </div>
      </div>

      {activeTab === 'LEDGER' ? (
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden p-10">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                  <th className="py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Partner</th>
                  <th className="py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Volume/Specs</th>
                  <th className="py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-all">
                    <td className="py-8"><p className="font-black text-swift-navy italic uppercase">{sale.orderId.substring(0, 8)}</p></td>
                    <td className="py-8"><p className="font-black text-slate-900 uppercase italic">{partners.find(p => p.id === sale.partnerId)?.name || 'Direct Sale'}</p></td>
                    <td className="py-8 text-center font-black italic">{sale.volume} units / {sale.totalKg}kg</td>
                    <td className="py-8 text-right font-black text-emerald-600 italic text-xl">${(sale.productType === 'ROLLER' ? (sale.totalKg * sale.unitPrice) : (sale.volume * sale.unitPrice)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      ) : (
        <div className="space-y-6">
            {pendingSettlements.map(order => (
              <div key={order.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center"><Package size={28} /></div>
                    <div>
                       <h4 className="text-2xl font-black text-swift-navy uppercase italic">{partners.find(p => p.id === order.partnerId)?.name || order.guestCompanyName}</h4>
                       <span className="text-[10px] font-black text-slate-400 uppercase">Ref: {order.internalId}</span>
                    </div>
                 </div>
                 <button onClick={() => setSettlingOrderId(order.id)} className="px-10 py-5 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-lg">Verify & Commit</button>
              </div>
            ))}
        </div>
      )}

      {settlingOrderId && settlingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4rem] w-full max-w-3xl p-12 shadow-3xl animate-in zoom-in-95">
            <h3 className="text-3xl font-black uppercase italic text-swift-navy mb-8">Manifest Settlement</h3>
            <div className="grid grid-cols-2 gap-8 mb-10">
               <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight (KG)</label><input type="number" step="0.1" value={settlementDraft.totalKg} onChange={e => setSettlementDraft({ ...settlementDraft, totalKg: Number(e.target.value) })} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl" /></div>
               <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</label><input type="number" value={settlementDraft.volume} onChange={e => setSettlementDraft({ ...settlementDraft, volume: Number(e.target.value) })} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl" /></div>
            </div>
            <div className="flex gap-4 mb-10">
               <button onClick={() => handleApproveSettlement(settlingOrder.id, 'ADMIN')} disabled={settlingOrder.settlementAdminApproved} className={`flex-1 py-4 rounded-xl font-black uppercase text-[9px] border-2 transition ${settlingOrder.settlementAdminApproved ? 'bg-swift-navy text-white' : 'border-red-500 text-red-500 animate-pulse'}`}>ADM Sign</button>
               <button onClick={() => handleApproveSettlement(settlingOrder.id, 'AGENT_HEAD')} disabled={settlingOrder.settlementAgentHeadApproved} className={`flex-1 py-4 rounded-xl font-black uppercase text-[9px] border-2 transition ${settlingOrder.settlementAgentHeadApproved ? 'bg-swift-navy text-white' : 'border-blue-500 text-blue-500 animate-pulse'}`}>A.H Sign</button>
               <button onClick={() => handleApproveSettlement(settlingOrder.id, 'ACCOUNT_OFFICER')} disabled={settlingOrder.settlementAccountOfficerApproved} className={`flex-1 py-4 rounded-xl font-black uppercase text-[9px] border-2 transition ${settlingOrder.settlementAccountOfficerApproved ? 'bg-swift-navy text-white' : 'border-green-500 text-green-500 animate-pulse'}`}>A.O Sign</button>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setSettlingOrderId(null)} className="flex-1 py-6 bg-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
               <button onClick={() => handleCommitSale(settlingOrder)} disabled={!settlingOrder.settlementAdminApproved || !settlingOrder.settlementAgentHeadApproved || !settlingOrder.settlementAccountOfficerApproved} className="flex-[2] py-6 bg-swift-red text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl disabled:bg-slate-200 transition">Commit to Revenue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesModule;
