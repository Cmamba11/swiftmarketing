
import React, { useState, useMemo } from 'react';
import { ClipboardCheck, Hammer, Printer, Clock, CheckCircle2, AlertTriangle, Search, ArrowRight, Package, Hash, Calendar, FileText, User, ArrowUpCircle, Info, X, RefreshCw } from 'lucide-react';
import { WorkOrder, Order, Partner, Role } from '../types';
import { api } from '../services/api';

interface WorkOrderModuleProps {
  workOrders: WorkOrder[];
  orders: Order[];
  partners: Partner[];
  permissions?: Role;
}

const WorkOrderModule: React.FC<WorkOrderModuleProps> = ({ workOrders, orders, partners, permissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [printId, setPrintId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredWOs = useMemo(() => {
    return workOrders.filter(wo => {
      const order = orders.find(o => o.id === wo.orderId);
      const partner = order?.partnerId ? partners.find(p => p.id === order.partnerId)?.name : order?.guestCompanyName;
      const search = searchTerm.toLowerCase();
      return (
        wo.internalId.toLowerCase().includes(search) || 
        order?.internalId.toLowerCase().includes(search) ||
        partner?.toLowerCase().includes(search)
      );
    }).sort((a, b) => {
      const priorities = { CRITICAL: 0, HIGH: 1, NORMAL: 2 };
      return priorities[a.priority] - priorities[b.priority];
    });
  }, [workOrders, orders, partners, searchTerm]);

  const handleStatusUpdate = async (id: string, status: 'IN_PROD' | 'COMPLETED') => {
    setIsProcessing(true);
    await api.workOrders.updateStatus(id, status);
    setIsProcessing(false);
  };

  const handlePrint = (id: string) => {
    setPrintId(id);
    setTimeout(() => {
      window.print();
      setPrintId(null);
    }, 500);
  };

  const getPriorityColor = (p: string) => {
    if (p === 'CRITICAL') return 'bg-red-500 text-white';
    if (p === 'HIGH') return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      {isProcessing && <div className="fixed top-24 right-10 z-50 bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10"><RefreshCw className="animate-spin text-swift-navy" size={20} /> <span className="text-[10px] font-black uppercase tracking-widest">Syncing Shop Floor...</span></div>}
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 -mr-16"><Hammer size={240} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/5 backdrop-blur-xl">
            <ClipboardCheck size={20} className="text-swift-green" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Manufacturing Operations Center</span>
          </div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">Production Queue</h2>
          <p className="text-blue-200 text-lg font-medium opacity-80 max-w-xl">
            Authorize shop-floor runs and mark job completion. Completing a work order automatically generates inventory assets.
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-4">
        <Search className="ml-4 text-slate-400" size={24} />
        <input 
          type="text" 
          placeholder="Filter by Job ID, Order ID, or Partner..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-bold text-lg text-swift-navy placeholder:text-slate-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredWOs.length === 0 ? (
          <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-30">
             <ClipboardCheck size={64} className="mx-auto mb-4" />
             <p className="font-black uppercase tracking-[0.4em] text-xs">No active production tickets</p>
          </div>
        ) : filteredWOs.map((wo) => {
          const order = orders.find(o => o.id === wo.orderId);
          const partner = order?.partnerId ? partners.find(p => p.id === order.partnerId) : null;
          
          return (
            <div key={wo.id} className={`bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group relative ${wo.status === 'COMPLETED' ? 'opacity-80' : ''}`}>
               <div className={`absolute top-8 right-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${getPriorityColor(wo.priority)}`}>
                  {wo.priority} Priority
               </div>

               <div className="p-10 space-y-8">
                  <div className="flex items-center gap-5">
                     <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${
                       wo.status === 'COMPLETED' ? 'bg-emerald-500' : 
                       wo.status === 'IN_PROD' ? 'bg-orange-500 animate-pulse' : 'bg-slate-800'
                     }`}>
                        <Hammer size={28} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter leading-none mb-1">{wo.internalId}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Hash size={12} className="text-swift-red" /> Linked Order: {order?.internalId}
                        </p>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Manufacturing Target</p>
                     <p className="font-black text-swift-navy uppercase italic tracking-tight mb-4">
                        {partner?.name || order?.guestCompanyName || 'External Project'}
                     </p>
                     <div className="space-y-3">
                        {order?.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/50">
                             <div className="flex items-center gap-2">
                                <Package size={14} className="text-swift-red" />
                                <span className="text-xs font-bold text-slate-700">{item.productName}</span>
                             </div>
                             <span className="text-xs font-black text-swift-navy">{item.quantity} units {item.totalKg ? `/ ${item.totalKg}kg` : ''}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                     <div className="flex-1 min-w-[120px] bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          wo.status === 'COMPLETED' ? 'text-emerald-600' : 
                          wo.status === 'IN_PROD' ? 'text-orange-500' : 'text-slate-500'
                        }`}>{wo.status.replace('_', ' ')}</span>
                     </div>
                     {wo.startDate && (
                       <div className="flex-1 min-w-[120px] bg-slate-50 p-4 rounded-2xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Started</p>
                          <span className="text-[10px] font-bold text-slate-700">{new Date(wo.startDate).toLocaleDateString()}</span>
                       </div>
                     )}
                  </div>
               </div>

               <div className="bg-slate-50 p-6 flex gap-3 border-t border-slate-100">
                  <button 
                    onClick={() => handlePrint(wo.id)}
                    className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-swift-navy hover:border-swift-navy transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Printer size={16} /> Print Ticket
                  </button>
                  {wo.status === 'PENDING' && (
                    <button 
                      onClick={() => handleStatusUpdate(wo.id, 'IN_PROD')}
                      disabled={isProcessing}
                      className="flex-[2] py-4 bg-swift-navy text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <ArrowRight size={16} /> Start Production
                    </button>
                  )}
                  {wo.status === 'IN_PROD' && (
                    <button 
                      onClick={() => handleStatusUpdate(wo.id, 'COMPLETED')}
                      disabled={isProcessing}
                      className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Mark Completed
                    </button>
                  )}
                  {wo.status === 'COMPLETED' && (
                    <div className="flex-[2] py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                       <CheckCircle2 size={16} /> Order Fulfillable
                    </div>
                  )}
               </div>
            </div>
          );
        })}
      </div>

      {printId && (
        <div id="printable-work-order" className="fixed inset-0 bg-white z-[999] p-16 text-black print:block hidden font-mono">
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex justify-between items-start border-b-4 border-black pb-8">
                 <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">SWIFT PLASTICS</h1>
                    <p className="text-sm font-bold mt-2">INDUSTRIAL PRODUCTION MANIFEST • LOGISTICS V4</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black">{workOrders.find(w => w.id === printId)?.internalId}</p>
                    <p className="text-xs">GEN_STAMP: {new Date().toISOString()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <p className="bg-black text-white px-4 py-1 text-xs font-black w-fit uppercase">Target Recipient</p>
                    {(() => {
                      const wo = workOrders.find(w => w.id === printId);
                      const order = orders.find(o => o.id === wo?.orderId);
                      return (
                        <div className="space-y-1">
                           <p className="text-2xl font-black uppercase italic">{order?.partnerId ? partners.find(p => p.id === order.partnerId)?.name : order?.guestCompanyName}</p>
                           <p className="text-sm">ORDER_REF: {order?.internalId}</p>
                        </div>
                      );
                    })()}
                 </div>
                 <div className="space-y-4">
                    <p className="bg-black text-white px-4 py-1 text-xs font-black w-fit uppercase">Job Priority</p>
                    <p className="text-2xl font-black uppercase italic">{workOrders.find(w => w.id === printId)?.priority}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <p className="bg-black text-white px-4 py-1 text-xs font-black w-fit uppercase">Manufacturing Item Breakdown</p>
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b-2 border-black">
                          <th className="py-4 text-xs font-black">PRODUCT_SKU_LABEL</th>
                          <th className="py-4 text-xs font-black text-center">CATEGORY</th>
                          <th className="py-4 text-xs font-black text-center">QUANTITY</th>
                          <th className="py-4 text-xs font-black text-right">WEIGHT (KG)</th>
                       </tr>
                    </thead>
                    <tbody>
                       {(() => {
                          const wo = workOrders.find(w => w.id === printId);
                          const order = orders.find(o => o.id === wo?.orderId);
                          return order?.items.map((item, i) => (
                            <tr key={i} className="border-b border-slate-200">
                               <td className="py-6 text-lg font-bold uppercase">{item.productName}</td>
                               <td className="py-6 text-center text-sm">{item.productType}</td>
                               <td className="py-6 text-center text-xl font-black">{item.quantity}</td>
                               <td className="py-6 text-right text-xl font-black">{item.totalKg || '--'}</td>
                            </tr>
                          ));
                       })()}
                    </tbody>
                 </table>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-20">
                 <div className="border-t border-black pt-4">
                    <p className="text-[10px] font-black uppercase mb-8">Production Head</p>
                    <div className="h-0.5 bg-slate-100" />
                 </div>
                 <div className="border-t border-black pt-4">
                    <p className="text-[10px] font-black uppercase mb-8">Quality Assurance</p>
                    <div className="h-0.5 bg-slate-100" />
                 </div>
                 <div className="border-t border-black pt-4">
                    <p className="text-[10px] font-black uppercase mb-8">Dispatch Authorizer</p>
                    <div className="h-0.5 bg-slate-100" />
                 </div>
              </div>

              <div className="bg-slate-50 p-8 border-2 border-black border-dashed">
                 <p className="text-[10px] font-black uppercase mb-2">Internal Shop Notes</p>
                 <p className="text-sm italic">{workOrders.find(w => w.id === printId)?.notes}</p>
              </div>

              <p className="text-[10px] text-center opacity-30 uppercase font-black tracking-widest pt-12">
                 Swift Plastics OS • Automated Cloud Ledger • End of Manifest
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderModule;
