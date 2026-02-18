
import React, { useState } from 'react';
import { Shield, Plus, X, Check, Trash2, LayoutDashboard, Handshake, ShoppingCart, Hammer, PhoneCall, Activity, Sparkles, Database, Settings, ShieldCheck, Lock } from 'lucide-react';
import { Role } from '../types';
import { api } from '../services/api';

const PERMISSION_METADATA = [
  { key: 'canViewPartners', label: 'Partners: View', icon: Handshake },
  { key: 'canCreatePartners', label: 'Partners: Create', icon: Plus },
  { key: 'canEditPartners', label: 'Partners: Edit', icon: Settings },
  { key: 'canDeletePartners', label: 'Partners: Delete', icon: Trash2 },
  { key: 'canViewAgents', label: 'Agents: View', icon: Shield },
  { key: 'canCreateAgents', label: 'Agents: Create', icon: Plus },
  { key: 'canViewOrders', label: 'Orders: View', icon: ShoppingCart },
  { key: 'canVerifyOrders', label: 'Orders: Sign-off', icon: ShieldCheck },
  { key: 'canApproveAsAgentHead', label: 'Auth: Agent Head Tier', icon: Lock },
  { key: 'canApproveAsAccountOfficer', label: 'Auth: Account Officer Tier', icon: Lock },
  { key: 'canViewWorkOrders', label: 'Work Orders: View', icon: Hammer },
  { key: 'canManageWorkOrders', label: 'Shop Floor: Control', icon: Activity },
  { key: 'canViewCalls', label: 'Calls: View', icon: PhoneCall },
  { key: 'canAccessAIArchitect', label: 'AI Strategy Access', icon: Sparkles },
  { key: 'canViewSecurity', label: 'Admin: Security Portal', icon: Shield },
  { key: 'canManageRoles', label: 'Admin: Modify Roles', icon: Settings },
];

const RoleManagementModule: React.FC<{ roles: Role[] }> = ({ roles }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    isSystemAdmin: false,
  });

  const togglePermission = (key: string) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key as keyof Role] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.roles.create(formData);
    setFormData({ name: '', description: '', isSystemAdmin: false });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Shield size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
           <div>
              <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
                 <Lock size={16} className="text-swift-green" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Protocol v4.6</span>
              </div>
              <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">Permissions Matrix</h2>
              <p className="text-blue-100/60 font-medium max-w-lg">Define industrial access tiers. Roles control every button and data point visible to personnel.</p>
           </div>
           <button onClick={() => setShowAdd(!showAdd)} className="px-10 py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition active:scale-95">
              {showAdd ? "Cancel Definition" : "Forge New Role"}
           </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[4rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Role Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-xl italic uppercase" placeholder="e.g. SHOP SUPERVISOR" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-medium text-sm h-32 resize-none" placeholder="Purpose of this tier..." />
                 </div>
                 <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Shield size={24} className="text-swift-red" />
                       <span className="text-xs font-black uppercase text-swift-navy">Full System Admin</span>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, isSystemAdmin: !formData.isSystemAdmin})} className={`w-14 h-8 rounded-full p-1 transition-all ${formData.isSystemAdmin ? 'bg-swift-red' : 'bg-slate-200'}`}>
                       <div className={`w-6 h-6 bg-white rounded-full transition-all ${formData.isSystemAdmin ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>
              <div className="lg:col-span-8">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-4 block">Permission Toggle Grid</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PERMISSION_METADATA.map(p => (
                       <button 
                         key={p.key} 
                         type="button" 
                         onClick={() => togglePermission(p.key)}
                         className={`p-5 rounded-2xl border-2 flex items-center justify-between group transition-all ${formData[p.key as keyof Role] ? 'bg-swift-navy text-white border-swift-navy shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                       >
                          <div className="flex items-center gap-4">
                             <p.icon size={20} className={formData[p.key as keyof Role] ? 'text-swift-green' : 'text-slate-300'} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                          </div>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${formData[p.key as keyof Role] ? 'bg-swift-green text-white' : 'bg-white border border-slate-200'}`}>
                             {formData[p.key as keyof Role] && <Check size={14} />}
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
           <button type="submit" className="w-full py-8 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl mt-12 hover:bg-swift-red transition">Forge Access Token</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roles.map(role => (
          <div key={role.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
            {role.isSystemAdmin && <div className="absolute top-0 right-0 bg-swift-red text-white text-[8px] font-black uppercase tracking-widest px-6 py-2 -rotate-45 translate-x-6 translate-y-2">Root Access</div>}
            <div className="flex items-center gap-5 mb-6">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-swift-navy group-hover:bg-swift-navy group-hover:text-white transition">
                  <Shield size={32} />
               </div>
               <div>
                  <h4 className="text-xl font-black text-swift-navy uppercase italic tracking-tight">{role.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Defined Tier</p>
               </div>
            </div>
            <p className="text-xs text-slate-500 font-medium italic mb-10 flex-1 leading-relaxed">{role.description || "No tier summary provided."}</p>
            <div className="flex flex-wrap gap-2 mb-10">
               {PERMISSION_METADATA.filter(p => role[p.key as keyof Role]).slice(0, 4).map(p => (
                 <span key={p.key} className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[8px] font-black uppercase border border-slate-100">{p.label.split(':')[0]}</span>
               ))}
               {PERMISSION_METADATA.filter(p => role[p.key as keyof Role]).length > 4 && (
                 <span className="bg-slate-50 text-slate-300 px-3 py-1 rounded-lg text-[8px] font-black uppercase border border-slate-100">+{PERMISSION_METADATA.filter(p => role[p.key as keyof Role]).length - 4} more</span>
               )}
            </div>
            <button className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-swift-navy hover:bg-swift-navy hover:text-white transition">Edit Tier Matrix</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagementModule;
