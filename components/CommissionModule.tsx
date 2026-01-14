import React, { useState } from 'react';
import { Banknote, CheckCircle2, Clock, Edit2, Trash2, ChevronDown, ChevronUp, Info, ArrowRightCircle, Sparkles, Search } from 'lucide-react';
import { Commission, Agent, SystemConfig } from '../types';
import { prisma } from '../services/prisma';

interface CommissionModuleProps {
  commissions: Commission[];
  agents: Agent[];
  config: SystemConfig;
  onEdit: (comm: Commission) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const CommissionModule: React.FC<CommissionModuleProps> = ({ commissions, agents, config, onEdit, onDelete, searchTerm, onSearchChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleProcessBatch = () => {
    const pendingCount = commissions.filter(c => c.status === 'Pending').length;
    if (pendingCount === 0) {
      alert("No pending commissions to process.");
      return;
    }
    if (confirm(`Authorize disbursement for all ${pendingCount} pending payouts?`)) {
      prisma.commission.processBatchCommissions();
    }
  };

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || `Agent ${id}`;

  const filteredCommissions = commissions.filter(c => 
    getAgentName(c.agentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 -mr-16 -mt-16">
          <Banknote size={300} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Revenue Hub</span>
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Sales Force Ledger</h2>
          <p className="text-indigo-100 mt-2 font-medium">Tracking performance-based payouts and industrial bonuses.</p>
        </div>
        <button 
          onClick={handleProcessBatch}
          className="relative z-10 flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-2xl active:scale-95"
        >
          <CheckCircle2 size={20} />
          Batch Payout Release
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search agents or transaction IDs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12"></th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beneficiary</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Amount</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCommissions.map((comm) => (
              <React.Fragment key={comm.id}>
                <tr className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-6">
                    <button onClick={() => toggleExpand(comm.id)} className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-indigo-600 transition border border-transparent hover:border-slate-200">
                      {expandedId === comm.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 uppercase italic tracking-tighter">{getAgentName(comm.agentId)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(comm.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xl font-black text-indigo-600 tracking-tighter">${comm.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      comm.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                    }`}>
                      {comm.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {comm.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(comm)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition shadow-sm"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(comm.id)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 transition shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
                {expandedId === comm.id && (
                  <tr className="bg-slate-50/30 animate-in fade-in slide-in-from-top-1 duration-200">
                    <td colSpan={5} className="px-8 py-8">
                      <div className="bg-white rounded-3xl border border-indigo-100 p-8 shadow-xl max-w-2xl mx-auto">
                        <div className="flex items-center gap-2 mb-6 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-lg">
                          <Info size={14} />
                          Transaction Breakdown
                        </div>
                        <div className="space-y-4">
                          {comm.breakdown?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
                              <span className="font-black text-slate-900">${item.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="pt-4 border-t border-slate-100 flex justify-between items-center font-black text-indigo-600">
                            <span className="uppercase tracking-widest text-[10px]">Net Total Disbursement</span>
                            <span className="text-2xl tracking-tighter italic">${comm.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredCommissions.length === 0 && (
          <div className="p-24 text-center italic text-slate-400 font-bold uppercase tracking-widest text-xs">Ledger Clear - No active transactions</div>
        )}
      </div>
    </div>
  );
};

export default CommissionModule;