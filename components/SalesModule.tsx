
import React, { useState, useMemo } from 'react';
import { ReceiptText, Search, TrendingUp, DollarSign, Package, UserCircle, Calendar, Hash, ArrowUpRight, Filter, ChevronRight, X, Info, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Sale, Order, Partner, InventoryItem, Agent } from '../types';

interface SalesModuleProps {
  sales: Sale[];
  orders: Order[];
  partners: Partner[];
  inventory: InventoryItem[];
  agents: Agent[];
}

const SalesModule: React.FC<SalesModuleProps> = ({ sales, orders, partners, inventory, agents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewAuditId, setViewAuditId] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const partner = partners.find(p => p.id === s.partnerId)?.name.toLowerCase() || '';
      const agent = agents.find(a => a.id === s.agentId)?.name.toLowerCase() || '';
      const orderId = orders.find(o => o.id === s.orderId)?.internalId.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return partner.includes(search) || agent.includes(search) || orderId.includes(search);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm, partners, agents, orders]);

  const totalRevenue = useMemo(() => {
    return sales.reduce((acc, s) => acc + (s.quantity * s.unitPrice), 0);
  }, [sales]);

  const totalUnits = useMemo(() => {
    return sales.reduce((acc, s) => acc + s.quantity, 0);
  }, [sales]);

  const auditingSale = useMemo(() => {
    if (!viewAuditId) return null;
    const sale = sales.find(s => s.id === viewAuditId);
    if (!sale) return null;
    
    return {
      sale,
      partner: partners.find(p => p.id === sale.partnerId),
      agent: agents.find(a => a.id === sale.agentId),
      order: orders.find(o => o.id === sale.orderId),
      inventory: inventory.find(i => i.id === sale.inventoryItemId)
    };
  }, [viewAuditId, sales, partners, agents, orders, inventory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-swift-navy to-[#0F172A] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><ReceiptText size={240} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
             <DollarSign size={20} className="text-swift-red" />
             <span className="text-xs font-black uppercase tracking-[0.2em]">Revenue Assurance Ledger</span>
          </div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Sales History</h2>
          <div className="flex flex-wrap gap-10 mt-8">
            <div className="space-y-1">
              <p className="text-blue-200 text-xs font-black uppercase tracking-widest opacity-60">Total Gross Revenue</p>
              <p className="text-4xl font-black italic tabular-nums text-white">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-px h-16 bg-white/10" />
            <div className="space-y-1">
              <p className="text-blue-200 text-xs font-black uppercase tracking-widest opacity-60">Units Distributed</p>
              <p className="text-4xl font-black italic tabular-nums text-white">{totalUnits.toLocaleString()}</p>
            </div>
            <div className="w-px h-16 bg-white/10" />
            <div className="space-y-1">
              <p className="text-blue-200 text-xs font-black uppercase tracking-widest opacity-60">Transaction Volume</p>
              <p className="text-4xl font-black italic tabular-nums text-white">{sales.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Partner, Agent, or Order ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-swift-red outline-none transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition shadow-sm">
             <Filter size={16} /> Filter Results
           </button>
        </div>
      </div>

      {/* SALES LEDGER TABLE */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction / Date</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Entity & Officer</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Source</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Volume</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-10">
                      <ReceiptText size={80} />
                      <p className="font-black uppercase tracking-[0.4em] text-xs">No historical revenue events recorded</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.map((sale) => {
                const partner = partners.find(p => p.id === sale.partnerId);
                const agent = agents.find(a => a.id === sale.agentId);
                const order = orders.find(o => o.id === sale.orderId);
                const inventoryItem = inventory.find(i => i.id === sale.inventoryItemId);
                
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-10 py-8">
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="p-1.5 bg-red-50 text-swift-red rounded-lg"><Hash size={12}/></span>
                             <span className="font-mono text-xs font-black text-swift-navy">{order?.internalId || 'MISC-REV'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                             <Calendar size={10} />
                             {new Date(sale.date).toLocaleDateString()}
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-none mb-2">{partner?.name || 'Cash Partner'}</p>
                       <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <UserCircle size={10} className="text-swift-red" />
                          AO: {agent?.name || 'System Operator'}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Package size={20}/></div>
                          <div>
                             <p className="font-black text-slate-700 text-sm uppercase italic tracking-tight">{inventoryItem?.productName || 'General Stock'}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{inventoryItem?.productType || 'WAREHOUSE'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <p className="text-2xl font-black text-swift-navy italic tracking-tighter tabular-nums">{sale.quantity.toLocaleString()}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Units</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex flex-col items-end">
                          <p className="text-2xl font-black text-emerald-600 italic tracking-tighter tabular-nums">
                             ${(sale.quantity * sale.unitPrice).toLocaleString()}
                          </p>
                          <button 
                            onClick={() => setViewAuditId(sale.id)}
                            className="mt-2 flex items-center gap-1 text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-swift-red transition group-hover:text-slate-500"
                          >
                             Audit Trace <ChevronRight size={10} />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIT TRACE MODAL */}
      {viewAuditId && auditingSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[4rem] w-full max-w-4xl p-12 shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 right-0 p-12 opacity-5 -mr-16 -mt-16"><ShieldCheck size={300} /></div>
            <button onClick={() => setViewAuditId(null)} className="absolute top-8 right-8 text-slate-300 hover:text-swift-red transition z-20"><X size={32} /></button>
            
            <div className="relative z-10 mb-10">
              <div className="flex items-center gap-3 mb-4 bg-emerald-50 text-emerald-600 w-fit px-4 py-1.5 rounded-full border border-emerald-100">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Transaction Linkage</span>
              </div>
              <h3 className="text-4xl font-black text-swift-navy uppercase italic tracking-tighter">Sale Audit Ledger</h3>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <Hash size={12} /> Trace ID: {auditingSale.sale.id}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto relative z-10 space-y-8 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Industrial Entity Data</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-swift-navy font-black shadow-sm text-xl uppercase italic border border-slate-200">
                        {auditingSale.partner?.name[0] || 'P'}
                      </div>
                      <div>
                        <p className="font-black text-swift-navy uppercase italic tracking-tight text-lg leading-none">{auditingSale.partner?.name || 'External Account'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{auditingSale.partner?.businessCategory}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mt-4">
                      <MapPin size={14} className="text-swift-red" />
                      {auditingSale.partner?.location || 'Unspecified Territory'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Asset Source Authorization</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Product SKU</span>
                       <span className="font-black text-swift-navy uppercase italic tracking-tight">{auditingSale.inventory?.productName || 'Generic Distribution'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Pool Type</span>
                       <span className="text-[10px] font-black bg-white px-3 py-1 rounded-xl border border-slate-200 uppercase tracking-widest">{auditingSale.inventory?.productType || 'GLOBAL_STOCK'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Authorized Agent</span>
                       <span className="font-black text-swift-red uppercase italic tracking-tight">{auditingSale.agent?.name || 'Automation System'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-swift-navy p-10 rounded-[3rem] text-white">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Financial Settlement</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-200 uppercase tracking-widest">
                    <Clock size={14} /> {new Date(auditingSale.sale.date).toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Volume Released</p>
                    <p className="text-4xl font-black italic tracking-tighter tabular-nums">{auditingSale.sale.quantity.toLocaleString()} <span className="text-xs">Units</span></p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Unit Valuation</p>
                    <p className="text-4xl font-black italic tracking-tighter tabular-nums">${auditingSale.sale.unitPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-swift-red uppercase tracking-widest mb-1">Total Impact</p>
                    <p className="text-5xl font-black italic tracking-tighter tabular-nums text-swift-red">${(auditingSale.sale.quantity * auditingSale.sale.unitPrice).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {auditingSale.sale.notes && (
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Traceability Context</h4>
                  <p className="text-slate-600 font-medium leading-relaxed italic">"{auditingSale.sale.notes}"</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <ShieldCheck size={24} className="text-emerald-600" />
                <div>
                   <p className="text-xs font-black text-emerald-800 uppercase italic tracking-tight">System Integrity Verification Clear</p>
                   <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Linked Order Ref: {auditingSale.order?.internalId || 'DIRECT_SALE'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end relative z-10">
              <button 
                onClick={() => setViewAuditId(null)}
                className="px-10 py-5 bg-swift-navy text-white rounded-[1.8rem] font-black uppercase tracking-widest hover:bg-swift-red transition shadow-xl active:scale-95"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesModule;
