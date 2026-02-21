
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Plus, X, Package, Trash2, ListPlus, ShieldCheck, RefreshCw, Ruler, Palette, MapPin, UserCheck, Shield, BadgeCheck, DollarSign, User, Hash, Image as ImageIcon, FileCheck, Hammer, Lock } from 'lucide-react';
import { Order, Partner, OrderItem, User as UserType, Role, ViewState, Agent } from '../types';
import { api } from '../services/api';
import { COLOR_OPTIONS } from '../constants';

interface OrderModuleProps {
  orders: Order[];
  partners: Partner[];
  agents: Agent[];
  currentUser: UserType;
  roles: Role[];
  onNavigate?: (view: ViewState) => void;
}

const OrderModule: React.FC<OrderModuleProps> = ({ orders, partners, agents, currentUser, roles, onNavigate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [guestCompanyName, setGuestCompanyName] = useState('');
  const [importerName, setImporterName] = useState(currentUser.name);
  const [proofOfPayment, setProofOfPayment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);
  
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

  const currentUserRole = roles.find(r => r.id === currentUser.roleId);
  const isAdmin = currentUserRole?.isSystemAdmin;
  const isAgentHead = isAdmin || currentUserRole?.canApproveAsAgentHead;
  const isAccountOfficer = isAdmin || currentUserRole?.canApproveAsAccountOfficer;

  const selectedPartner = useMemo(() => partners.find(p => p.id === partnerId), [partners, partnerId]);

  useEffect(() => {
    if (isWalkIn) {
      if (!importerName) setImporterName(currentUser.name);
    } else if (partnerId) {
      const partner = partners.find(p => p.id === partnerId);
      if (partner) {
        const agent = agents.find(a => a.id === partner.assignedAgentId);
        setImporterName(agent?.name || 'Unassigned');
      }
    }
  }, [partnerId, isWalkIn, partners, agents, currentUser.name]);

  useEffect(() => {
    if (selectedPartner && !isWalkIn) {
      if (currentItem.productType === 'ROLLER' && selectedPartner.defaultRatePerKg) {
        setCurrentItem(prev => ({ ...prev, ratePerKg: selectedPartner.defaultRatePerKg! }));
      } else if (currentItem.productType === 'PACKING_BAG' && (selectedPartner as any).ratePerBags) {
        setCurrentItem(prev => ({ ...prev, ratePerKg: (selectedPartner as any).ratePerBags! }));
      }
    } else if (isWalkIn) {
      setCurrentItem(prev => ({ ...prev, ratePerKg: currentItem.productType === 'ROLLER' ? 15.5 : 0.45 })); 
    }
  }, [selectedPartner, isWalkIn, currentItem.productType]);

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
    const name = currentItem.productName || (currentItem.productType === 'ROLLER' ? 'Industrial Rollers' : 'Packing Bags');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofOfPayment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWalkIn && !guestCompanyName) return;
    if (!isWalkIn && !partnerId) return;
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    await api.orders.create({
      partnerId: isWalkIn ? undefined : partnerId,
      guestCompanyName: isWalkIn ? guestCompanyName : undefined,
      importerName: importerName,
      proofOfPayment: proofOfPayment,
      items: pendingItems.map(item => ({ ...item, id: Math.random().toString(36).substring(7) })),
      totalValue: Number(totalValue),
      orderDate: new Date().toISOString()
    });

    setShowAdd(false);
    setPendingItems([]);
    setProofOfPayment('');
    setIsProcessing(false);
  };

  const handleApprove = async (order: Order, type: 'ADMIN' | 'AGENT_HEAD' | 'ACCOUNT_OFFICER') => {
    if (!order.proofOfPayment) {
      alert("Proof of Payment required.");
      return;
    }
    setIsProcessing(true);
    await api.orders.approve(order.id, type);
    setIsProcessing(false);
  };

  const handleIssueWorkOrder = async (id: string) => {
    setIsProcessing(true);
    await api.workOrders.issue(id);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-swift-navy rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><ShoppingCart size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
             <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                <ShieldCheck size={16} className="text-swift-green" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Mandatory Triple-Tier Verification</span>
             </div>
             <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Order Hub</h2>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="px-10 py-6 bg-swift-red text-white rounded-[2.2rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
            {showAdd ? <X size={20} /> : <Plus size={20} />}
            {showAdd ? "Discard Draft" : "New Contract Order"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10 relative overflow-hidden">
          {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
          <form onSubmit={handleSubmitOrder}>
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-100 pb-8 mb-10 gap-8">
              <h3 className="text-3xl font-black text-swift-navy uppercase italic flex items-center gap-4"><ListPlus size={32} className="text-swift-red" /> New Manifest</h3>
              <div className="flex gap-6 items-center">
                <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Walk-In?</label>
                   <button type="button" onClick={() => setIsWalkIn(!isWalkIn)} className={`w-14 h-8 rounded-full p-1 transition-all ${isWalkIn ? 'bg-swift-red' : 'bg-slate-200'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full transition-all ${isWalkIn ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                </div>
                <div className="w-80">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isWalkIn ? 'Guest Entity' : 'Industrial Account'}</label>
                  {isWalkIn ? (
                    <input type="text" value={guestCompanyName} onChange={e => setGuestCompanyName(e.target.value)} placeholder="Client Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase outline-none" required />
                  ) : (
                    <select value={partnerId} onChange={e => setPartnerId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase" required>
                      <option value="">Select Account...</option>
                      {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-6 bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Type</label>
                  <select value={currentItem.productType} onChange={e => setCurrentItem({...currentItem, productType: e.target.value as any})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold">
                    <option value="ROLLER">Branded Rollers</option>
                    <option value="PACKING_BAG">Poly Packaging</option>
                  </select>
                </div>
                
                {currentItem.productType === 'ROLLER' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Weight (KG)</label>
                    <input type="number" value={currentItem.totalKg} onChange={e => setCurrentItem({...currentItem, totalKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold" min="1" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity (Bags)</label>
                    <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold" min="1" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</label>
                  <input type="number" step="0.01" value={currentItem.ratePerKg} onChange={e => setCurrentItem({...currentItem, ratePerKg: Number(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold" min="0" />
                </div>
                <button type="button" onClick={handleAddItem} className="w-full py-5 bg-swift-red text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-swift-navy transition shadow-xl mt-4">Append to Manifest</button>
              </div>
              <div className="lg:col-span-8">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] min-h-[400px]">
                  {pendingItems.length > 0 ? pendingItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center mb-3">
                      <div>
                        <p className="font-black text-swift-navy uppercase italic">{item.productName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {item.productType === 'ROLLER' ? `${item.totalKg} KG @ $${item.ratePerKg}/KG` : `${item.quantity} Bags @ $${item.ratePerKg}/Bag`}
                        </p>
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-[8px] font-black text-red-400 uppercase">Remove</button>
                    </div>
                  )) : <div className="flex items-center justify-center h-full opacity-20">Manifest Empty</div>}
                </div>
                <div className="pt-6">
                  <label className="text-[10px] font-black text-swift-navy uppercase mb-2 block">Link Proof of Payment</label>
                  <input type="file" onChange={handleFileUpload} className="w-full p-4 bg-slate-100 rounded-2xl" />
                </div>
                <button type="submit" disabled={isProcessing || !proofOfPayment} className="w-full py-6 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl mt-6 disabled:opacity-50">Initialize Order</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase">ID/Date</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase">Target Entity</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase text-center">Multi-Tier Verification</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase">Phase</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase text-right">Auth Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map(order => {
              const partner = partners.find(p => p.id === order.partnerId);
              const allApproved = order.adminApproved && order.agentHeadApproved && order.accountOfficerApproved;
              
              return (
                <tr key={order.id} className="hover:bg-slate-50 transition group">
                  <td className="px-10 py-8">
                    <p className="font-black text-swift-navy uppercase italic text-lg">{order.internalId}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-10 py-8 font-black uppercase">{partner?.name || order.guestCompanyName || 'Walk-In'}</td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center gap-3">
                       <div className={`px-3 py-2 rounded-xl flex items-center gap-2 border ${order.adminApproved ? 'bg-swift-navy text-white' : 'bg-slate-50 text-slate-300'}`} title="Admin"><Shield size={14} /><span className="text-[8px] font-black">ADM</span></div>
                       <div className={`px-3 py-2 rounded-xl flex items-center gap-2 border ${order.agentHeadApproved ? 'bg-swift-navy text-white' : 'bg-slate-50 text-slate-300'}`} title="Agent Head"><BadgeCheck size={14} /><span className="text-[8px] font-black">A.H</span></div>
                       <div className={`px-3 py-2 rounded-xl flex items-center gap-2 border ${order.accountOfficerApproved ? 'bg-swift-green text-white' : 'bg-slate-50 text-slate-300'}`} title="Account Officer"><UserCheck size={14} /><span className="text-[8px] font-black">A.O</span></div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${order.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === 'PENDING' && (
                        <>
                           {isAdmin && !order.adminApproved && <button onClick={() => handleApprove(order, 'ADMIN')} className="p-3 bg-swift-navy text-white rounded-2xl shadow-lg"><Shield size={18} /></button>}
                           {isAgentHead && !order.agentHeadApproved && <button onClick={() => handleApprove(order, 'AGENT_HEAD')} className="p-3 bg-swift-navy/70 text-white rounded-2xl shadow-lg"><BadgeCheck size={18} /></button>}
                           {isAccountOfficer && !order.accountOfficerApproved && <button onClick={() => handleApprove(order, 'ACCOUNT_OFFICER')} className="p-3 bg-swift-green text-white rounded-2xl shadow-lg"><UserCheck size={18} /></button>}
                           {allApproved && <button onClick={() => handleIssueWorkOrder(order.id)} className="p-3 bg-swift-red text-white rounded-2xl shadow-lg animate-pulse"><Hammer size={18} /></button>}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderModule;
