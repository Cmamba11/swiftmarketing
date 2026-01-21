
import React, { useState } from 'react';
import { Search, X, Trash2, Layers, Plus, Settings, Handshake, Factory, Weight } from 'lucide-react';
import { Partner, InventoryItem, Role } from '../types';
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
  const [newItem, setNewItem] = useState({
    partnerId: '', productName: '', productType: 'ROLLER' as 'ROLLER' | 'PACKING_BAG', quantity: 500, totalKg: 0
  });

  const canManage = permissions?.isSystemAdmin || permissions?.canManageInventory;

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

  const reserveItems = inventory.filter(i => i.partnerId === null);
  const partnerItems = inventory.filter(i => i.partnerId !== null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Factory Reserve Dashboard */}
        <div className="bg-[#1A2B6D] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition duration-1000"><Factory size={220} /></div>
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <Settings size={14} className="animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Factory Reserve</span>
             </div>
             <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-1">Global Stock</h3>
             <p className="text-blue-200 text-sm font-medium mb-6 italic">Common assets available for all Partners (Packing Bags).</p>
             <div className="space-y-4">
               {reserveItems.length > 0 ? reserveItems.map(item => (
                 <div key={item.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center backdrop-blur-sm">
                   <span className="font-black uppercase italic tracking-widest">{item.productName}</span>
                   <span className="text-3xl font-black">{item.quantity} <span className="text-xs text-blue-300">UNITS</span></span>
                 </div>
               )) : <p className="text-xs opacity-40 uppercase font-black">No Reserve Data</p>}
             </div>
           </div>
        </div>

        {/* Action Button Section */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-red-50 text-swift-red rounded-[2.5rem] flex items-center justify-center shadow-lg"><Layers size={48} /></div>
          <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Manufacturing Control</h4>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">Initiate new production lines for branded partner assets or factory reserve replenishments.</p>
          {canManage && (
            <button onClick={() => setShowAdd(!showAdd)} className="w-full py-5 bg-swift-navy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-swift-red transition-all shadow-xl">
               {showAdd ? <X size={20} className="mx-auto" /> : <Plus size={20} className="mx-auto" />}
               {showAdd ? "Cancel Run" : "Start New Production Run"}
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl animate-in slide-in-from-top-10 border border-white/5">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-6 border-l-[10px] border-swift-red pl-8">Production Configuration</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Product Type</label>
              <select value={newItem.productType} onChange={e => setNewItem({...newItem, productType: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold">
                <option value="ROLLER" className="text-black">Partner Asset (Branded Roller)</option>
                <option value="PACKING_BAG" className="text-black">Factory Reserve (Generic Bag)</option>
              </select>
            </div>
            {newItem.productType === 'ROLLER' && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Target Partner</label>
                <select value={newItem.partnerId} onChange={e => setNewItem({...newItem, partnerId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold">
                  <option value="" className="text-black">Select Branding...</option>
                  {partners.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Product SKU</label>
              <input type="text" value={newItem.productName} onChange={e => setNewItem({...newItem, productName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold" placeholder="E.g. 15kg Heavy Roller" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Batch Vol (Rolls)</label>
              <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold" required />
            </div>
            {newItem.productType === 'ROLLER' && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Total Weight (kg)</label>
                <input type="number" value={newItem.totalKg} onChange={e => setNewItem({...newItem, totalKg: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Total kg" />
              </div>
            )}
            <button type="submit" className="lg:col-span-5 py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition shadow-2xl mt-4">Execute Production Protocol</button>
          </form>
        </div>
      )}

      {/* Branded Asset Explorer */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-black text-swift-navy text-2xl uppercase italic tracking-tighter">Partner Specific Assets Registry</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ownership</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Asset SKU</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Batch Vol</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Weight (kg)</th>
                <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partnerItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-12 py-10 font-black uppercase italic tracking-tighter text-swift-navy">
                    {partners.find(p => p.id === item.partnerId)?.name || 'Unknown'}
                  </td>
                  <td className="px-12 py-10 font-bold text-slate-600">{item.productName}</td>
                  <td className="px-12 py-10 text-center font-black text-2xl text-slate-900">{item.quantity}</td>
                  <td className="px-12 py-10 text-center">
                    {item.totalKg ? (
                      <div className="flex items-center justify-center gap-2 text-swift-red font-black italic">
                        <Weight size={14} />
                        <span className="text-xl">{item.totalKg}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">N/A</span>
                    )}
                  </td>
                  <td className="px-12 py-10 text-right">
                    <button onClick={() => onDelete(item.id)} className="p-3 text-slate-300 hover:text-swift-red transition"><Trash2 size={24} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionModule;
