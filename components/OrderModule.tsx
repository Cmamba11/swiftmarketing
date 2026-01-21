
import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, X, Package, Handshake, History, Weight, Trash2, ListPlus } from 'lucide-react';
import { Order, Partner, InventoryItem, OrderItem } from '../types';
import { prisma } from '../services/prisma';

interface OrderModuleProps {
  orders: Order[];
  partners: Partner[];
  inventory: InventoryItem[];
}

const OrderModule: React.FC<OrderModuleProps> = ({ orders, partners, inventory }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [pendingItems, setPendingItems] = useState<Omit<OrderItem, 'id'>[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productType: 'ROLLER' as 'ROLLER' | 'PACKING_BAG',
    quantity: 100,
    totalKg: 0,
    productName: ''
  });

  const handleAddItem = () => {
    const name = currentItem.productType === 'ROLLER' 
      ? (currentItem.productName || 'Custom Roller Batch') 
      : 'Reserve Packing Bags';
      
    setPendingItems([...pendingItems, { ...currentItem, productName: name }]);
    setCurrentItem({
      productType: 'ROLLER',
      quantity: 100,
      totalKg: 0,
      productName: ''
    });
  };

  const handleRemoveItem = (index: number) => {
    setPendingItems(pendingItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || pendingItems.length === 0) return;

    prisma.order.create({
      partnerId,
      items: pendingItems.map(item => ({ ...item, id: Math.random().toString(36).substring(7) })),
      totalValue: Number(totalValue),
      orderDate: new Date().toISOString()
    });

    setShowAdd(false);
    setPartnerId('');
    setPendingItems([]);
    setTotalValue(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-swift-navy rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><ShoppingCart size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
             <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                <History size={16} className="text-swift-red" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Transaction Registry</span>
             </div>
             <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Order Hub</h2>
             <p className="text-blue-100 text-lg leading-relaxed">Execute simultaneous product deployments. Fulfillment automatically adjusts Partner Rollers (Quantity + KG) and Factory Reserve Packing Bags.</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="px-12 py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-4">
            {showAdd ? <X size={24} /> : <Plus size={24} />}
            {showAdd ? "Abort Log" : "Import Combined Order"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-100 pb-6 mb-10 gap-6">
            <h3 className="text-2xl font-black text-swift-navy uppercase italic flex items-center gap-4">
              <ListPlus size={28} className="text-swift-red" />
              Mixed-Asset Import Protocol
            </h3>
            <div className="w-full md:w-64">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contracting Partner</label>
              <select value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" required>
                <option value="">Select Partner...</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-2">Line Item Entry</h4>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Category</label>
                <select value={currentItem.productType} onChange={e => setCurrentItem({...currentItem, productType: e.target.value as any})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold">
                  <option value="ROLLER">Branded Partner Roller</option>
                  <option value="PACKING_BAG">Factory Reserve Bags</option>
                </select>
              </div>

              {currentItem.productType === 'ROLLER' && (
                <div className="space-y-2 animate-in fade-in">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specific SKU/Branding</label>
                   <input type="text" value={currentItem.productName} onChange={e => setCurrentItem({...currentItem, productName: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold" placeholder="E.g. Logo V2" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume</label>
                  <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold" required />
                </div>
                {currentItem.productType === 'ROLLER' && (
                  <div className="space-y-2 animate-in fade-in">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Weight (kg)</label>
                    <input type="number" value={currentItem.totalKg} onChange={e => setCurrentItem({...currentItem, totalKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold" />
                  </div>
                )}
              </div>

              <button onClick={handleAddItem} className="w-full py-4 bg-swift-red text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-navy transition shadow-lg">
                Add to Manifest
              </button>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="min-h-[300px] border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8">
                {pendingItems.length > 0 ? (
                  <div className="space-y-4">
                    {pendingItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl shadow-sm animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.productType === 'ROLLER' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                            <Package size={24} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic tracking-tighter">{item.productName}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.productType.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-lg font-black text-swift-navy">{item.quantity} <span className="text-[8px] uppercase">Units</span></p>
                             {item.totalKg ? <p className="text-[10px] font-black text-swift-red italic flex items-center justify-end gap-1"><Weight size={12} /> {item.totalKg}kg</p> : null}
                          </div>
                          <button onClick={() => handleRemoveItem(idx)} className="text-slate-300 hover:text-swift-red transition"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                    <History size={48} className="opacity-20" />
                    <p className="font-black uppercase tracking-[0.2em] italic text-sm">No items in current manifest</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-end gap-8 pt-6 border-t border-slate-100">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Combined Order Value ($)</label>
                  <input type="number" value={totalValue} onChange={e => setTotalValue(Number(e.target.value))} className="w-full p-5 bg-slate-900 text-white rounded-2xl font-black text-2xl tracking-tighter outline-none focus:ring-4 focus:ring-swift-red/20" required />
                </div>
                <button 
                  onClick={handleSubmitOrder}
                  disabled={pendingItems.length === 0 || !partnerId}
                  className="w-full md:w-auto px-16 py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-[0.3em] hover:bg-swift-navy transition-all shadow-2xl disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Confirm & Commit Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
           <h4 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter">Transaction Ledger</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-white">
                <tr>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Partner / Date</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mixed Contents</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Net Qty</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Net Weight</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {orders.map(order => {
                  const totalOrderQty = order.items.reduce((acc, i) => acc + i.quantity, 0);
                  const totalOrderKg = order.items.reduce((acc, i) => acc + (i.totalKg || 0), 0);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-all group">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-2xl ${order.status === 'FULFILLED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><ShoppingCart size={20} /></div>
                             <div>
                                <p className="font-black text-slate-900 uppercase italic tracking-tighter">{partners.find(p => p.id === order.partnerId)?.name || 'Unknown'}</p>
                                <p className="text-[10px] font-bold text-slate-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, idx) => (
                              <span key={idx} className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${item.productType === 'ROLLER' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {item.productType === 'ROLLER' ? 'Rollers' : 'Bags'}
                              </span>
                            ))}
                          </div>
                       </td>
                       <td className="px-10 py-8 text-center font-black text-slate-900">
                          {totalOrderQty.toLocaleString()}
                       </td>
                       <td className="px-10 py-8 text-center">
                          {totalOrderKg > 0 ? (
                            <div className="flex items-center justify-center gap-1.5 text-swift-red font-black italic">
                              <Weight size={14} />
                              <span className="text-lg">{totalOrderKg.toLocaleString()}kg</span>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                       </td>
                       <td className="px-10 py-8 text-right font-black text-2xl text-swift-navy tracking-tighter">${order.totalValue.toLocaleString()}</td>
                    </tr>
                  );
                })}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderModule;
