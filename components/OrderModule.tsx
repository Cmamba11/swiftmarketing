
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, Plus, X, Package, Handshake, History, Weight, Trash2, ListPlus, TrendingUp, CheckCircle2, AlertCircle, Lock, Unlock, FileUp, DatabaseZap, Loader2, ArrowRight, Eye, ReceiptText, DollarSign, User, Hash, Clock } from 'lucide-react';
import { Order, Partner, InventoryItem, OrderItem, Sale, User as UserType } from '../types';
import { prisma } from '../services/prisma';

interface OrderModuleProps {
  orders: Order[];
  partners: Partner[];
  inventory: InventoryItem[];
  currentUser: UserType;
}

const OrderModule: React.FC<OrderModuleProps> = ({ orders, partners, inventory, currentUser }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [guestCompanyName, setGuestCompanyName] = useState('');
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [showSaleLog, setShowSaleLog] = useState<string | null>(null);
  
  const [partnerId, setPartnerId] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [pendingItems, setPendingItems] = useState<Omit<OrderItem, 'id'>[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productType: 'ROLLER' as 'ROLLER' | 'PACKING_BAG',
    quantity: 100,
    totalKg: 0,
    ratePerKg: 15.5,
    productName: ''
  });

  const [saleData, setSaleData] = useState({
    inventoryItemId: '',
    totalKg: 0,
    volume: 0,
    notes: ''
  });

  useEffect(() => {
    if (partnerId && !isWalkIn) {
      const selectedPartner = partners.find(p => p.id === partnerId);
      if (selectedPartner?.defaultRatePerKg) {
        setCurrentItem(prev => ({ ...prev, ratePerKg: selectedPartner.defaultRatePerKg! }));
      }
    } else if (isWalkIn) {
      setCurrentItem(prev => ({ ...prev, ratePerKg: 15.5, productType: 'PACKING_BAG' })); 
    }
  }, [partnerId, isWalkIn, partners]);

  useEffect(() => {
    const calculatedValue = pendingItems.reduce((acc, item) => {
      const lineValue = item.productType === 'ROLLER' 
        ? (item.totalKg || 0) * (item.ratePerKg || 0)
        : (item.quantity || 0) * (item.ratePerKg || 0);
      return acc + lineValue;
    }, 0);
    setTotalValue(calculatedValue);
  }, [pendingItems]);

  const handleAddItem = () => {
    const name = currentItem.productName || (currentItem.productType === 'ROLLER' ? 'Industrial Rollers' : 'Factory Packing Bags');
    setPendingItems([...pendingItems, { ...currentItem, productName: name, fulfilledQuantity: 0 }]);
    setCurrentItem(prev => ({ 
      ...prev, 
      quantity: 100, 
      totalKg: 0, 
      productName: '' 
    }));
  };

  const handleRemoveItem = (index: number) => {
    setPendingItems(pendingItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWalkIn && !guestCompanyName) {
      alert("Please specify the Walk-In company name.");
      return;
    }
    if (!isWalkIn && !partnerId) return;
    if (pendingItems.length === 0) return;

    prisma.order.create({
      partnerId: isWalkIn ? undefined : partnerId,
      guestCompanyName: isWalkIn ? guestCompanyName : undefined,
      items: pendingItems.map(item => ({ ...item, id: Math.random().toString(36).substring(7) })),
      totalValue: Number(totalValue),
      orderDate: new Date().toISOString()
    });

    setShowAdd(false);
    setPartnerId('');
    setGuestCompanyName('');
    setIsWalkIn(false);
    setPendingItems([]);
    setTotalValue(0);
  };

  const handleImportMock = (type: 'CSV' | 'API') => {
    setIsImporting(type);
    setTimeout(() => {
      setIsImporting(null);
      if (partners.length > 0) {
        const rate = partners[0].defaultRatePerKg || 15.5;
        prisma.order.create({
          partnerId: partners[0].id,
          items: [{ 
            id: 'imp-1', 
            productName: `${type} Imported SKU`, 
            productType: 'ROLLER', 
            quantity: 250, 
            totalKg: 500,
            ratePerKg: rate,
            fulfilledQuantity: 0 
          }],
          totalValue: 500 * rate,
          orderDate: new Date().toISOString()
        });
      }
      alert(`${type} Import Successful: Data converted to PENDING orders.`);
    }, 1200);
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSaleLog || !saleData.inventoryItemId || (saleData.volume <= 0 && saleData.totalKg <= 0)) return;

    try {
      const targetOrder = orders.find(o => o.id === showSaleLog);
      const invItem = inventory.find(i => i.id === saleData.inventoryItemId);
      
      // SYNC FIX: Priority Attribution
      // Use logged-in user's agent ID if linked, otherwise fallback to the account officer.
      const attributedAgentId = currentUser.agentId || 
        (targetOrder?.partnerId ? partners.find(p => p.id === targetOrder.partnerId)?.assignedAgentId : null) || 
        'system';

      prisma.sale.create({
        orderId: showSaleLog,
        agentId: attributedAgentId,
        partnerId: targetOrder?.partnerId || '',
        inventoryItemId: saleData.inventoryItemId,
        totalKg: Number(saleData.totalKg),
        volume: Number(saleData.volume),
        unitPrice: targetOrder?.items.find(i => i.productType === invItem?.productType)?.ratePerKg || 0,
        notes: saleData.notes
      });
      setShowSaleLog(null);
      setSaleData({ inventoryItemId: '', totalKg: 0, volume: 0, notes: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-[#1A2B6D] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><ShoppingCart size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
             <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                <Lock size={16} className="text-[#E31E24]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fulfillment Protocol V3</span>
             </div>
             <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Supply Chain Lifecycle</h2>
             <p className="text-blue-100 text-lg leading-relaxed font-medium">Core Principle: Sales require Order IDs. Your agent profile is automatically tagged to dispatches you log.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setShowAdd(!showAdd)} className="px-10 py-6 bg-[#E31E24] text-white rounded-[2.2rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
               {showAdd ? <X size={20} /> : <Plus size={20} />}
               {showAdd ? "Terminate" : "Manual Import"}
             </button>
             <div className="flex bg-white/5 backdrop-blur-md p-2 rounded-[2.5rem] border border-white/10">
                <button onClick={() => handleImportMock('CSV')} className="p-4 hover:bg-white/10 rounded-full transition text-blue-200" title="CSV Batch Import">
                  {isImporting === 'CSV' ? <Loader2 size={24} className="animate-spin" /> : <FileUp size={24} />}
                </button>
                <button onClick={() => handleImportMock('API')} className="p-4 hover:bg-white/10 rounded-full transition text-blue-200" title="API External Sync">
                  {isImporting === 'API' ? <Loader2 size={24} className="animate-spin" /> : <DatabaseZap size={24} />}
                </button>
             </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-[#1A2B6D] shadow-3xl animate-in slide-in-from-top-10">
          <form onSubmit={handleSubmitOrder}>
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-100 pb-8 mb-10 gap-8">
              <h3 className="text-3xl font-black text-[#1A2B6D] uppercase italic flex items-center gap-4">
                <ListPlus size={32} className="text-[#E31E24]" />
                Manifest Construction
              </h3>
              <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto flex-1 justify-end items-end">
                <div className="flex flex-col items-center gap-2 mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Walk-In Customer?</label>
                   <button type="button" onClick={() => setIsWalkIn(!isWalkIn)} className={`w-14 h-8 rounded-full p-1 transition-all ${isWalkIn ? 'bg-[#E31E24]' : 'bg-slate-200'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${isWalkIn ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                </div>
                <div className="w-full md:w-72">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isWalkIn ? 'Walk-In Company Name' : 'Target Account'}</label>
                  {isWalkIn ? (
                    <div className="relative">
                      <input type="text" value={guestCompanyName} onChange={e => setGuestCompanyName(e.target.value)} placeholder="Specify Walk-In Company" className="w-full p-4 bg-red-50 border border-red-200 rounded-2xl font-black italic uppercase text-[#1A2B6D] focus:bg-white focus:ring-2 focus:ring-[#E31E24] outline-none transition" required />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2"><User size={18} className="text-[#E31E24] opacity-40" /></div>
                    </div>
                  ) : (
                    <select value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black italic uppercase text-[#1A2B6D] focus:bg-white transition" required>
                      <option value="">Select Wholesaler...</option>
                      {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
                <div className="w-full md:w-56">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Revenue ($)</label>
                  <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-2xl font-black tabular-nums text-emerald-700 flex items-center gap-2 shadow-inner">
                    <DollarSign size={18} />
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-6 bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Item Specification</h4>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Category</label>
                  <select value={currentItem.productType} onChange={e => setCurrentItem({...currentItem, productType: e.target.value as any})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold">
                    <option value="ROLLER">Industrial Rollers</option>
                    <option value="PACKING_BAG">Poly Packing Bags</option>
                  </select>
                </div>
                <div className={`grid ${currentItem.productType === 'ROLLER' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {currentItem.productType === 'ROLLER' ? 'Number of Rollers' : 'Number of Bags'}
                    </label>
                    <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-lg" required />
                  </div>
                  {currentItem.productType === 'ROLLER' && (
                    <div className="space-y-2 animate-in slide-in-from-right-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KG</label>
                      <input type="number" value={currentItem.totalKg} onChange={e => setCurrentItem({...currentItem, totalKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-lg text-[#E31E24]" required />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {currentItem.productType === 'ROLLER' ? 'Rate ($ Per KG)' : 'Price ($ Per Bag)'}
                  </label>
                  <input type="number" step="0.01" value={currentItem.ratePerKg} onChange={e => setCurrentItem({...currentItem, ratePerKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-emerald-600" required />
                </div>
                <button type="button" onClick={handleAddItem} className="w-full py-5 bg-[#E31E24] text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-[#1A2B6D] transition shadow-xl active:scale-95">
                  Append to Manifest
                </button>
              </div>
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] min-h-[400px]">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Manifest Items</h4>
                  {pendingItems.length > 0 ? (
                    <div className="space-y-3">
                      {pendingItems.map((item, idx) => {
                        const lineTotal = item.productType === 'ROLLER' ? (item.totalKg! * item.ratePerKg!) : (item.quantity * item.ratePerKg!);
                        const unitText = item.productType === 'ROLLER' ? `${item.totalKg}kg @ $${item.ratePerKg}/kg` : `${item.quantity} bags @ $${item.ratePerKg}/bag`;
                        return (
                          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-slate-50 rounded-xl text-[#1A2B6D]"><Package size={20}/></div>
                              <div>
                                <p className="font-black text-[#1A2B6D] uppercase italic text-sm">{item.productName}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase">{item.productType} &bull; {item.quantity} Units</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-10">
                              <div className="text-right">
                                <p className="font-black text-[#E31E24] italic">${lineTotal.toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">{unitText}</p>
                              </div>
                              <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 py-20"><ListPlus size={48} /><p className="font-black uppercase tracking-widest text-xs mt-4">Empty Manifest</p></div>
                  )}
                </div>
                <button type="submit" className="w-full py-6 bg-[#1A2B6D] text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-[#E31E24] transition-all">Commit Order to Database</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* List view and other modals stay the same ... */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Linkage</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Industrial Partner</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Value</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map(order => {
              const partner = partners.find(p => p.id === order.partnerId);
              return (
                <tr key={order.id} className="hover:bg-slate-50 transition group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-slate-100 rounded-lg text-[#1A2B6D]"><Hash size={16}/></span>
                      <div>
                        <p className="font-black text-[#1A2B6D] uppercase italic tracking-tighter text-lg">{order.internalId}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                       <p className="font-black text-slate-900 uppercase italic tracking-tight">{partner?.name || order.guestCompanyName || 'Walk-In Customer'}</p>
                       {!partner && <span className="px-2 py-0.5 bg-red-50 text-[7px] font-black text-[#E31E24] rounded border border-red-100 uppercase tracking-widest">Walk-In</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border w-fit ${
                        order.status === 'FULFILLED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'PARTIALLY_FULFILLED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.status === 'PENDING' && (
                        <span className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-widest flex items-center gap-1"><Clock size={8} /> Awaiting Dispatch</span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-[#1A2B6D] italic text-xl">${order.totalValue.toLocaleString()}</td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2">
                      {order.status !== 'FULFILLED' && (
                        <button onClick={() => setShowSaleLog(order.id)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 transition shadow-sm" title="Log Sale Dispatch"><ArrowRight size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showSaleLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-3xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-[#1A2B6D] mb-2 uppercase italic tracking-tighter">Sale Dispatch Entry</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Order Ref: {orders.find(o => o.id === showSaleLog)?.internalId}</p>
            <form onSubmit={handleRecordSale} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Inventory Source</label>
                <select value={saleData.inventoryItemId} onChange={e => setSaleData({...saleData, inventoryItemId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required>
                  <option value="">Choose item...</option>
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.productName} ({inv.quantity} units / {inv.totalKg || 0}kg available)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Weight (KG)</label>
                  <input type="number" step="0.1" value={saleData.totalKg} onChange={e => setSaleData({...saleData, totalKg: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-[#E31E24]" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Volume (Units)</label>
                  <input type="number" value={saleData.volume} onChange={e => setSaleData({...saleData, volume: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl" required />
                </div>
              </div>
              <textarea value={saleData.notes} onChange={e => setSaleData({...saleData, notes: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 font-medium" placeholder="Logistics/Dispatch notes..." />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSaleLog(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-600 transition">Commit Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderModule;
