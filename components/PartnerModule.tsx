
import React, { useState } from 'react';
import { Search, Edit2, Trash2, MapPin, Handshake, Plus, X, Globe, FileText, Wallet, PackageOpen, Weight, UserCheck, DollarSign } from 'lucide-react';
import { Partner, PartnerType, Role, InventoryItem, Agent } from '../types';
import { prisma } from '../services/prisma';

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
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', contactPerson: '', location: '', address: '',
    type: PartnerType.NEW, status: 'Active Partner',
    businessCategory: 'Major Industrialist', website: '',
    assignedAgentId: '',
    defaultRatePerKg: 15.5
  });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreatePartners;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeletePartners;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assignedAgentId) {
      alert("Please assign an Account Officer (Sales Agent) to this partner.");
      return;
    }
    prisma.partner.create({ 
      ...formData,
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
  };

  const filteredPartners = partners.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search Partners..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-swift-navy outline-none" />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-lg">
            {showAdd ? <X size={18} /> : <Plus size={18} />} Enroll Partner
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
            <Handshake size={32} className="text-swift-red" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-swift-navy">Industrial Partner Enrollment</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Name</label>
              <input placeholder="Partner Enterprise Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-black text-swift-red uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserCheck size={12} /> Assigned Account Officer
              </label>
              <select 
                className="w-full p-4 bg-red-50 border border-red-100 rounded-xl font-black italic uppercase text-swift-navy" 
                value={formData.assignedAgentId} 
                onChange={e => setFormData({...formData, assignedAgentId: e.target.value})} 
                required
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
          
          <button type="submit" className="w-full py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-swift-navy transition-all active:scale-95">
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
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-swift-navy font-black text-2xl uppercase shadow-inner group-hover:bg-swift-navy group-hover:text-white transition-colors">{partner.name.charAt(0)}</div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{partner.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12} className="text-swift-red" /> {partner.location}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-100">Industrial Partner</span>
                  {accountOfficer && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-lg border border-red-100">
                      <UserCheck size={10} className="text-swift-red" />
                      <span className="text-[8px] font-black text-swift-red uppercase tracking-widest">AO: {accountOfficer.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                    <DollarSign size={10} className="text-emerald-600" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Rate: ${partner.defaultRatePerKg || '0.00'}/kg</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6 flex-1">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><PackageOpen size={14} className="text-swift-red" /> Branded Partner Asset Deck</h5>
                {partnerAssets.length > 0 ? (
                  <div className="space-y-3">
                    {partnerAssets.map(asset => (
                      <div key={asset.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                        <span className="text-xs font-black uppercase italic text-slate-700 tracking-tight">{asset.productName}</span>
                        <div className="flex items-center gap-4">
                          {asset.totalKg && (
                            <div className="flex items-center gap-1 text-swift-red font-black italic text-xs">
                              <Weight size={12} />
                              <span>{asset.totalKg}kg</span>
                            </div>
                          )}
                          <span className="text-lg font-black text-swift-navy tracking-tighter">{asset.quantity} <span className="text-[8px] text-slate-400 uppercase">Unit Vol</span></span>
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
                  <button onClick={() => onDelete(partner.id)} className="p-3 bg-slate-50 rounded-xl text-slate-200 hover:text-swift-red transition border border-transparent hover:border-slate-100">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerModule;
