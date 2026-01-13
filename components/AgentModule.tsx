
import React, { useState } from 'react';
import { UserSquare2, TrendingUp, Award, Clock, Edit2, Trash2, UserPlus, Search, Filter, BarChart3, Plus, X, Check } from 'lucide-react';
import { Agent } from '../types';
import { prisma } from '../services/prisma';

interface AgentModuleProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onAssignLead: (agentId: string) => void;
  onViewStats: (agent: Agent) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const AgentModule: React.FC<AgentModuleProps> = ({ agents, onEdit, onDelete, onAssignLead, onViewStats, searchTerm, onSearchChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Industrial Account Rep' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    prisma.salesAgent.create(formData);
    setFormData({ name: '', role: 'Industrial Account Rep' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search sales force..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-swift-red outline-none transition"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#1A2B6D] text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg active:scale-95"
          >
            {showAdd ? <X size={18} /> : <UserPlus size={18} />}
            {showAdd ? "Cancel" : "Onboard Agent"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-[#1A2B6D] p-8 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
            <UserSquare2 size={24} className="text-swift-red" />
            New Agent Commissioned
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                placeholder="Michael Thompson" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Assigned Role</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
              >
                <option value="Industrial Account Rep">Industrial Account Rep</option>
                <option value="Regional Sales Head">Regional Sales Head</option>
                <option value="Junior Sales Associate">Junior Sales Associate</option>
                <option value="Wholesale Liaison">Wholesale Liaison</option>
              </select>
            </div>
            <button type="submit" className="w-full py-3 bg-[#E31E24] text-white rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition shadow-lg flex items-center justify-center gap-2">
              <Check size={20} />
              Onboard to Swift Force
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-swift-red/30 transition-all duration-500 group">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-[#1A2B6D] rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition duration-500 border border-white/20">
                  <UserSquare2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A2B6D] tracking-tighter italic uppercase">{agent.name}</h3>
                  <p className="text-[10px] text-[#E31E24] font-black uppercase tracking-[0.2em] mt-1">{agent.role}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-1.5 text-white font-black bg-[#E31E24] px-4 py-2 rounded-2xl shadow-xl shadow-red-900/10">
                  <TrendingUp size={16} />
                  <span className="text-sm">{agent.performanceScore}%</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => onEdit(agent)} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl text-slate-400 hover:text-swift-navy border border-slate-100 transition shadow-sm"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(agent.id)} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl text-slate-400 hover:text-swift-red border border-slate-100 transition shadow-sm"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-3 gap-5">
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:bg-white transition duration-300 group/stat">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest group-hover/stat:text-[#E31E24]">Acquired</p>
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-amber-500" />
                  <span className="text-2xl font-black text-[#1A2B6D]">{agent.customersAcquired}</span>
                </div>
              </div>
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:bg-white transition duration-300">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-800 uppercase">Dispatch</span>
                </div>
              </div>
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:bg-white transition duration-300">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Session</p>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-[#E31E24]" />
                  <span className="text-[10px] font-black text-slate-800 uppercase">Live</span>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-slate-50 flex gap-4 border-t border-slate-100">
              <button 
                onClick={() => onViewStats(agent)}
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[#1A2B6D] text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-2"
              >
                <BarChart3 size={18} />
                Analytics
              </button>
              <button 
                onClick={() => onAssignLead(agent.id)}
                className="flex-1 py-4 bg-[#E31E24] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition shadow-xl shadow-red-900/10 flex items-center justify-center gap-2 active:scale-95"
              >
                <UserPlus size={18} />
                Assign Node
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentModule;
