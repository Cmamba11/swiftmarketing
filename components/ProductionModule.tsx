
import React, { useState, useMemo } from 'react';
import { Search, X, Trash2, Layers, Plus, Settings, Handshake, Factory, Weight, History, ArrowUp, ArrowDown, User, Clock, AlertCircle } from 'lucide-react';
import { Partner, InventoryItem, Role, InventoryLog } from '../types';
import { prisma } from '../services/prisma';

interface ProductionModuleProps {
  partners: Partner[];
  inventory: InventoryItem[];
  onDelete: (id: string) => void;
  permissions?: Role;
}

const ProductionModule: React.FC<ProductionModuleProps> = ({ partners, inventory, onDelete, permissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showAdjust, setShowAdjust] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    partnerId: '', productName: '', productType: 'ROLLER' as 'ROLLER' | 'PACKING_BAG', quantity: 500, totalKg: 0
  });

  const [adjustData, setAdjustData] = useState({ change: 0, notes: '', type: 'RESTOCK' as 'RESTOCK' | 'ADJUSTMENT' | 'REDUCTION' });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreateInventory;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeleteInventory;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.productType === 'ROLLER' && !newItem.partnerId) return;
    
    prisma.inventory.create({ 
      partnerId: newItem.productType === 'PACKING_BAG' ? null : newItem.partnerId,
      productName: newItem.productName,
      productType: newItem.productType,
      quantity: Number(newItem.quantity),
      totalKg: newItem.productType === 'ROLLER' ? Number(newItem.totalKg) : undefined,
      unit: newItem.productType === 'ROLLER' ? 'rolls' : 'bags'
    });
    setNewItem({ partnerId: '', productName: '', productType: 'ROLLER', quantity: 500, totalKg: 0 });
    setShowAdd(false);
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjust) return;
    try {
      const change = adjustData.type === 'REDUCTION' ? -Math.abs(adjustData.change) : Number(adjustData.change);
      prisma.inventory.adjust(showAdjust, change, adjustData.type, adjustData.notes);
      setShowAdjust(null);
      setAdjustData({ change: 0, notes: '', type: 'RESTOCK' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const reserveItems = inventory.filter(i => i.partnerId === null);
  const partnerItems = inventory.filter(i => i.partnerId !== null);

  const currentHistoryLogs = useMemo(() => {
    if (!showHistory) return [];
    return prisma.inventory.findLogs(showHistory);
  }, [showHistory]);

  const currentItemName = useMemo(() => {
    if (!showHistory && !showAdjust) return "";
    const id = showHistory || showAdjust;
    return inventory.find(i => i.id === id)?.productName || "";
  }, [showHistory, showAdjust, inventory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1A2B6D] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition duration-1000"><Factory size={220} /></div>
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <Settings size={14} className="animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Factory Reserve Status</span>
             </div>
             <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-1 leading-none">Global Stock</h3>
             <p className="text-blue-200 text-sm font-medium mb-10 italic">Common assets available for Partner fulfillment.</p>
             <div className="space-y-4">
               {reserveItems.length > 0 ? reserveItems.map(item => (
                 <div key={item.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center backdrop-blur-sm shadow-inner group/item">
                   <div className="flex flex-col">
                     <span className="font-black uppercase italic tracking-widest text-sm">{item.productName}</span>
                     <div className="flex gap-2 mt-1">
                        <button onClick={() => setShowHistory(item.id)} className="text-[9px] font-black uppercase text-blue-300 hover:text-white transition flex items-center gap-1"><History size={10}/> History</button>
                        <button onClick={() => setShowAdjust(item.id)} className="text-[9px] font-black uppercase text-blue-300 hover:text-white transition flex items-center gap-1"><Plus size={10}/> Adjust</button>
                     </div>
                   </div>
                   <span className="text-4xl font-black tabular-nums">{item.quantity.toLocaleString()} <span className="text-[10px] text-blue-300 uppercase tracking-widest">Units</span></span>
                 </div>
               )) : <p className="text-xs opacity-40 uppercase font-black tracking-[0.2em] text-center p-12 bg-white/5 rounded-3xl border border-dashed border-white/10">Stock exhausted or uninitialized</p>}
             </div>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 bg-red-50 text-swift-red rounded-[2.5rem] flex items-center justify-center shadow-xl group hover:scale-105 transition duration-500"><Layers size={48} /></div>
          <div>
            <h4 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">Manufacturing Control</h4>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">Initiate production runs for branded assets or global reserve replenishment.</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowAdd(!showAdd)} className="w-full py-6 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-swift-red transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">
               {showAdd ? <X size={24} /> : <Plus size={24} />}
               {showAdd ? "Terminate Prep" : "Forge Production Batch"}
            </button>
          )}
        </div>
      </div>

      {showAdd && canCreate && (
        <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl animate-in slide-in-from-top-10 border border-white/5">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-6 border-l-[10px] border-swift-red pl-8">Production Configuration Interface</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Product Line</label>
              <select value={newItem.productType} onChange={e => setNewItem({...newItem, productType: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-black text-sm tracking-tight focus:bg-white/10 transition">
                <option value="ROLLER" className="text-black">Partner Branded Asset (Rollers)</option>
                <option value="PACKING_BAG" className="text-black">Factory Reserve (Generic Bags)</option>
              </select>
            </div>
            {newItem.productType === 'ROLLER' && (
              <div className="space-y-2 lg:col-span-3 animate-in fade-in">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Target Branding Authority</label>
                <select value={newItem.partnerId} onChange={e => setNewItem({...newItem, partnerId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-black text-sm tracking-tight focus:bg-white/10 transition">
                  <option value="" className="text-black">Select Wholesaler...</option>
                  {partners.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Batch Label / SKU</label>
              <input type="text" value={newItem.productName} onChange={e => setNewItem({...newItem, productName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-black text-sm tracking-tight focus:bg-white/10 transition" placeholder="E.g. Heavy Duty Poly-Seal" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Output Vol</label>
              <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-black text-sm tracking-tight focus:bg-white/10 transition" required />
            </div>
            {newItem.productType === 'ROLLER' && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Target Mass (KG)</label>
                <input type="number" value={newItem.totalKg} onChange={e => setNewItem({...newItem, totalKg: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-black text-sm tracking-tight focus:bg-white/10 transition" placeholder="KG" />
              </div>
            )}
            <button type="submit" className="lg:col-span-5 py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition shadow-2xl mt-4 active:scale-[0.98]">Execute Industrial Run</button>
          </form>
        </div>
      )}

      {showAdjust && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-3xl overflow-hidden relative">
            <button onClick={() => setShowAdjust(null)} className="absolute top-8 right-8 text-slate-300 hover:text-swift-red transition"><X size={24} /></button>
            <h3 className="text-2xl font-black text-swift-navy uppercase italic mb-8 flex items-center gap-3">
              <Plus size={28} className="text-swift-red" />
              Adjust Stock: {currentItemName}
            </h3>
            <form onSubmit={handleAdjust} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Change Quantity</label>
                    <input type="number" value={adjustData.change} onChange={e => setAdjustData({...adjustData, change: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select value={adjustData.type} onChange={e => setAdjustData({...adjustData, type: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black">
                      <option value="RESTOCK">Restock Run</option>
                      <option value="ADJUSTMENT">Stock Adjustment</option>
                      <option value="REDUCTION">Loss / Damage</option>
                    </select>
                  </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note (Reason for Change)</label>
                 <textarea value={adjustData.notes} onChange={e => setAdjustData({...adjustData, notes: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium h-24 resize-none" placeholder="Explain the modification..."></textarea>
               </div>
               <button type="submit" className="w-full py-5 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-swift-red transition shadow-xl">Apply Modification</button>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl h-[80vh] flex flex-col shadow-3xl overflow-hidden relative">
            <button onClick={() => setShowHistory(null)} className="absolute top-8 right-8 text-slate-300 hover:text-swift-red transition"><X size={24} /></button>
            <div className="p-10 border-b border-slate-100 shrink-0">
               <h3 className="text-2xl font-black text-swift-navy uppercase italic flex items-center gap-3">
                 <History size={28} className="text-swift-red" />
                 Traceability Ledger: {currentItemName}
               </h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Historical stock movements & verified alterations</p>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6">
               {currentHistoryLogs.length > 0 ? currentHistoryLogs.map((log) => (
                 <div key={log.id} className="relative pl-8 border-l-2 border-slate-100 pb-2">
                   <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 bg-white shadow-sm ${
                      log.type === 'SALE' || log.type === 'REDUCTION' ? 'border-swift-red' : 'border-emerald-500'
                   }`} />
                   <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${
                         log.type === 'SALE' || log.type === 'REDUCTION' ? 'bg-red-50 text-swift-red border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>{log.type.replace('_', ' ')}</span>
                   </div>
                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-swift-navy font-black italic">
                          {log.change > 0 ? <ArrowUp size={14} className="text-emerald-500" /> : <ArrowDown size={14} className="text-swift-red" />}
                          <span className="text-lg">{log.change > 0 ? '+' : ''}{log.change.toLocaleString()} Units</span>
                        </div>
                        {log.notes && <p className="text-xs text-slate-500 font-medium">"{log.notes}"</p>}
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase mt-1">
                          <User size={10} /> Authorized by {log.userName}
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Final Bal</p>
                         <p className="text-xl font-black text-swift-navy tabular-nums">{log.finalQuantity.toLocaleString()}</p>
                      </div>
                   </div>
                 </div>
               )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20">
                  <AlertCircle size={48} className="mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">No records archived</p>
                </div>
               )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-black text-swift-navy text-2xl uppercase italic tracking-tighter">Branded Assets Ledger</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Authority</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Asset Model</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Batch Vol</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Net Mass</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partnerItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-12 py-10 font-black uppercase italic tracking-tighter text-swift-navy text-lg">
                    {partners.find(p => p.id === item.partnerId)?.name || 'Detached Entity'}
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-600 tracking-tight">{item.productName}</span>
                      <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition duration-300">
                        <button onClick={() => setShowHistory(item.id)} className="text-[9px] font-black uppercase text-slate-400 hover:text-swift-red transition flex items-center gap-1"><History size={10}/> History</button>
                        <button onClick={() => setShowAdjust(item.id)} className="text-[9px] font-black uppercase text-slate-400 hover:text-swift-navy transition flex items-center gap-1"><Plus size={10}/> Adjust</button>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-center font-black text-2xl text-slate-900 tabular-nums">{item.quantity}</td>
                  <td className="px-12 py-10 text-center">
                    {item.totalKg ? (
                      <div className="flex items-center justify-center gap-2 text-swift-red font-black italic">
                        <Weight size={14} />
                        <span className="text-xl">{item.totalKg} <span className="text-[10px] uppercase">kg</span></span>
                      </div>
                    ) : (
                      <span className="text-slate-200 font-bold uppercase tracking-widest text-[10px]">Unweighted</span>
                    )}
                  </td>
                  <td className="px-12 py-10 text-right">
                    <div className="flex justify-end gap-2">
                       {canDelete && (
                        <button onClick={() => onDelete(item.id)} className="p-3 text-slate-200 hover:text-swift-red transition active:scale-90">
                          <Trash2 size={24} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {partnerItems.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-sm">No partner assets currently deployed in field</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionModule;
