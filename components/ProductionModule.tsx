
import React, { useState } from 'react';
import { Package, Search, AlertTriangle, CheckCircle, ArrowRight, History, Bell, X, AlertCircle, Trash2, Edit3, Save, Layers } from 'lucide-react';
import { Customer, InventoryItem } from '../types';
import { prisma } from '../services/db';

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

  const handleRestock = (id: string) => {
    prisma.inventory.increment(id, 100); // Using prisma client
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently remove this plastic production item from the catalog?')) {
      prisma.inventory.delete(id); // Using prisma client
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditValue(item.quantity);
  };

  const saveEdit = (id: string) => {
    prisma.inventory.update(id, { quantity: editValue }); // Using prisma client
    setEditingItemId(null);
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle size={20} className="text-red-600 animate-pulse" />
              </div>
              <h3 className="font-bold text-lg">Wholesaler Stock Depletion</h3>
            </div>
            <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-red-100 rounded-md text-red-400 transition">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentItems.map(item => (
              <div key={item.id} className="bg-white border border-red-100 rounded-xl p-3 flex items-start gap-3 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{customers.find(c => c.id === item.customerId)?.name}</p>
                  <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-red-600">{item.quantity} {item.unit} left</span>
                    <button onClick={() => handleRestock(item.id)} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold">RE-SUPPLY</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-xl mb-4"><Layers size={24} /></div>
          <p className="text-slate-500 text-sm font-medium">Factory Inventory Volume</p>
          <p className="text-2xl font-bold text-slate-800">{totalStockCount} <span className="text-sm font-normal text-slate-400">Total Bales/Rolls</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-xl mb-4"><Package size={24} /></div>
          <p className="text-slate-500 text-sm font-medium">Production Output</p>
          <p className="text-2xl font-bold text-slate-800">100% <span className="text-sm font-normal text-slate-400">Capacity</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-xl mb-4"><History size={24} /></div>
          <p className="text-slate-500 text-sm font-medium">Last Batch Date</p>
          <p className="text-2xl font-bold text-slate-800">Today <span className="text-sm font-normal text-slate-400">08:00 AM</span></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search plastic products or wholesalers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
      </div>

      <div className="space-y-6">
        {groupedInventory.map(({ customer, items }) => (
          <div key={customer.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{customer.name} (Wholesale)</h4>
                  <p className="text-xs text-slate-500">{customer.location}</p>
                </div>
              </div>
              <button onClick={() => setManagingCustomer(customer)} className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-lg">
                Detailed Logistics
                <ArrowRight size={14} />
              </button>
            </div>
            
            {items.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plastic Product</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Stock</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supply Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-700">{item.productName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-800">{item.quantity}</span>
                          <span className="text-xs text-slate-400 font-medium">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                          item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleRestock(item.id)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition">Dispatch +100 Units</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center italic text-slate-400">No products assigned to this wholesale route.</div>
            )}
          </div>
        ))}
      </div>

      {/* Full Inventory/Logistics Manager Modal */}
      {managingCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Production Inventory: {managingCustomer.name}</h3>
              <button onClick={() => setManagingCustomer(null)} className="p-2 text-slate-400 hover:text-slate-600 transition"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {managementItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between bg-white shadow-sm">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-lg">{item.productName}</p>
                    <p className="text-xs text-slate-400">Last Batch Release: {item.lastRestocked}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-24 p-2 border border-blue-300 rounded-lg text-center font-bold"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(item.id)} className="p-2 bg-emerald-600 text-white rounded-lg"><Save size={18} /></button>
                      </div>
                    ) : (
                      <>
                        <div className="text-right mr-4">
                          <p className="text-xl font-bold text-slate-800">{item.quantity} {item.unit}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditing(item)} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionModule;
