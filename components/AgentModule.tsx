
import React, { useState } from 'react';
import { 
  UserSquare2, TrendingUp, Trash2, UserPlus, Search, X, 
  MapPin, Calendar, Mail, Phone, ShieldCheck, 
  BadgeCheck, Wallet, Target, Activity, RefreshCw 
} from 'lucide-react';
import { Agent, Role } from '../types';
import { api } from '../services/api';

interface AgentModuleProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onAssignLead: (agentId: string) => void;
  onViewStats: (agent: Agent) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  permissions?: Role;
}

const AgentModule: React.FC<AgentModuleProps> = ({ agents, onDelete, onViewStats, searchTerm, onSearchChange, permissions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', region: '', 
    role: '',
    employeeId: '', hireDate: new Date().toISOString().split('T')[0],
    emergencyContact: '',
    commissionRate: 2
  });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreateAgents || !permissions;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeleteAgents || !permissions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.agents.create(formData);
      setFormData({ 
        name: '', email: '', phone: '', region: '', role: '',
        employeeId: '', hireDate: new Date().toISOString().split('T')[0],
        emergencyContact: '',
        commissionRate: 2
      });
      setShowAdd(false);
    } catch (err) {
      alert("Failed to register agent.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER CONTROLS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or region..." 
            value={searchTerm} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-swift-navy outline-none transition" 
          />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-swift-navy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-swift-green transition shadow-lg active:scale-95">
            {showAdd ? <X size={18} /> : <UserPlus size={18} />}
            {showAdd ? "Abort Registration" : "Enroll Personnel"}
          </button>
        )}
      </div>

      {showAdd && canCreate && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10 relative overflow-hidden">
          {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
          <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4 text-swift-navy">
            <UserSquare2 size={32} className="text-swift-green" />
            Personnel Credential Activation
          </h3>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Legal Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white focus:border-swift-navy transition" placeholder="e.g. Johnathan Swift" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Agent ID Number</label>
                <input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black uppercase outline-none focus:bg-white focus:border-swift-navy transition" placeholder="AGT-000" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assigned Region</label>
                <input type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white focus:border-swift-navy transition" placeholder="e.g. Lagos North" required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Direct Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white" placeholder="personnel@swift.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contact Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white" placeholder="+234..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date of Hire</label>
                <input type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">System Role</label>
                <input 
                  type="text"
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:bg-white focus:border-swift-navy transition"
                  placeholder="e.g. Field Agent"
                  required
                />
              </div>
            </div>
            
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-swift-green mb-6">Financial Configuration</h4>
              <div className="max-w-xs space-y-2">
                <label className="text-[8px] font-bold text-white/40 uppercase ml-2">Commission Rate (%)</label>
                <input type="number" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-black outline-none focus:bg-white/10" required />
              </div>
            </div>

            <button type="submit" className="w-full py-8 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.4em] hover:bg-swift-red transition shadow-2xl active:scale-[0.98]">
              Authorize Personnel Entry
            </button>
          </form>
        </div>
      )}

      {/* AGENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col relative">
            
            {/* CARD HEADER */}
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-swift-navy rounded-[2.5rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-3 group-hover:scale-105 transition duration-500 relative overflow-hidden">
                  <UserSquare2 size={44} />
                  <div className="absolute top-0 right-0 p-2 opacity-20"><ShieldCheck size={40} /></div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-swift-navy tracking-tighter italic uppercase leading-none mb-2">{agent.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black text-swift-navy bg-white px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">{agent.employeeId}</span>
                    <span className="text-[10px] font-black text-swift-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">{agent.role}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                 <p className="text-2xl font-black text-swift-navy italic">{(agent.performanceScore || 0).toFixed(0)}%</p>
              </div>
            </div>

            {/* EXPANDED CREDENTIALS GRID */}
            <div className="p-10 grid grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 group/item">
                     <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-swift-red transition shadow-sm">
                        <MapPin size={18} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operating Region</p>
                        <p className="text-sm font-bold text-swift-navy uppercase">{agent.region}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                     <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-swift-red transition shadow-sm">
                        <Calendar size={18} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Date</p>
                        <p className="text-sm font-bold text-swift-navy">{new Date(agent.hireDate).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-4 group/item">
                     <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-swift-red transition shadow-sm">
                        <Mail size={18} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Point</p>
                        <p className="text-xs font-bold text-swift-navy truncate max-w-[150px]">{agent.email}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                     <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-swift-red transition shadow-sm">
                        <Phone size={18} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Direct Line</p>
                        <p className="text-sm font-bold text-swift-navy">{agent.phone}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* PERFORMANCE METRICS */}
            <div className="mx-10 mb-10 p-6 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center shadow-inner border border-white/5">
               <div className="flex gap-8">
                  <div>
                    <p className="text-[8px] font-black text-swift-green uppercase tracking-widest">Market Share</p>
                    <p className="text-xl font-black italic">{agent.customersAcquired || 0} <span className="text-[10px] opacity-40">Accounts</span></p>
                  </div>
                  <div className="border-l border-white/10 pl-8">
                    <p className="text-[8px] font-black text-swift-green uppercase tracking-widest">Comm. Rate</p>
                    <p className="text-xl font-black italic">{agent.commissionRate}%</p>
                  </div>
               </div>
               <div className="w-12 h-12 bg-swift-green/10 rounded-full flex items-center justify-center text-swift-green border border-swift-green/20">
                  <TrendingUp size={24} />
               </div>
            </div>
            
            {/* ACTION BAR */}
            <div className="mt-auto px-10 py-8 bg-slate-50 flex gap-4 border-t border-slate-100 items-center">
              <button 
                onClick={() => onViewStats(agent)} 
                className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl text-swift-navy text-[10px] font-black uppercase tracking-widest hover:bg-swift-navy hover:text-white transition-all shadow-sm flex items-center justify-center gap-3"
              >
                <Activity size={16} /> Audit Personnel File
              </button>
              {canDelete && (
                <button 
                  onClick={() => onDelete(agent.id)} 
                  className="p-5 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-swift-red transition shadow-sm hover:border-red-100"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="py-40 text-center space-y-4">
           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <UserSquare2 size={40} />
           </div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No Personnel Matching Search Query</p>
        </div>
      )}
    </div>
  );
};

export default AgentModule;
