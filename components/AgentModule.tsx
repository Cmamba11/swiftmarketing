
import React, { useState } from 'react';
import { UserSquare2, TrendingUp, Award, Clock, Edit2, Trash2, UserPlus, Search, Phone, Mail, MapPin, Check, X, ShieldAlert, DollarSign, Calendar, Percent } from 'lucide-react';
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
    emergencyContact: '', baseSalary: 3000,
    commissionRate: 10,
    weeklyTarget: 500,
    monthlyTarget: 2000
  });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreateAgents || !permissions;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeleteAgents || !permissions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    prisma.salesAgent.create(formData);
    setFormData({ 
      name: '', email: '', phone: '', region: '', role: 'Wholesale Liaison',
      employeeId: '', hireDate: new Date().toISOString().split('T')[0],
      emergencyContact: '', baseSalary: 3000,
      commissionRate: 10,
      weeklyTarget: 500,
      monthlyTarget: 2000
    });
    setShowAdd(false);
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name or Agent Number..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-swift-navy outline-none transition font-bold" />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-green transition shadow-lg active:scale-95">
            {showAdd ? <X size={18} /> : <UserPlus size={18} />}
            {showAdd ? "Abort" : "Commission Agent"}
          </button>
        )}
      </div>

      {showAdd && canCreate && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-swift-navy border-b border-slate-100 pb-4">
            <UserSquare2 size={24} className="text-swift-green" />
            Personnel Credential Activation
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Personnel Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="E.g. Sarah Miller" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Agent Number</label>
                <input type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="AGT-000" required />
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="email@company.com" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="+234..." required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                <input type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="Territory" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Salary</label>
                <input type="number" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-swift-green uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Percent size={10} /> Commission Rate (%)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.commissionRate} 
                  onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} 
                  className="w-full bg-green-50 border border-green-100 rounded-xl px-4 py-3 font-black text-swift-green outline-none focus:ring-2 focus:ring-swift-green" 
                  placeholder="10.0"
                  required 
                />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-green transition shadow-xl">
              Activate Sales Force Personnel
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-swift-navy rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition duration-500">
                  <UserSquare2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-swift-navy tracking-tighter italic uppercase">{agent.name}</h3>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agent No: {agent.employeeId}</span>
                  </div>
                </div>
              </div>
              <div className="bg-swift-green text-white px-3 py-1 rounded-xl shadow-lg flex items-center gap-2 h-fit">
                <TrendingUp size={14} />
                <span className="text-xs font-black">{agent.performanceScore}%</span>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1 border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Payout</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <DollarSign size={12} className="text-swift-green" /> ${agent.baseSalary.toLocaleString()}/mo
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1 border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Comm. Tier</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Percent size={12} className="text-swift-navy" /> {agent.commissionRate}% Dynamic
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1 border border-slate-100 col-span-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Acquisitions</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Award size={12} className="text-swift-navy" /> {agent.customersAcquired} Targets
                </div>
              </div>
            </div>
            
            <div className="mt-auto px-8 py-6 bg-slate-50 flex gap-4 border-t border-slate-100 items-center">
              <button onClick={() => onViewStats(agent)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-swift-navy text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-sm">Audit Records</button>
              {canDelete && (
                <button onClick={() => onDelete(agent.id)} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-200 hover:text-swift-red transition shadow-sm">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {agents.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <UserSquare2 size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-black uppercase tracking-widest text-slate-400 text-xs">No sales force registered</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentModule;
