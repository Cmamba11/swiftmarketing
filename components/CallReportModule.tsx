
import React, { useState } from 'react';
import { Phone, Calendar, Clock, MessageSquare, Edit2, Trash2, Search, Filter, PhoneCall, TrendingUp, CheckCircle2, ChevronDown, ChevronUp, Save, Send, User } from 'lucide-react';
import { CallReport, Customer, Agent, VisitOutcome } from '../types';
import { prisma } from '../services/db';

interface CallReportModuleProps {
  reports: CallReport[];
  customers: Customer[];
  agents: Agent[];
  onEdit: (report: CallReport) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const CallReportModule: React.FC<CallReportModuleProps> = ({ reports, customers, agents, onEdit, onDelete, searchTerm, onSearchChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickLog, setQuickLog] = useState({ customerId: '', outcome: VisitOutcome.FOLLOW_UP, notes: '' });

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown Customer';
  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || 'Unknown Agent';

  const totalDuration = reports.reduce((acc, r) => acc + r.duration, 0);
  const conversionRate = reports.length > 0 
    ? ((reports.filter(r => r.outcome === VisitOutcome.ORDER_PLACED).length / reports.length) * 100).toFixed(1)
    : '0';

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLog.customerId || !quickLog.notes) return;
    
    // Using prisma client instead of db wrapper
    prisma.callReport.create({
      customerId: quickLog.customerId,
      agentId: 'a1', // Assuming current user for quick log
      date: new Date().toISOString().split('T')[0],
      duration: 5, // Default short call
      outcome: quickLog.outcome,
      notes: quickLog.notes
    });

    setQuickLog({ customerId: '', outcome: VisitOutcome.FOLLOW_UP, notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Quick Interaction Log Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-swift-red">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-swift-red text-white rounded-xl">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-bold text-swift-navy">Quick Interaction Log (Connected to Prisma)</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Dispatch Mode</span>
        </div>
        <form onSubmit={handleQuickLogSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select 
              value={quickLog.customerId}
              onChange={(e) => setQuickLog({...quickLog, customerId: e.target.value})}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium"
              required
            >
              <option value="">Select Wholesaler...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select 
              value={quickLog.outcome}
              onChange={(e) => setQuickLog({...quickLog, outcome: e.target.value as VisitOutcome})}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium"
            >
              <option value={VisitOutcome.FOLLOW_UP}>Follow-up Needed</option>
              <option value={VisitOutcome.INTERESTED}>Interested</option>
              <option value={VisitOutcome.ORDER_PLACED}>Order Placed</option>
              <option value={VisitOutcome.NOT_INTERESTED}>Not Interested</option>
            </select>
            <div className="relative">
              <button 
                type="submit"
                disabled={!quickLog.customerId || !quickLog.notes}
                className="w-full py-3 bg-swift-navy text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 shadow-md"
              >
                <Send size={18} />
                Save Interaction
              </button>
            </div>
          </div>
          <textarea 
            placeholder="Briefly summarize the discussion... (e.g., Asked for 200 more printed bags, pricing objection)"
            value={quickLog.notes}
            onChange={(e) => setQuickLog({...quickLog, notes: e.target.value})}
            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swift-red resize-none text-sm leading-relaxed"
            required
          ></textarea>
        </form>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-red-50 text-swift-red w-fit rounded-2xl mb-4">
            <PhoneCall size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Interactions</p>
          <p className="text-3xl font-bold text-slate-800">{reports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-blue-50 text-swift-navy w-fit rounded-2xl mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Phone Conversion</p>
          <p className="text-3xl font-bold text-slate-800">{conversionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mb-4">
            <Clock size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Talk Time</p>
          <p className="text-3xl font-bold text-slate-800">{totalDuration} <span className="text-sm font-normal text-slate-400">mins</span></p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notes or customers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-swift-red outline-none transition"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-swift-navy font-bold transition shadow-sm">
          <Filter size={18} />
          By Outcome
        </button>
      </div>

      {/* interaction Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em] w-12"></th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Interaction Date</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Wholesaler</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Sales Agent</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Outcome</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Duration</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <React.Fragment key={report.id}>
                <tr className={`hover:bg-red-50/20 transition group ${expandedId === report.id ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                      className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-swift-red transition border border-transparent hover:border-slate-200"
                    >
                      {expandedId === report.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                      <Calendar size={14} className="text-swift-red" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-800">{getCustomerName(report.customerId)}</td>
                  <td className="px-6 py-5 text-sm text-slate-600">{getAgentName(report.agentId)}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      report.outcome === VisitOutcome.ORDER_PLACED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      report.outcome === VisitOutcome.INTERESTED ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                      {report.outcome.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">{report.duration}m</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition duration-300">
                      <button onClick={() => onEdit(report)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-swift-navy transition shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(report.id)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-swift-red transition shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === report.id && (
                  <tr className="bg-slate-50/30 animate-in fade-in slide-in-from-top-1 duration-200">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-xl ml-12 mb-4">
                        <div className="flex items-center gap-2 mb-4 text-swift-red font-bold text-[10px] uppercase tracking-widest bg-red-50 w-fit px-3 py-1 rounded-lg">
                          <MessageSquare size={14} />
                          Call Discussion Notes
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed italic">
                          "{report.notes || 'No discussion notes recorded for this call.'}"
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => onEdit(report)}
                            className="text-[10px] font-bold text-swift-navy hover:underline flex items-center gap-1.5 uppercase"
                          >
                            <Edit2 size={12} />
                            Full Report Editor
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <Phone size={32} />
            </div>
            <p className="text-slate-500 font-bold text-lg">No call reports logged yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallReportModule;
