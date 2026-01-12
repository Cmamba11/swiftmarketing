
import React, { useState } from 'react';
import { Banknote, CheckCircle2, Clock, Edit2, Trash2, ChevronDown, ChevronUp, Info, ArrowRightCircle, Sparkles, Search } from 'lucide-react';
import { Commission, Agent, SystemConfig } from '../types';
import { db } from '../services/db';

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
      db.processBatchCommissions();
    }
  };

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || `Agent ${id}`;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 -mr-16 -mt-16">
          <Banknote size={300} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md border border-white/10">
              <Sparkles size={12} />
              AI Configured Rate: {config.recommendedCommissionRate}%
            </span>
          </div>
          <h3 className="text-indigo-100 font-medium mb-1">Total Outstanding Disbursement</h3>
          <p className="text-6xl font-extrabold tracking-tight">${commissions.filter(c => c.status === 'Pending').reduce((acc, c) => acc + c.amount, 0).toLocaleString()}</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={handleProcessBatch}
            className="px-8 py-4 bg-white text-indigo-600 font-extrabold rounded-2xl hover:bg-indigo-50 transition shadow-xl flex items-center gap-3 active:scale-95"
          >
            <ArrowRightCircle size={20} />
            Authorize Batch Payout
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by sales rep name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Disbursement Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10"></th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Representative</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payout</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Release Date</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissions.map((comm) => (
                <React.Fragment key={comm.id}>
                  <tr className={`hover:bg-indigo-50/30 transition group ${expandedId === comm.id ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => toggleExpand(comm.id)}
                        className="p-2 hover:bg-indigo-100 rounded-xl text-slate-400 hover:text-indigo-600 transition shadow-sm bg-white border border-slate-100"
                      >
                        {expandedId === comm.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold group-hover:bg-white group-hover:shadow-inner transition">
                          {getAgentName(comm.agentId).charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{getAgentName(comm.agentId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-extrabold text-slate-800">${comm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">{new Date(comm.date).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                        comm.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {comm.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {comm.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => onEdit(comm)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-200 transition shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(comm.id)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-600 border border-transparent hover:border-slate-200 transition shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === comm.id && (
                    <tr className="bg-slate-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xl ml-12 mb-4">
                          <div className="flex items-center gap-2 mb-5 text-indigo-600 font-bold text-[10px] uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-lg">
                            <Info size={14} />
                            Cycle Calculation Summary
                          </div>
                          <div className="space-y-4">
                            {comm.breakdown && comm.breakdown.length > 0 ? (
                              <>
                                {comm.breakdown.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                    <span className="text-slate-500 font-medium">{item.label}</span>
                                    <span className="font-bold text-slate-800">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2">
                                  <span className="font-bold text-slate-500">Gross Total</span>
                                  <span className="font-extrabold text-indigo-600 text-2xl">${comm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-6">
                                <p className="text-sm text-slate-400 italic">No itemized breakdown linked to this disbursement.</p>
                                <button onClick={() => onEdit(comm)} className="mt-3 text-xs font-bold text-indigo-600 hover:underline">Attach Records</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {commissions.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Banknote size={32} />
              </div>
              <p className="text-slate-500 font-bold">No Records Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionModule;
