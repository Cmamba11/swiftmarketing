
import React, { useState } from 'react';
import { Search, X, Trash2, Layers, Plus, Settings } from 'lucide-react';
import { Customer, InventoryItem, Role } from '../types';
import { prisma } from '../services/prisma';

interface ProductionModuleProps {
  customers: Customer[];
  inventory: InventoryItem[];
  onDelete: (id: string) => void;
  permissions?: Role;
}

const ProductionModule: React.FC<ProductionModuleProps> = ({ customers, inventory, onDelete, permissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    customerId: '', productName: '', quantity: 100, unit: 'rolls'
  });

  const canManage = permissions?.isSystemAdmin || permissions?.canManageInventory;

  const handleRestock = (id: string) => {
    prisma.inventory.increment(id, 100);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.customerId || !newItem.productName) return;
    prisma.inventory.create({ 
      ...newItem, 
      quantity: Number(newItem.quantity)
    });
    setNewItem({ customerId: '', productName: '', quantity: 100, unit: 'rolls' });
    setShowAdd(false);
  };

  const groupedInventory = customers.map(customer => ({
    customer,
    items: inventory.filter(item => item.customerId === customer.id)
  })).filter(group => 
    group.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group">
          <div className="p-4 bg-blue-50 text-blue-600 w-fit rounded-2xl mb-5 group-hover:bg-blue-600 group-hover:text-white transition shadow-sm"><Layers size={32} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Stock Reservoir</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{inventory.reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase">Units</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group">
          <div className="p-4 bg-amber-50 text-amber-600 w-fit rounded-2xl mb-5 group-hover:bg-amber-600 group-hover:text-white transition shadow-sm"><Settings size={32} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Active Batches</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">{inventory.length} <span className="text-xs font-bold text-slate-400 uppercase">Lines</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.2rem] border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-[450px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search production line registry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-swift-red outline-none font-bold"
          />
        </div>
        {canManage && (
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-[1.2rem] font-black uppercase tracking-widest hover:bg-swift-red transition-all shadow-2xl"
          >
            {showAdd ? <X size={20} /> : <Plus size={20} />}
            {showAdd ? "Abort" : "Deploy Production Line"}
          </button>
        )}
      </div>

      {showAdd && canManage && (
        <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl animate-in slide-in-from-top-10 border border-white/5">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-6 border-l-[10px] border-swift-red pl-8">
            Factory Line Specification
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-end">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Assigned Wholesaler</label>
              <select 
                value={newItem.customerId}
                onChange={e => setNewItem({...newItem, customerId: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 outline-none font-black text-xl italic"
                required
              >
                <option value="" className="text-black">Select Channel...</option>
                {customers.map(c => <option key={c.id} value={c.id} className="text-black">{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">SKU Label</label>
              <input 
                type="text" value={newItem.productName}
                onChange={e => setNewItem({...newItem, productName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 outline-none font-black text-xl"
                placeholder="Product SKU" required
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Import Quantity</label>
              <input 
                type="number" value={newItem.quantity}
                onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 outline-none font-black text-xl"
                required
              />
            </div>
            <button type="submit" className="lg:col-span-3 py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-[0.4em] hover:bg-red-700 transition shadow-2xl">
              COMMIT PRODUCTION PARAMETERS
            </button>
          </form>
        </div>
      )}

      <div className="space-y-10">
        {groupedInventory.map(({ customer, items }) => (
          <div key={customer.id} className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-700">
            <div className="bg-slate-50/50 p-10 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl">{customer.name.charAt(0)}</div>
                <div>
                  <h4 className="font-black text-slate-900 text-2xl uppercase italic tracking-tighter leading-none">{customer.name}</h4>
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">{customer.location}</p>
                </div>
              </div>
            </div>
            
            {items.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Batch Vol</th>
                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Last Restock</th>
                    {canManage && <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-all duration-300 group">
                      <td className="px-12 py-10">
                        <span className="font-black uppercase italic tracking-tighter text-lg text-slate-900">{item.productName}</span>
                      </td>
                      <td className="px-12 py-10 text-center">
                        <span className="text-3xl font-black tracking-tighter text-slate-900">{item.quantity}</span>
                      </td>
                      <td className="px-12 py-10 text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">{new Date(item.lastRestocked).toLocaleDateString()}</span>
                      </td>
                      {canManage && (
                        <td className="px-12 py-10 text-right">
                          <div className="flex justify-end gap-4">
                            <button onClick={() => handleRestock(item.id)} className="text-[10px] font-black bg-slate-900 text-white px-8 py-4 rounded-[1.2rem] hover:bg-swift-red transition shadow-xl">RESTOCK</button>
                            <button onClick={() => onDelete(item.id)} className="p-4 text-slate-300 hover:text-swift-red transition"><Trash2 size={24} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-sm italic">Registry Offline</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionModule;
