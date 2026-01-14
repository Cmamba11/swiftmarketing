
import React, { useState } from 'react';
import { UserSquare2, TrendingUp, Award, Clock, Edit2, Trash2, UserPlus, Search, Phone, Mail, MapPin, Check, X, ShieldAlert, DollarSign, Calendar } from 'lucide-react';
import { Agent, Role } from '../types';
import { prisma } from '../services/prisma';

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

const AgentModule: React.FC<AgentModuleProps> = ({ agents, onEdit, onDelete, onAssignLead, onViewStats, searchTerm, onSearchChange, permissions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', region: '', role: 'Wholesale Liaison',
    employeeId: '', hireDate: new Date().toISOString().split('T')[0],
    emergencyContact: '', baseSalary: 3000
  });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreate;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDelete;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    prisma.salesAgent.create(formData);
    setFormData({ 
      name: '', email: '', phone: '', region: '', role: 'Wholesale Liaison',
      employeeId: '', hireDate: new Date().toISOString().split('T')[0],
      emergencyContact: '', baseSalary: 3000
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name or Employee ID..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-swift-red outline-none transition font-bold" />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-lg active:scale-95">
            {showAdd ? <X size={18} /> : <UserPlus size={18} />}
            {showAdd ? "Abort" : "Commission Agent"}
          </button>
        )}
      </div>

      {showAdd && canCreate && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-swift-navy border-b border-slate-100 pb-4">
            <UserSquare2 size={24} className="text-swift-red" />
            Personnel Credential Activation
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Personnel Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="E.g. Sarah Miller" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                <input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="EMP-000" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Specific Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold">
                  <option value="Industrial Account Rep">Industrial Account Rep</option>
                  <option value="Regional Sales Head">Regional Sales Head</option>
                  <option value="Wholesale Liaison">Wholesale Liaison</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hire Date</label>
                <input type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact Info</label>
                <input type="text" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="Contact Name & Phone" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Salary ($)</label>
                <input type="number" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" required />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-xl">
              Activate Sales Force Personnel
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-swift-navy rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition duration-500">
                  <UserSquare2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-swift-navy tracking-tighter italic uppercase">{agent.name}</h3>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {agent.employeeId}</span>
                    <span className="text-[8px] font-black text-swift-red uppercase">Since {new Date(agent.hireDate).getFullYear()}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="bg-swift-red text-white px-3 py-1 rounded-xl shadow-lg flex items-center gap-2">
                  <TrendingUp size={14} />
                  <span className="text-xs font-black">{agent.performanceScore}%</span>
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{agent.region}</span>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contact Info</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Phone size={12} className="text-swift-red" /> {agent.phone}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Payout</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <DollarSign size={12} className="text-swift-red" /> ${agent.baseSalary.toLocaleString()}/mo
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Emergency Safety</span>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 truncate">
                   <ShieldAlert size={12} className="text-amber-600" /> {agent.emergencyContact}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Acquisitions</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Award size={12} className="text-swift-navy" /> {agent.customersAcquired} Targets
                </div>
              </div>
            </div>
            
            <div className="mt-auto px-8 py-6 bg-slate-50 flex gap-4 border-t border-slate-100 items-center">
              <button onClick={() => onViewStats(agent)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-swift-navy text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-sm">Audit Records</button>
              <div className="flex gap-2">
                {canDelete && (
                  <button onClick={() => onDelete(agent.id)} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-swift-red transition"><Trash2 size={18} /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentModule;
