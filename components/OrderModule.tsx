
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, Plus, X, Package, Handshake, History, Weight, Trash2, ListPlus, TrendingUp, CheckCircle2, AlertCircle, Lock, Unlock, FileUp, DatabaseZap, Loader2, ArrowRight, Eye, ReceiptText, DollarSign } from 'lucide-react';
import { Order, Partner, InventoryItem, OrderItem, Sale } from '../types';
import { prisma } from '../services/prisma';

interface OrderModuleProps {
  orders: Order[];
  partners: Partner[];
  inventory: InventoryItem[];
}

const OrderModule: React.FC<OrderModuleProps> = ({ orders, partners, inventory }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [showSaleLog, setShowSaleLog] = useState<string | null>(null);
  const [viewAuditId, setViewAuditId] = useState<string | null>(null);
  
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
    quantity: 0,
    notes: ''
  });

  const allSales = prisma.sale.findMany();

  // Auto-populate rate when partner changes
  useEffect(() => {
    if (partnerId) {
      const selectedPartner = partners.find(p => p.id === partnerId);
      if (selectedPartner?.defaultRatePerKg) {
        setCurrentItem(prev => ({ ...prev, ratePerKg: selectedPartner.defaultRatePerKg! }));
      }
    }
  }, [partnerId, partners]);

  // Recalculate total value as items are added
  useEffect(() => {
    const calculatedValue = pendingItems.reduce((acc, item) => {
      return acc + (item.totalKg || 0) * (item.ratePerKg || 0);
    }, 0);
    setTotalValue(calculatedValue);
  }, [pendingItems]);

  const handleAddItem = () => {
    const name = currentItem.productType === 'ROLLER' 
      ? (currentItem.productName || 'Branded Roller Batch') 
      : 'Factory Packing Bags';
      
    setPendingItems([...pendingItems, { ...currentItem, productName: name, fulfilledQuantity: 0 }]);
    
    // Reset but keep the current rate as default for the next item
    setCurrentItem(prev => ({ 
      ...prev, 
      productType: 'ROLLER', 
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
      alert(`${type} Import Successful: Data converted to PENDING orders with new Internal IDs.`);
    }, 1200);
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSaleLog || !saleData.inventoryItemId || saleData.quantity <= 0) return;

    try {
      const targetOrder = orders.find(o => o.id === showSaleLog);
      prisma.sale.create({
        orderId: showSaleLog,
        agentId: 'system', 
        partnerId: targetOrder?.partnerId || '',
        inventoryItemId: saleData.inventoryItemId,
        quantity: Number(saleData.quantity),
        notes: saleData.notes
      });
      setShowSaleLog(null);
      setSaleData({ inventoryItemId: '', quantity: 0, notes: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const orderSalesAudit = useMemo(() => {
    if (!viewAuditId) return [];
    return allSales.filter(s => s.orderId === viewAuditId);
  }, [viewAuditId, allSales]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-swift-navy rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><ShoppingCart size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
             <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                <Lock size={16} className="text-swift-red" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fulfillment Protocol V3</span>
             </div>
             <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Supply Chain Lifecycle</h2>
             <p className="text-blue-100 text-lg leading-relaxed font-medium">Core Principle: Sales require Order IDs. Status is system-driven based on manifest completion. Fulfilled contracts are immutable.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setShowAdd(!showAdd)} className="px-10 py-6 bg-swift-red text-white rounded-[2.2rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
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
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-100 pb-8 mb-10 gap-8">
            <h3 className="text-3xl font-black text-swift-navy uppercase italic flex items-center gap-4">
              <ListPlus size={32} className="text-swift-red" />
              Manifest Construction
            </h3>
            <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto flex-1 justify-end">
              <div className="w-full md:w-72">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Account</label>
                <select value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black italic uppercase text-swift-navy focus:bg-white transition" required>
                  <option value="">Select Wholesaler...</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="w-full md:w-56">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Auto-Calculated Revenue ($)</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity (Units)</label>
                  <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-lg" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mass (KG)</label>
                  <input type="number" value={currentItem.totalKg} onChange={e => setCurrentItem({...currentItem, totalKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-lg text-swift-red" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate ($ Per KG)</label>
                <input type="number" step="0.01" value={currentItem.ratePerKg} onChange={e => setCurrentItem({...currentItem, ratePerKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-emerald-600" required />
              </div>

              <div className="p-4 bg-white/50 border border-slate-200 rounded-2xl">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Item Impact Estimate</p>
                 <p className="text-xl font-black text-swift-navy italic tracking-tighter">${(currentItem.totalKg * currentItem.ratePerKg).toLocaleString()}</p>
              </div>

              <button onClick={handleAddItem} className="w-full py-5 bg-swift-red text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-swift-navy transition shadow-xl active:scale-95">
                Append to Manifest
              </button>
            </div>

            <div className="lg:col-span-8 space-y-8 flex flex-col">
              <div className="flex-1 min-h-[350px] border-4 border-dashed border-slate-100 rounded-[3rem] p-8 space-y-4 overflow-y-auto">
                {pendingItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <History size={64} className="opacity-10" />
                    <p className="font-black uppercase tracking-widest text-xs italic">Awaiting itemization</p>
                  </div>
                ) : pendingItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm animate-in zoom-in-95">
                    <div>
                      <p className="font-black text-slate-900 uppercase italic tracking-tighter leading-none text-xl mb-1">{item.productType.replace('_', ' ')}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        {item.productName} 
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        Rate: ${item.ratePerKg}/kg
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <span className="block text-2xl font-black text-swift-navy tabular-nums leading-none">{item.quantity.toLocaleString()} <span className="text-[10px] uppercase text-slate-400 font-bold">Units</span></span>
                          {item.totalKg ? <span className="block text-xs font-black text-swift-red uppercase italic mt-1 tracking-tight">{item.totalKg} KG</span> : null}
                       </div>
                       <div className="text-right min-w-[80px]">
                          <p className="text-[8px] font-black text-slate-300 uppercase">Valuation</p>
                          <p className="font-black text-emerald-600 italic tracking-tighter leading-none">${((item.totalKg || 0) * (item.ratePerKg || 0)).toLocaleString()}</p>
                       </div>
                       <button onClick={() => handleRemoveItem(idx)} className="p-3 bg-red-50 text-swift-red rounded-xl hover:bg-swift-red hover:text-white transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleSubmitOrder}
                disabled={!partnerId || pendingItems.length === 0}
                className="w-full py-6 bg-swift-navy text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:bg-swift-red"
              >
                COMMIT PRODUCTION CONTRACT
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaleLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl p-12 shadow-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 -mr-10 -mt-10"><ReceiptText size={200} /></div>
             <button onClick={() => setShowSaleLog(null)} className="absolute top-8 right-8 text-slate-300 hover:text-swift-red transition"><X size={32} /></button>
             
             <h3 className="text-3xl font-black text-swift-navy uppercase italic mb-2">Execute Revenue Linkage</h3>
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-10">Contract ID: {orders.find(o => o.id === showSaleLog)?.internalId}</p>
             
             <form onSubmit={handleRecordSale} className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Partner Inventory Source</label>
                  <select value={saleData.inventoryItemId} onChange={e => setSaleData({...saleData, inventoryItemId: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black italic uppercase text-swift-navy" required>
                    <option value="">Choose specific asset pool...</option>
                    {inventory.filter(i => i.partnerId === orders.find(o => o.id === showSaleLog)?.partnerId).map(i => (
                      <option key={i.id} value={i.id}>{i.productName} (Avail: {i.quantity})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sale Quantity</label>
                      <input type="number" value={saleData.quantity} onChange={e => setSaleData({...saleData, quantity: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-2xl tabular-nums" placeholder="0" required />
                   </div>
                   <div className="space-y-2 flex flex-col justify-end">
                      <button type="submit" className="w-full py-5 bg-swift-red text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-swift-navy transition-all active:scale-95">
                         Commit Sale
                      </button>
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Traceability Note</label>
                   <textarea value={saleData.notes} onChange={e => setSaleData({...saleData, notes: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-medium h-24 resize-none" placeholder="Provide link context for audit..."></textarea>
                </div>
             </form>
          </div>
        </div>
      )}

      {viewAuditId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[4rem] w-full max-w-4xl h-[80vh] flex flex-col shadow-3xl overflow-hidden relative">
              <button onClick={() => setViewAuditId(null)} className="absolute top-8 right-8 text-slate-300 hover:text-swift-red transition"><X size={32} /></button>
              <div className="p-12 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-3xl font-black text-swift-navy uppercase italic">Revenue Traceability Audit</h3>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Order Ref: {orders.find(o => o.id === viewAuditId)?.internalId}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-12 space-y-6">
                 {orderSalesAudit.length > 0 ? orderSalesAudit.map(sale => (
                   <div key={sale.id} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex items-center gap-6">
                         <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ReceiptText size={24}/></div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(sale.date).toLocaleString()}</p>
                            <p className="text-xl font-black text-swift-navy italic uppercase tracking-tighter">Sale Event Linkage</p>
                            {sale.notes && <p className="text-sm text-slate-500 font-medium italic mt-1">"{sale.notes}"</p>}
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-swift-navy">+{sale.quantity.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">Units</span></p>
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 italic">Verified Fulfillment</p>
                      </div>
                   </div>
                 )) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-30">
                      <Loader2 size={64} />
                      <p className="font-black uppercase tracking-widest text-xs italic">Awaiting revenue conversion</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-12 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
           <h4 className="text-2xl font-black text-swift-navy uppercase italic tracking-tighter">Manufacturing-to-Revenue Ledger</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contract Info</th>
                  <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Real-Time</th>
                  <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Audit</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-12 py-24 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-10">
                          <Package size={80} />
                          <p className="font-black uppercase tracking-[0.4em] text-xs">Waiting for external sync or manual entry</p>
                       </div>
                    </td>
                  </tr>
                ) : orders.map(order => (
                  <tr key={order.id} className={`transition-all group ${order.status === 'FULFILLED' ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                     <td className="px-12 py-10">
                        <p className="font-black text-swift-red text-[10px] mb-2 font-mono tracking-widest flex items-center gap-2">
                           <TrendingUp size={12}/> {order.internalId}
                        </p>
                        <p className="font-black text-swift-navy uppercase italic tracking-tighter text-2xl leading-none mb-2">{partners.find(p => p.id === order.partnerId)?.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(order.orderDate).toLocaleDateString()}</p>
                     </td>
                     <td className="px-12 py-10">
                        <div className="space-y-6 w-full max-w-xs">
                          {order.items.map((item, idx) => {
                            const progress = (item.fulfilledQuantity / item.quantity) * 100;
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                  <span className="text-slate-400">{item.productType} SKU {item.totalKg ? `(${item.totalKg}KG @ $${item.ratePerKg})` : ''}</span>
                                  <span className="text-swift-navy">{item.fulfilledQuantity.toLocaleString()} / {item.quantity.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-swift-red'}`} style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                     </td>
                     <td className="px-12 py-10 text-center">
                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                          order.status === 'FULFILLED' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                        }`}>
                          {order.status === 'FULFILLED' ? <Lock size={16} /> : <Unlock size={16} />}
                          {order.status}
                        </div>
                     </td>
                     <td className="px-12 py-10 text-right">
                        <div className="flex justify-end gap-3">
                           {order.status !== 'FULFILLED' ? (
                             <button onClick={() => setShowSaleLog(order.id)} className="px-8 py-4 bg-swift-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-swift-red transition shadow-xl active:scale-95 flex items-center gap-2">
                               <Plus size={14}/> Record Sale
                             </button>
                           ) : (
                              <button onClick={() => setViewAuditId(order.id)} className="px-8 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition shadow-sm flex items-center gap-2">
                               <Eye size={14}/> View Audit
                             </button>
                           )}
                        </div>
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

export default OrderModule;
