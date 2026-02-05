
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, Plus, X, Package, Handshake, History, Weight, Trash2, ListPlus, TrendingUp, CheckCircle2, AlertCircle, Lock, Unlock, FileUp, DatabaseZap, Loader2, ArrowRight, Eye, ReceiptText, DollarSign, User, Hash, Clock, ClipboardCheck, Hammer, ShieldCheck, Fingerprint, BadgeCheck, RefreshCw } from 'lucide-react';
import { Order, Partner, InventoryItem, OrderItem, Sale, User as UserType, WorkOrder, Role } from '../types';
import { api } from '../services/api';

interface OrderModuleProps {
  orders: Order[];
  partners: Partner[];
  inventory: InventoryItem[];
  currentUser: UserType;
  roles: Role[];
}

const OrderModule: React.FC<OrderModuleProps> = ({ orders, partners, inventory, currentUser, roles }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [guestCompanyName, setGuestCompanyName] = useState('');
  const [showSaleLog, setShowSaleLog] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [partnerId, setPartnerId] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [pendingItems, setPendingItems] = useState<Omit<OrderItem, 'id'>[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productType: 'ROLLER' as 'ROLLER' | 'PACKING_BAG',
    quantity: 100, 
    totalKg: 100,
    ratePerKg: 15.5,
    productName: ''
  });

  const activeDispatchOrder = useMemo(() => orders.find(o => o.id === showSaleLog), [orders, showSaleLog]);

  const [localSaleData, setLocalSaleData] = useState({
    inventoryItemId: '',
    totalKg: 0,
    volume: 0,
    notes: ''
  });

  const [localApprovals, setLocalApprovals] = useState({
    systemOwner: false,
    accountOfficer: false
  });

  useEffect(() => {
    if (activeDispatchOrder?.pendingDispatch) {
      const pd = activeDispatchOrder.pendingDispatch;
      setLocalSaleData({
        inventoryItemId: pd.inventoryItemId,
        totalKg: pd.totalKg,
        volume: pd.volume,
        notes: pd.notes
      });
      setLocalApprovals({
        systemOwner: pd.systemOwnerApproved,
        accountOfficer: pd.accountOfficerApproved
      });
    } else {
      setLocalSaleData({ inventoryItemId: '', totalKg: 0, volume: 0, notes: '' });
      setLocalApprovals({ systemOwner: false, accountOfficer: false });
    }
  }, [activeDispatchOrder]);

  const currentUserRole = roles.find(r => r.id === currentUser.roleId);
  const isSystemOwner = currentUserRole?.name === 'System Owner';
  const isAccountOfficer = currentUserRole?.name === 'Account Officer';

  useEffect(() => {
    if (partnerId && !isWalkIn) {
      const selectedPartner = partners.find(p => p.id === partnerId);
      if (selectedPartner?.defaultRatePerKg) {
        setCurrentItem(prev => ({ ...prev, ratePerKg: selectedPartner.defaultRatePerKg! }));
      }
    } else if (isWalkIn) {
      setCurrentItem(prev => ({ ...prev, ratePerKg: currentItem.productType === 'ROLLER' ? 15.5 : 0.45 })); 
    }
  }, [partnerId, isWalkIn, partners, currentItem.productType]);

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
    const name = currentItem.productName || (currentItem.productType === 'ROLLER' ? 'Branded Industrial Rollers' : 'Factory Packing Bags');
    const itemToSubmit = {
      ...currentItem,
      productName: name,
      quantity: currentItem.productType === 'ROLLER' ? 0 : currentItem.quantity,
      fulfilledQuantity: 0
    };
    setPendingItems([...pendingItems, itemToSubmit]);
    setCurrentItem(prev => ({ ...prev, quantity: 100, totalKg: 100, productName: '' }));
  };

  const handleRemoveItem = (index: number) => {
    setPendingItems(pendingItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWalkIn && !guestCompanyName) {
      alert("Please specify the Walk-In company name.");
      return;
    }
    if (!isWalkIn && !partnerId) return;
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    await api.orders.create({
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
    setIsProcessing(false);
  };

  const handleIssueWorkOrder = async (id: string) => {
    setIsProcessing(true);
    await api.workOrders.issue(id);
    setIsProcessing(false);
    alert("Industrial Work Order Issued. The production floor has been notified.");
  };

  const persistDispatchProgress = async (updates: any) => {
    if (!showSaleLog) return;
    await api.orders.updatePending(showSaleLog, {
      ...localSaleData,
      systemOwnerApproved: localApprovals.systemOwner,
      accountOfficerApproved: localApprovals.accountOfficer,
      ...updates
    });
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localApprovals.systemOwner || !localApprovals.accountOfficer) {
      alert("DUAL AUTHORIZATION REQUIRED: Both System Owner and Account Officer must approve this dispatch.");
      return;
    }
    if (!showSaleLog || !localSaleData.inventoryItemId || (localSaleData.volume <= 0 && localSaleData.totalKg <= 0)) return;

    setIsProcessing(true);
    try {
      const targetOrder = orders.find(o => o.id === showSaleLog);
      const invItem = inventory.find(i => i.id === localSaleData.inventoryItemId);
      const attributedAgentId = currentUser.agentId || 
        (targetOrder?.partnerId ? partners.find(p => p.id === targetOrder.partnerId)?.assignedAgentId : null) || 
        'system';

      await api.sales.create({
        orderId: showSaleLog,
        agentId: attributedAgentId,
        partnerId: targetOrder?.partnerId || '',
        inventoryItemId: localSaleData.inventoryItemId,
        totalKg: Number(localSaleData.totalKg),
        volume: Number(localSaleData.volume),
        unitPrice: targetOrder?.items.find(i => i.productType === invItem?.productType)?.ratePerKg || 0,
        notes: localSaleData.notes
      });
      setShowSaleLog(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-[#1A2B6D] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><ShoppingCart size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
             <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                <DollarSign size={16} className="text-swift-green" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Multi-Unit Billing Enabled</span>
             </div>
             <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Supply Chain Lifecycle</h2>
             <p className="text-blue-100 text-lg leading-relaxed font-medium">Rollers are billed by weight (KG). Packing bags are billed by quantity (Units). Revenue is calculated dynamically.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setShowAdd(!showAdd)} className="px-10 py-6 bg-[#E31E24] text-white rounded-[2.2rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
               {showAdd ? <X size={20} /> : <Plus size={20} />}
               {showAdd ? "Terminate" : "Manual Import"}
             </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-[#1A2B6D] shadow-3xl animate-in slide-in-from-top-10 relative overflow-hidden">
          {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm animate-in fade-in"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
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
                {currentItem.productType === 'ROLLER' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Weight (KG)</label>
                      <input type="number" value={currentItem.totalKg} onChange={e => setCurrentItem({...currentItem, totalKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-lg text-swift-red" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate ($ Per KG)</label>
                      <input type="number" step="0.01" value={currentItem.ratePerKg} onChange={e => setCurrentItem({...currentItem, ratePerKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-emerald-600" required />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity (Bags)</label>
                      <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-lg text-swift-navy" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price ($ Per Bag)</label>
                      <input type="number" step="0.01" value={currentItem.ratePerKg} onChange={e => setCurrentItem({...currentItem, ratePerKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-emerald-600" required />
                    </div>
                  </div>
                )}
                <button type="button" onClick={handleAddItem} className="w-full py-5 bg-[#E31E24] text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-[#1A2B6D] transition shadow-xl active:scale-95">Append to Manifest</button>
              </div>
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] min-h-[400px]">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Manifest Items</h4>
                  {pendingItems.length > 0 ? (
                    <div className="space-y-3">
                      {pendingItems.map((item, idx) => {
                        const isRoller = item.productType === 'ROLLER';
                        const lineTotal = isRoller ? (item.totalKg! * item.ratePerKg!) : (item.quantity * item.ratePerKg!);
                        return (
                          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-slate-50 rounded-xl text-[#1A2B6D]"><Package size={20}/></div>
                              <div>
                                <p className="font-black text-[#1A2B6D] uppercase italic text-sm">{item.productName}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase">{item.productType} &bull; {isRoller ? `Weight Billed` : `Unit Billed`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-10">
                              <div className="text-right">
                                <p className="font-black text-[#E31E24] italic">${lineTotal.toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">{isRoller ? `${item.totalKg}kg @ $${item.ratePerKg}/kg` : `${item.quantity} bags @ $${item.ratePerKg}/bag`}</p>
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
                <button type="submit" disabled={isProcessing} className="w-full py-6 bg-[#1A2B6D] text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-[#E31E24] transition-all disabled:bg-slate-400">
                  {isProcessing ? 'Transmitting Data...' : 'Commit Order to Database'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Linkage</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Industrial Partner</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settlement Value</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map(order => {
              const partner = partners.find(p => p.id === order.partnerId);
              const isFulfillable = order.status === 'READY_FOR_DISPATCH' || order.status === 'PARTIALLY_FULFILLED';
              const needsProduction = order.status === 'PENDING';
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
                    <p className="font-black text-slate-900 uppercase italic tracking-tight">{partner?.name || order.guestCompanyName || 'Walk-In Customer'}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                       <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border w-fit ${
                         order.status === 'FULFILLED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>{order.status.replace('_', ' ')}</span>
                       {order.pendingDispatch && (
                         <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 text-[8px] font-black uppercase flex items-center gap-1">
                            <ShieldCheck size={10} /> Active Draft
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-[#1A2B6D] italic text-xl">${order.totalValue.toLocaleString()}</td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2">
                      {needsProduction && (
                        <button onClick={() => handleIssueWorkOrder(order.id)} disabled={isProcessing} className="p-3 bg-white border border-slate-200 rounded-2xl text-[#E31E24] hover:bg-red-50 transition shadow-sm disabled:opacity-50" title="Issue Production Work Order">
                          <Hammer size={18} />
                        </button>
                      )}
                      {isFulfillable && (
                        <button onClick={() => setShowSaleLog(order.id)} className="p-3 bg-white border border-slate-200 rounded-2xl text-emerald-500 hover:bg-emerald-50 transition shadow-sm" title="Log Sale Dispatch">
                          <ArrowRight size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showSaleLog && activeDispatchOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-3xl animate-in zoom-in-95 relative overflow-hidden">
            {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
            <h3 className="text-2xl font-black text-[#1A2B6D] mb-2 uppercase italic tracking-tighter">Sale Dispatch Entry</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Order Ref: {activeDispatchOrder.internalId}</p>
            
            <form onSubmit={handleRecordSale} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Inventory Source</label>
                <select 
                  value={localSaleData.inventoryItemId} 
                  onChange={e => {
                    const updates = { ...localSaleData, inventoryItemId: e.target.value };
                    setLocalSaleData(updates);
                    persistDispatchProgress(updates);
                  }} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                  required
                >
                  <option value="">Choose item...</option>
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.productName} ({inv.quantity} units / {inv.totalKg || 0}kg available)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Weight (KG)</label>
                  <input 
                    type="number" step="0.1" 
                    value={localSaleData.totalKg} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      setLocalSaleData({ ...localSaleData, totalKg: val });
                      persistDispatchProgress({ totalKg: val });
                    }} 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-swift-red" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Volume (Units)</label>
                  <input 
                    type="number" 
                    value={localSaleData.volume} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      setLocalSaleData({ ...localSaleData, volume: val });
                      persistDispatchProgress({ volume: val });
                    }} 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl" 
                    required 
                  />
                </div>
              </div>
              <textarea 
                value={localSaleData.notes} 
                onChange={e => {
                  const val = e.target.value;
                  setLocalSaleData({ ...localSaleData, notes: val });
                  persistDispatchProgress({ notes: val });
                }} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 font-medium" 
                placeholder="Logistics/Dispatch notes..." 
              />
              
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                 <h4 className="text-[10px] font-black text-swift-navy uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-swift-green" /> Dual-Authorization Protocol (Persistent)
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${localApprovals.systemOwner ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                       <div className="flex items-center gap-3">
                          <Fingerprint size={20} className={localApprovals.systemOwner ? 'text-emerald-500' : 'text-slate-300'} />
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase">System Owner</p>
                             <p className={`text-xs font-black uppercase italic ${localApprovals.systemOwner ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {localApprovals.systemOwner ? 'Authorized' : 'Pending'}
                             </p>
                          </div>
                       </div>
                       {isSystemOwner && !localApprovals.systemOwner && (
                         <button type="button" onClick={() => {
                            setLocalApprovals({...localApprovals, systemOwner: true});
                            persistDispatchProgress({ systemOwnerApproved: true });
                         }} className="px-3 py-1 bg-swift-navy text-white text-[8px] font-black uppercase rounded-lg hover:bg-swift-green transition">Sign</button>
                       )}
                       {localApprovals.systemOwner && <BadgeCheck size={18} className="text-emerald-500" />}
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${localApprovals.accountOfficer ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                       <div className="flex items-center gap-3">
                          <ShieldCheck size={20} className={localApprovals.accountOfficer ? 'text-emerald-500' : 'text-slate-300'} />
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase">Account Officer</p>
                             <p className={`text-xs font-black uppercase italic ${localApprovals.accountOfficer ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {localApprovals.accountOfficer ? 'Authorized' : 'Pending'}
                             </p>
                          </div>
                       </div>
                       {isAccountOfficer && !localApprovals.accountOfficer && (
                         <button type="button" onClick={() => {
                            setLocalApprovals({...localApprovals, accountOfficer: true});
                            persistDispatchProgress({ accountOfficerApproved: true });
                         }} className="px-3 py-1 bg-swift-navy text-white text-[8px] font-black uppercase rounded-lg hover:bg-swift-green transition">Sign</button>
                       )}
                       {localApprovals.accountOfficer && <BadgeCheck size={18} className="text-emerald-500" />}
                    </div>
                 </div>

                 {!isSystemOwner && !isAccountOfficer && !localApprovals.systemOwner && !localApprovals.accountOfficer && (
                   <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-2 text-amber-600 text-[9px] font-bold uppercase">
                      <AlertCircle size={14} /> Only 'System Owner' and 'Account Officer' roles can authorize dispatches.
                   </div>
                 )}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSaleLog(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-slate-400">Cancel</button>
                <button 
                  type="submit" 
                  disabled={!localApprovals.systemOwner || !localApprovals.accountOfficer || isProcessing}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase shadow-xl transition-all ${
                    localApprovals.systemOwner && localApprovals.accountOfficer 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                   {localApprovals.systemOwner && localApprovals.accountOfficer ? 'Commit Dispatch' : 'Awaiting Signatures'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderModule;
