
import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, Search, TrendingUp, DollarSign, Package, UserCircle, Calendar, Hash, ArrowUpRight, 
  Filter, ChevronRight, X, Info, ShieldCheck, Clock, MapPin, Layers, Weight, Sparkles, 
  AlertCircle, FileText, Percent, ShoppingCart, Fingerprint, BadgeCheck, User, Building2
} from 'lucide-react';
import { Sale, Order, Partner, InventoryItem, Agent, User as UserType } from '../types';

interface SalesModuleProps {
  sales: Sale[];
  orders: Order[];
  partners: Partner[];
  inventory: InventoryItem[];
  agents: Agent[];
  currentUser: UserType;
}

const SalesModule: React.FC<SalesModuleProps> = ({ sales, orders, partners, inventory, agents, currentUser }) => {
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
    return sales.reduce((acc, s) => {
      const inv = inventory.find(i => i.id === s.inventoryItemId);
      if (inv?.productType === 'ROLLER') {
        return acc + (s.totalKg * s.unitPrice);
      }
      return acc + (s.volume * s.unitPrice);
    }, 0);
  }, [sales, inventory]);

  const totalUnits = useMemo(() => {
    return sales.reduce((acc, s) => acc + s.volume, 0);
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
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Volume / Weight</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settlement</th>
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
                
                const settlementValue = inventoryItem?.productType === 'ROLLER' 
                  ? (sale.totalKg * sale.unitPrice)
                  : (sale.volume * sale.unitPrice);

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
                       <p className="text-lg font-black text-swift-navy italic tracking-tighter tabular-nums">{sale.volume.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase">Vol</span></p>
                       <p className="text-sm font-black text-swift-red italic tracking-tighter tabular-nums">{sale.totalKg.toLocaleString()}kg <span className="text-[9px] font-bold text-slate-400 uppercase">Weight</span></p>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex flex-col items-end">
                          <p className="text-2xl font-black text-emerald-600 italic tracking-tighter tabular-nums">
                             ${settlementValue.toLocaleString()}
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

      {/* AUDIT TRACE MODAL (REDESIGNED AS INDUSTRIAL RECEIPT) */}
      {viewAuditId && auditingSale && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in">
          <div className="bg-white rounded-[4rem] w-full max-w-4xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* INVOICE HEADER */}
            <div className="bg-swift-navy p-10 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 -mr-10"><ReceiptText size={180} /></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-swift-green rounded-xl shadow-lg shadow-swift-green/20"><BadgeCheck size={24}/></div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">Industrial Dispatch Receipt</h3>
                   </div>
                   <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                      <span className="flex items-center gap-1.5"><Hash size={12}/> SALE REF: {auditingSale.sale.id.toUpperCase()}</span>
                      <span className="opacity-30">|</span>
                      <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(auditingSale.sale.date).toLocaleString()}</span>
                   </div>
                </div>
                <button onClick={() => setViewAuditId(null)} className="p-3 bg-white/10 hover:bg-swift-red rounded-2xl transition-all border border-white/10 hover:border-swift-red"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12">
               
               {/* ENTITY DETAILS */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Building2 size={14} className="text-swift-navy" /> Partner Information
                    </p>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <h4 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter leading-none mb-2">{auditingSale.partner?.name || 'CASH ACCOUNT'}</h4>
                       <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12} className="text-swift-red"/> {auditingSale.partner?.location || 'INTERNAL'}</p>
                       <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-wrap gap-4">
                          <div className="text-[9px] font-black text-slate-400 uppercase">Cat: {auditingSale.partner?.businessCategory || 'GENERAL'}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase">Contact: {auditingSale.partner?.contactPerson || 'N/A'}</div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <ShoppingCart size={14} className="text-swift-navy" /> Order Context
                    </p>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between h-full">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Order Reference</p>
                          <p className="font-mono text-xl font-black text-swift-navy tracking-widest">{auditingSale.order?.internalId || 'NON-COMMITTED'}</p>
                       </div>
                       <div className="mt-4 pt-4 border-t border-slate-200/50">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Total Order Revenue</p>
                             <p className="text-xl font-black text-swift-navy italic tabular-nums">${auditingSale.order?.totalValue.toLocaleString() || '0.00'}</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               {/* FINANCIAL SETTLEMENT TABLE */}
               <div className="space-y-6">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Layers size={14} className="text-swift-navy" /> Dispatch Settlement Breakdown
                  </p>
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset Category</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Weight (KG)</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Unit/KG Rate</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Settlement Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           <tr>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-swift-navy"><Package size={16}/></div>
                                    <div>
                                       <p className="text-sm font-black text-swift-navy uppercase italic tracking-tight">{auditingSale.inventory?.productName || 'GENERAL INVENTORY'}</p>
                                       <p className="text-[8px] font-black text-slate-400 uppercase">{auditingSale.inventory?.productType} &bull; {auditingSale.sale.volume} units</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="flex flex-col items-center">
                                    <p className="text-lg font-black text-swift-red italic tabular-nums">{auditingSale.sale.totalKg.toLocaleString()}kg</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Industrial Weight</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="flex flex-col items-center">
                                    <p className="text-lg font-black text-slate-700 italic tabular-nums">${auditingSale.sale.unitPrice.toLocaleString()}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Agreed Rate</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 {(() => {
                                    const settlement = auditingSale.inventory?.productType === 'ROLLER' 
                                       ? (auditingSale.sale.totalKg * auditingSale.sale.unitPrice)
                                       : (auditingSale.sale.volume * auditingSale.sale.unitPrice);
                                    return <p className="text-2xl font-black text-swift-navy italic tabular-nums">${settlement.toLocaleString()}</p>;
                                 })()}
                              </td>
                           </tr>
                        </tbody>
                        <tfoot>
                           <tr className="bg-slate-50/50">
                              <td colSpan={3} className="px-8 py-6 text-right">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Dispatch Settlement Value</p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 {(() => {
                                    const settlement = auditingSale.inventory?.productType === 'ROLLER' 
                                       ? (auditingSale.sale.totalKg * auditingSale.sale.unitPrice)
                                       : (auditingSale.sale.volume * auditingSale.sale.unitPrice);
                                    return <p className="text-4xl font-black text-swift-green italic tracking-tighter tabular-nums">${settlement.toLocaleString()}</p>;
                                 })()}
                              </td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               </div>

               {/* VERIFICATION & OPERATOR SECTION */}
               <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={120}/></div>
                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authorized Dispatch Officer</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-swift-red shadow-sm border border-slate-200"><User size={20}/></div>
                        <div>
                           <p className="font-black text-swift-navy uppercase italic tracking-tight">{auditingSale.agent?.name || 'SYSTEM ADMIN'}</p>
                           <p className="text-[8px] font-black text-slate-400 uppercase">Badge: {auditingSale.agent?.employeeId || 'SYS-01'}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Audit Authorizer (Session)</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-swift-navy rounded-2xl flex items-center justify-center text-white shadow-lg"><Fingerprint size={20}/></div>
                        <div>
                           <p className="font-black text-swift-navy uppercase italic tracking-tight">{currentUser.name}</p>
                           <p className="text-[8px] font-black text-swift-green uppercase tracking-widest flex items-center gap-1">
                              <BadgeCheck size={10}/> Authenticated Personnel
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {auditingSale.sale.notes && (
                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                     <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Internal Logistics Log</h5>
                     <p className="text-amber-800 font-medium italic leading-relaxed">"{auditingSale.sale.notes}"</p>
                  </div>
               )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-10 border-t border-slate-100 flex justify-between items-center bg-white shrink-0">
               <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">
                     Print Document
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">
                     Export to Ledger
                  </button>
               </div>
               <button 
                  onClick={() => setViewAuditId(null)}
                  className="px-10 py-4 bg-swift-navy text-white rounded-[1.8rem] font-black uppercase tracking-widest hover:bg-swift-red transition-all shadow-2xl active:scale-95"
               >
                  Close Receipt View
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesModule;
