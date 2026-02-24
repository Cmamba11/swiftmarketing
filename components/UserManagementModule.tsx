
import React, { useState } from 'react';
import { Users, UserPlus, Fingerprint, Shield, Trash2, X, RefreshCw, Handshake, Mail, Key } from 'lucide-react';
import { User, Role, Agent } from '../types';
import { api } from '../services/api';

interface UserManagementModuleProps {
  users: User[];
  roles: Role[];
  agents: Agent[];
}

const UserManagementModule: React.FC<UserManagementModuleProps> = ({ users, roles, agents }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    roleId: '',
    agentId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.users.create(formData);
      setFormData({ username: '', password: '', name: '', roleId: '', agentId: '' });
      setShowAdd(false);
    } catch (err) {
      alert("Failed to provision user.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Revoke all access for this user?")) {
      await api.users.delete(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-swift-navy uppercase italic tracking-tighter">Personnel Directory</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cloud Access Control List</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-10 py-5 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-swift-red transition active:scale-95">
          {showAdd ? <X size={20} /> : <UserPlus size={20} />}
          {showAdd ? "Abort" : "Provision User"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3.5rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10 relative overflow-hidden">
          {isProcessing && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-swift-navy" size={48} /></div>}
          <h3 className="text-2xl font-black uppercase italic text-swift-navy mb-10 flex items-center gap-4">
             <Key size={24} className="text-swift-red" />
             Access Provisioning Interface
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Login Username</label>
               <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required placeholder="e.g. jsmith" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Initial Password</label>
               <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required placeholder="Set password" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Full Personnel Name</label>
               <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required placeholder="e.g. John Smith" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Assigned Role</label>
               <select value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required>
                 <option value="">Select Level...</option>
                 {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Link to Agent Profile</label>
               <select value={formData.agentId} onChange={e => setFormData({...formData, agentId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                 <option value="">System/Admin Only</option>
                 {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.employeeId})</option>)}
               </select>
            </div>
            <button type="submit" className="lg:col-span-5 py-6 bg-swift-red text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl mt-4 hover:bg-swift-navy transition">Commit Security Token</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {users.map(user => {
          const role = roles.find(r => r.id === user.roleId);
          const agent = agents.find(a => a.id === user.agentId);
          return (
            <div key={user.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-swift-navy group-hover:bg-swift-navy group-hover:text-white transition">
                  <Fingerprint size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-swift-navy uppercase italic">{user.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                     <span className="text-[10px] font-black text-slate-400 uppercase">@{user.username}</span>
                     <div className="h-1 w-1 bg-slate-200 rounded-full" />
                     <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-blue-100">{role?.name || 'Invalid Role'}</span>
                  </div>
                  {agent && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg w-fit border border-emerald-100">
                       <Handshake size={12}/>
                       <span className="text-[8px] font-black uppercase">Linked: {agent.employeeId}</span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(user.id)} className="p-4 bg-slate-50 text-slate-300 hover:text-red-500 rounded-2xl border border-transparent hover:border-red-100 transition">
                <Trash2 size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserManagementModule;
