import React, { useState } from 'react';
/* Added Clock to the lucide-react imports to fix 'Cannot find name Clock' error */
import { Package, Search, AlertTriangle, CheckCircle, ArrowRight, History, Bell, X, AlertCircle, Trash2, Edit3, Save, Layers, Plus, Check, Building2, Clock } from 'lucide-react';
import { Customer, InventoryItem } from '../types';
import { prisma } from '../services/prisma';

interface ProductionModuleProps {
  customers: Customer[];
  inventory: InventoryItem[];
}

const ProductionModule: React.FC<ProductionModuleProps> = ({ customers, inventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(true);
  const [managingCustomer, setManagingCustomer] = useState<Customer | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    customerId: '',
    productName: '',
    quantity: 0,
    unit: 'rolls'
  });

  const handleRestock = (id: string) => {
    prisma.inventory.increment(id, 100);
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently remove this plastic production item from the catalog?')) {
      prisma.inventory.delete(id);
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditValue(item.quantity);
  };

  const saveEdit = (id: string) => {
    prisma.inventory.update(id, { quantity: editValue });
    setEditingItemId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.customerId || !newItem.productName) return;
    
    prisma.inventory.create({
      customerId: newItem.customerId,
      productName: newItem.productName,
      quantity: Number(newItem.quantity),
      unit: newItem.unit
    });
    
    setNewItem({ customerId: '', productName: '', quantity: 0, unit: 'rolls' });
    setShowAdd(false);
  };

  const groupedInventory = customers.map(customer => ({
    customer,
    items: inventory.filter(item => item.customerId === customer.id)
  })).filter(group => 
    group.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const urgentItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const totalStockCount = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = urgentItems.length;

  const managementItems = managingCustomer 
    ? inventory.filter(item => item.customerId === managingCustomer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Alert Banner for Low Raw Material or Final Goods */}
      {showNotifications && lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[2rem] p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-red-800">
              <div className="bg-red-100 p-2 rounded-xl">
                <AlertTriangle size={20} className="text-red-600 animate-pulse" />
              </div>
              <h3 className="font-black text-lg uppercase tracking-tight italic">Wholesale Stock Depletion Detected</h3>
            </div>
            <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-red-100 rounded-md text-red-400 transition">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentItems.map(item => (
              <div key={item.id} className="bg-white border border-red-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{customers.find(c => c.id === item.customerId)?.name}</p>
                  <p className="font-bold text-slate-800 truncate uppercase italic tracking-tighter">{item.productName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-black text-red-600 uppercase">{item.quantity} {item.unit} REMAINS</span>
                    <button onClick={() => handleRestock(item.id)} className="text-[10px] bg-red-600 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition">RE-SUPPLY</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group">
          <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-2xl mb-4 group-hover:scale-110 transition duration-300"><Layers size={24} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Global Inventory Volume</p>
          <p className="text-3xl font-black text-[#1A2B6D] tracking-tighter italic">{totalStockCount.toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase">Total Units</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mb-4 group-hover:scale-110 transition duration-300"><Package size={24} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Production Efficiency</p>
          <p className="text-3xl font-black text-[#1A2B6D] tracking-tighter italic">100% <span className="text-xs font-bold text-slate-400 uppercase">Load Capacity</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group">
          <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl mb-4 group-hover:scale-110 transition duration-300"><History size={24} /></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Active Batch Cycle</p>
          <p className="text-3xl font-black text-[#1A2B6D] tracking-tighter italic">Live <span className="text-xs font-bold text-slate-400 uppercase">Since 08:00</span></p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search plastic products or wholesalers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#E31E24] outline-none transition"
          />
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center justify-center gap-3 px-8 py-3 bg-[#1A2B6D] text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition shadow-xl"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
          {showAdd ? "Cancel" : "New Product Line"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#1A2B6D] p-10 rounded-[3rem] text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4 border-l-4 border-[#E31E24] pl-6">
            Register New Production Entity
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Target Wholesaler</label>
              <select 
                value={newItem.customerId}
                onChange={e => setNewItem({...newItem, customerId: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition font-bold"
                required
              >
                <option value="" className="text-black">Select Wholesaler...</option>
                {customers.map(c => <option key={c.id} value={c.id} className="text-black">{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Product Description</label>
              <input 
                type="text" 
                value={newItem.productName}
                onChange={e => setNewItem({...newItem, productName: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                placeholder="e.g. Extra Strength Packing Bags" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Initial Qty</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition font-bold"
                  required
                />
                <select 
                  value={newItem.unit}
                  onChange={e => setNewItem({...newItem, unit: e.target.value})}
                  className="bg-white/10 border border-white/10 rounded-xl px-3 py-3 outline-none focus:bg-white/20 transition font-bold"
                >
                  <option value="rolls" className="text-black">rolls</option>
                  <option value="Bags" className="text-black">Bags</option>
                  <option value="units" className="text-black">units</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-[#E31E24] text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition shadow-lg">
              <Check size={20} className="mx-auto" />
            </button>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {groupedInventory.map(({ customer, items }) => (
          <div key={customer.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
            <div className="bg-slate-50/50 p-6 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#1A2B6D] rounded-2xl flex items-center justify-center text-white font-black text-xl italic shadow-lg">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-[#1A2B6D] text-lg uppercase italic tracking-tighter">{customer.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{customer.location}</p>
                </div>
              </div>
              <button onClick={() => setManagingCustomer(customer)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E31E24] bg-white border border-red-100 px-5 py-2.5 rounded-2xl hover:bg-red-50 transition active:scale-95">
                Manage Node Stock
                <ArrowRight size={14} />
              </button>
            </div>
            
            {items.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plastic Product Line</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Stockpile</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supply Health</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition group">
                      <td className="px-8 py-6">
                        <span className="font-black text-[#1A2B6D] uppercase italic tracking-tighter text-sm">{item.productName}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-slate-800 tracking-tighter">{item.quantity}</span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleRestock(item.id)} className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#1A2B6D] hover:bg-[#E31E24] px-5 py-2.5 rounded-2xl transition-all duration-300 shadow-lg active:scale-95">
                          Restock +100
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center italic text-slate-400 font-bold uppercase tracking-widest text-xs">No production lines currently active for this route</div>
            )}
          </div>
        ))}
      </div>

      {/* Full Inventory/Logistics Manager Modal */}
      {managingCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-[#1A2B6D] uppercase tracking-tighter italic">Batch Management Panel</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Ref: {managingCustomer.name}</p>
              </div>
              <button onClick={() => setManagingCustomer(null)} className="p-3 text-slate-300 hover:text-[#E31E24] hover:bg-red-50 rounded-2xl transition-all"><X size={32} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              {managementItems.map((item) => (
                <div key={item.id} className="p-6 rounded-[2.5rem] border border-slate-200 flex items-center justify-between bg-white shadow-sm hover:shadow-xl transition duration-500 group">
                  <div className="flex-1">
                    <p className="font-black text-[#1A2B6D] text-xl uppercase italic tracking-tighter mb-1">{item.productName}</p>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-300" />
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Last Release Cycle: {new Date(item.lastRestocked).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-32 p-4 bg-slate-50 border border-blue-200 rounded-2xl text-center font-black text-xl outline-none focus:ring-2 focus:ring-[#1A2B6D]"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(item.id)} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition"><Save size={24} /></button>
                      </div>
                    ) : (
                      <>
                        <div className="text-right mr-4">
                          <p className="text-2xl font-black text-[#1A2B6D] tracking-tighter">{item.quantity} <span className="text-xs uppercase text-slate-400">{item.unit}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditing(item)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit3 size={20} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-3 text-slate-300 hover:text-[#E31E24] hover:bg-red-50 rounded-xl transition"><Trash2 size={20} /></button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {managementItems.length === 0 && (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <Building2 size={40} />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Active Production Lines found for this route</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionModule;