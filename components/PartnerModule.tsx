
import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, MapPin, Handshake, Plus, X, Globe, FileText, Wallet, PackageOpen, Weight, UserCheck, DollarSign, History, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Partner, PartnerType, Role, InventoryItem, Agent } from '../types';
import { api } from '../services/api';

interface PartnerModuleProps {
  partners: Partner[];
  inventory: InventoryItem[];
  agents: Agent[]; 
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  permissions?: Role;
}

const PartnerModule: React.FC<PartnerModuleProps> = ({ partners, inventory, agents, onDelete, searchTerm, onSearchChange, permissions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showAdjust, setShowAdjust] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adjustData, setAdjustData] = useState({ change: 0, notes: '', type: 'RESTOCK' as 'RESTOCK' | 'ADJUSTMENT' | 'REDUCTION' });
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', contactPerson: '', location: '', address: '',
    type: PartnerType.NEW, status: 'Active Partner',
    businessCategory: 'Major Industrialist', website: '',
    assignedAgentId: '',
    defaultRatePerKg: 15.5
  });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreatePartners || !permissions;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeletePartners || !permissions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await api.partners.create({ 
      ...formData,
      assignedAgentId: formData.assignedAgentId || 'unassigned',
      defaultRatePerKg: Number(formData.defaultRatePerKg)
    });
    setFormData({ 
      name: '', email: '', phone: '', contactPerson: '', location: '', address: '', 
      type: PartnerType.NEW, status: 'Active Partner',
      businessCategory: 'Major Industrialist', website: '',
      assignedAgentId: '',
      defaultRatePerKg: 15.5
    });
    setShowAdd(false);
    setIsProcessing(false);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdjust) return;
    setIsProcessing(true);
    try {
      const change = adjustData.type === 'REDUCTION' ? -Math.abs(adjustData.change) : Number(adjustData.change);
      await api.inventory.adjust(showAdjust, change, adjustData.type, adjustData.notes);
      setShowAdjust(null);
      setAdjustData({ change: 0, notes: '', type: 'RESTOCK' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadHistory = async (itemId: string) => {
    setShowHistory(itemId);
    const logs = await api.inventory.getLogs(itemId);
    setHistoryLogs(logs);
  };

  const currentItemName = useMemo(() => {
    const id = showHistory || showAdjust;
    return inventory.find(i => i.id === id)?.productName || "";
  }, [showHistory, showAdjust, inventory]);

  const filteredPartners = partners.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search Partners..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#1A2B6D] outline-none" />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-[#1A2B6D] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#E31E24] transition shadow-lg">
            {showAdd ? <X size={18} /> : <Plus size={18} />} Enroll Partner
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-[#1A2B6D] shadow-2xl animate-in slide-in-from-top-4 space-y-6 relative overflow-hidden">
          {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
            <Handshake size={32} className="text-[#E31E24]" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[#1A2B6D]">Industrial Partner Enrollment</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Name</label>
              <input placeholder="Partner Enterprise Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserCheck size={12} /> Assigned Account Officer
              </label>
              <select 
                className="w-full p-4 bg-red-50 border border-red-100 rounded-xl font-black italic uppercase text-[#1A2B6D]" 
                value={formData.assignedAgentId} 
                onChange={e => setFormData({...formData, assignedAgentId: e.target.value})} 
              >
                <option value="">Select Sales Agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.region})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location (City)</label>
              <input placeholder="Location (City)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Rate ($/KG)</label>
              <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.defaultRatePerKg} onChange={e => setFormData({...formData, defaultRatePerKg: Number(e.target.value)})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Category</label>
              <input placeholder="Category" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.businessCategory} onChange={e => setFormData({...formData, businessCategory: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website</label>
              <input placeholder="Website" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
            </div>
          </div>
          
          <button type="submit" disabled={isProcessing} className="w-full py-6 bg-[#E31E24] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#1A2B6D] transition-all active:scale-95 disabled:bg-slate-400">
            Authorize Partner & Establish Linkage
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredPartners.map((partner) => {
          const partnerAssets = inventory.filter(i => i.partnerId === partner.id);
          const accountOfficer = agents.find(a => a.id === partner.assignedAgentId);
          
          return (
            <div key={partner.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col relative group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-[#1A2B6D] font-black text-2xl uppercase shadow-inner group-hover:bg-[#1A2B6D] group-hover:text-white transition-colors">{partner.name.charAt(0)}</div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{partner.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12} className="text-[#E31E24]" /> {partner.location}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-100">Industrial Partner</span>
                  {accountOfficer && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-lg border border-red-100">
                      <UserCheck size={10} className="text-[#E31E24]" />
                      <span className="text-[8px] font-black text-[#E31E24] uppercase tracking-widest">AO: {accountOfficer.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                    <DollarSign size={10} className="text-emerald-600" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Rate: ${partner.defaultRatePerKg || '0.00'}/kg</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6 flex-1">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><PackageOpen size={14} className="text-[#E31E24]" /> Branded Partner Asset Deck</h5>
                {partnerAssets.length > 0 ? (
                  <div className="space-y-3">
                    {partnerAssets.map(asset => (
                      <div key={asset.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group/asset">
                        <div className="flex flex-col">
                           <span className="text-xs font-black uppercase italic text-slate-700 tracking-tight">{asset.productName}</span>
                           <div className="flex gap-2 mt-1">
                              <button onClick={() => loadHistory(asset.id)} className="text-[8px] font-black uppercase text-slate-300 hover:text-[#1A2B6D] transition flex items-center gap-1"><History size={10}/> Trace</button>
                              <button onClick={() => setShowAdjust(asset.id)} className="text-[8px] font-black uppercase text-slate-300 hover:text-[#E31E24] transition flex items-center gap-1"><Plus size={10}/> Adjust</button>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {asset.totalKg && (
                            <div className="flex items-center gap-1 text-[#E31E24] font-black italic text-xs">
                              <Weight size={12} />
                              <span>{asset.totalKg}kg</span>
                            </div>
                          )}
                          <span className="text-lg font-black text-[#1A2B6D] tracking-tighter">{asset.quantity} <span className="text-[8px] text-slate-400 uppercase">Vol</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] italic text-slate-400 font-bold uppercase tracking-widest bg-white/50 p-4 rounded-xl border border-dashed border-slate-200 text-center">Awaiting initial asset deployment</p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-50 pt-6">
                {canDelete && (
                  <button onClick={() => onDelete(partner.id)} className="p-3 bg-slate-50 rounded-xl text-slate-200 hover:text-[#E31E24] transition border border-transparent hover:border-slate-100">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAdjust && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
            <h3 className="text-2xl font-black text-[#1A2B6D] mb-2 uppercase italic tracking-tighter">Manual Stock Adjustment</h3>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-8">Asset SKU: {currentItemName}</p>
            <form onSubmit={handleAdjust} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setAdjustData({...adjustData, type: 'RESTOCK'})} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition ${adjustData.type === 'RESTOCK' ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-slate-50 text-slate-400'}`}>Add Stock (+)</button>
                <button type="button" onClick={() => setAdjustData({...adjustData, type: 'REDUCTION'})} className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition ${adjustData.type === 'REDUCTION' ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 text-slate-400'}`}>Deduct Stock (-)</button>
              </div>
              <input type="number" value={adjustData.change} onChange={e => setAdjustData({...adjustData, change: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl text-center" placeholder="Quantity Units" required />
              <textarea value={adjustData.notes} onChange={e => setAdjustData({...adjustData, notes: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium h-24 resize-none" placeholder="Reason for adjustment..." required />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowAdjust(null)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest">Abort</button>
                <button type="submit" disabled={isProcessing} className="flex-1 py-4 bg-[#1A2B6D] text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50">Commit Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-3xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
              <div>
                <h3 className="text-2xl font-black text-[#1A2B6D] uppercase italic tracking-tighter">Asset Trace Ledger</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking additions & dispatches for: {currentItemName}</p>
              </div>
              <button onClick={() => setShowHistory(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#E31E24] transition"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-4">
              {historyLogs.length > 0 ? historyLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.change > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {log.change > 0 ? <ArrowUp size={18}/> : <ArrowDown size={18}/>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2B6D]">{log.type}</span>
                        <span className="text-[8px] px-2 py-0.5 bg-white rounded-full border border-slate-200 text-slate-400 font-bold">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{log.notes || 'System transaction'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${log.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{log.change > 0 ? '+' : ''}{log.change}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Final Stock: {log.finalQuantity}</p>
                  </div>
                </div>
              )) : <div className="py-20 text-center text-slate-300 italic font-black uppercase tracking-widest text-xs">No trace records available for this asset deck</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerModule;
