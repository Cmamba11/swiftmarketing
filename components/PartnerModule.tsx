
import React, { useState } from 'react';
import { Search, Edit2, Trash2, MapPin, Handshake, Plus, X, Globe, FileText, UserCheck, DollarSign, Hash, Palette, Ruler, RefreshCw, Phone, Mail } from 'lucide-react';
import { Partner, PartnerType, Role, Agent } from '../types';
import { api } from '../services/api';
import { MICRON_OPTIONS, COLOR_OPTIONS } from '../constants';

interface PartnerModuleProps {
  partners: Partner[];
  agents: Agent[]; 
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  permissions?: Role;
}

const PartnerModule: React.FC<PartnerModuleProps> = ({ partners, agents, onDelete, searchTerm, onSearchChange, permissions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '', customerId: '', email: '', phone: '', contactPerson: '', location: '', address: '',
    type: PartnerType.NEW, status: 'Active Partner',
    businessCategory: 'Major Industrialist', website: '',
    assignedAgentId: '',
    defaultRatePerKg: 15.5,
    micron: MICRON_OPTIONS[0],
    colors: [] as string[]
  });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreatePartners || !permissions;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeletePartners || !permissions;

  const toggleColor = (colorId: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId) 
        ? prev.colors.filter(c => c !== colorId) 
        : [...prev.colors, colorId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await api.partners.create({ 
      ...formData,
      assignedAgentId: formData.assignedAgentId || 'unassigned',
      defaultRatePerKg: Number(formData.defaultRatePerKg)
    });
    setFormData({ 
      name: '', customerId: '', email: '', phone: '', contactPerson: '', location: '', address: '', 
      type: PartnerType.NEW, status: 'Active Partner',
      businessCategory: 'Major Industrialist', website: '',
      assignedAgentId: '',
      defaultRatePerKg: 15.5,
      micron: MICRON_OPTIONS[0],
      colors: []
    });
    setShowAdd(false);
    setIsProcessing(false);
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search Industrial Accounts..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-swift-navy outline-none" />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-green transition shadow-lg">
            {showAdd ? <X size={18} /> : <Plus size={18} />} Enroll Account
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4 space-y-8 relative overflow-hidden">
          {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
            <Handshake size={32} className="text-swift-red" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-swift-navy">Industrial Partner Enrollment</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
              <input placeholder="Official Company Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Partner ID</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input placeholder="CID-XXXX" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black uppercase focus:bg-white transition" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Ruler size={12} /> Standard Micron</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.micron} onChange={e => setFormData({...formData, micron: e.target.value})} required>
                {MICRON_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div className="space-y-1 lg:col-span-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 mb-2"><Palette size={14} /> Approved Industrial Colors</label>
              <div className="flex flex-wrap gap-3 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                 {COLOR_OPTIONS.map(color => (
                   <button 
                    key={color.id} 
                    type="button" 
                    onClick={() => toggleColor(color.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.colors.includes(color.id) ? 'bg-white border-swift-navy shadow-md scale-105' : 'bg-slate-100 border-transparent text-slate-400'}`}
                   >
                     <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: color.hex }} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${formData.colors.includes(color.id) ? 'text-swift-navy' : 'text-slate-400'}`}>{color.label}</span>
                   </button>
                 ))}
              </div>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-black text-swift-red uppercase tracking-widest ml-1 flex items-center gap-2">
                <UserCheck size={12} /> Assigned Account Officer
              </label>
              <select className="w-full p-4 bg-red-50 border border-red-100 rounded-xl font-black italic uppercase text-swift-navy" value={formData.assignedAgentId} onChange={e => setFormData({...formData, assignedAgentId: e.target.value})}>
                <option value="">Select AO...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.region})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
              <input placeholder="Location (City)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Standard Rate ($/KG)</label>
              <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.defaultRatePerKg} onChange={e => setFormData({...formData, defaultRatePerKg: Number(e.target.value)})} required />
            </div>
          </div>
          
          <button type="submit" disabled={isProcessing} className="w-full py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-swift-navy transition-all active:scale-95 disabled:bg-slate-400">
            Authorize Account Registration
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredPartners.map((partner) => {
          const accountOfficer = agents.find(a => a.id === partner.assignedAgentId);
          
          return (
            <div key={partner.id} className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm hover:shadow-xl transition-all flex flex-col relative group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-swift-navy font-black text-3xl uppercase italic group-hover:bg-swift-navy group-hover:text-white transition-colors">{partner.name.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-3">
                       <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{partner.name}</h4>
                       <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-50 px-3 py-1 rounded border border-slate-100">{partner.customerId}</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-2.5"><MapPin size={14} className="text-swift-red" /> {partner.location}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">Enterprise Profile</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Mail size={12} /> Email</p>
                    <p className="text-xs font-bold text-swift-navy truncate">{partner.email}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Phone size={12} /> Contact</p>
                    <p className="text-xs font-bold text-swift-navy truncate">{partner.phone}</p>
                 </div>
              </div>

              <div className="flex-1 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Product Specifications</p>
                    <div className="flex flex-wrap gap-3">
                       <span className="bg-swift-navy text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-sm">
                          <Ruler size={14} className="text-swift-green" /> {partner.micron}
                       </span>
                       <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                          {partner.colors.map(cId => (
                             <div key={cId} title={COLOR_OPTIONS.find(co => co.id === cId)?.label} className="w-5 h-5 rounded-full border border-white" style={{ backgroundColor: COLOR_OPTIONS.find(co => co.id === cId)?.hex }} />
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 {accountOfficer && (
                   <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-swift-green shadow-sm"><UserCheck size={20}/></div>
                         <div>
                            <p className="text-[9px] font-black text-emerald-600 uppercase">Managing Account Officer</p>
                            <p className="text-sm font-black text-swift-navy uppercase italic">{accountOfficer.name}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-emerald-600 uppercase">Region</p>
                         <p className="text-xs font-bold text-swift-navy">{accountOfficer.region}</p>
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex justify-between items-center border-t border-slate-50 pt-8 mt-8">
                <div className="flex items-center gap-2 text-emerald-600">
                  <DollarSign size={18} />
                  <span className="text-lg font-black italic tabular-nums">${partner.defaultRatePerKg || '0.00'}<span className="text-[10px] font-bold uppercase ml-1">/kg</span></span>
                </div>
                <div className="flex gap-2">
                   {canDelete && (
                    <button onClick={() => onDelete(partner.id)} className="p-3 bg-slate-50 rounded-2xl text-slate-200 hover:text-swift-red transition border border-transparent hover:border-slate-200">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerModule;
