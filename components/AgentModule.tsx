
import React from 'react';
import { UserSquare2, TrendingUp, Award, Clock, Edit2, Trash2, UserPlus, Search, Filter, BarChart3 } from 'lucide-react';
import { Agent } from '../types';

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
  return (
    <div className="space-y-8">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
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
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-swift-navy font-bold transition shadow-sm">
          <Filter size={18} />
          Performance Sort
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-swift-red/30 transition-all duration-500 group">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-swift-navy rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-3 transition duration-500 border border-white/20">
                  <UserSquare2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-swift-navy tracking-tight">{agent.name}</h3>
                  <p className="text-[10px] text-swift-red font-extrabold uppercase tracking-[0.2em] mt-1">{agent.role}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-1.5 text-white font-bold bg-swift-red px-3 py-1.5 rounded-xl shadow-md shadow-red-100">
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
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:bg-white transition duration-300">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Acquired</p>
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-amber-500" />
                  <span className="text-2xl font-bold text-swift-navy">{agent.customersAcquired}</span>
                </div>
              </div>
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:bg-white transition duration-300">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-800">Dispatch</span>
                </div>
              </div>
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:bg-white transition duration-300">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Session</p>
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-swift-red" />
                  <span className="text-xs font-bold text-slate-800">Live</span>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-slate-50 flex gap-4 border-t border-slate-100">
              <button 
                onClick={() => onViewStats(agent)}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-swift-navy text-sm font-bold hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-2"
              >
                <BarChart3 size={18} />
                Analytics
              </button>
              <button 
                onClick={() => onAssignLead(agent.id)}
                className="flex-1 py-3 bg-swift-red text-white rounded-2xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95"
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
