
import React, { useState } from 'react';
import { Phone, Calendar, Clock, MessageSquare, Edit2, Trash2, Search, Filter, PhoneCall, TrendingUp, CheckCircle2, ChevronDown, ChevronUp, Save, Send, User } from 'lucide-react';
import { CallReport, Customer, Agent, VisitOutcome, Role } from '../types';
import { prisma } from '../services/prisma';

interface CallReportModuleProps {
  reports: CallReport[];
  customers: Customer[];
  agents: Agent[];
  onEdit: (report: CallReport) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  permissions?: Role;
}

const CallReportModule: React.FC<CallReportModuleProps> = ({ reports, customers, agents, onEdit, onDelete, searchTerm, onSearchChange, permissions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickLog, setQuickLog] = useState({ customerId: '', agentId: '', outcome: VisitOutcome.FOLLOW_UP, notes: '', talkTime: 5 });

  const canManage = permissions?.isSystemAdmin || permissions?.canManageCalls;

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown Customer';
  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || 'Unknown Agent';

  const totalDuration = reports.reduce((acc, r) => acc + r.duration, 0);
  const conversionRate = reports.length > 0 
    ? ((reports.filter(r => r.outcome === VisitOutcome.ORDER_PLACED).length / reports.length) * 100).toFixed(1)
    : '0';

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLog.customerId || !quickLog.agentId || !quickLog.notes) return;
    
    prisma.callReport.create({
      customerId: quickLog.customerId,
      agentId: quickLog.agentId,
      date: new Date().toISOString(),
      duration: Number(quickLog.talkTime),
      outcome: quickLog.outcome,
      notes: quickLog.notes
    });

    setQuickLog({ customerId: '', agentId: '', outcome: VisitOutcome.FOLLOW_UP, notes: '', talkTime: 5 });
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-swift-red">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-swift-red text-white rounded-xl shadow-md">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-bold text-swift-navy">Call Interaction Hub</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Dispatch Log</span>
          </div>
          <form onSubmit={handleQuickLogSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Wholesaler</label>
                <select value={quickLog.customerId} onChange={(e) => setQuickLog({...quickLog, customerId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium" required>
                  <option value="">Select Target...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Agent</label>
                <select value={quickLog.agentId} onChange={(e) => setQuickLog({...quickLog, agentId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium" required>
                  <option value="">Who made the call?</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Talk Time (Mins)</label>
                <input type="number" value={quickLog.talkTime} onChange={(e) => setQuickLog({...quickLog, talkTime: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium" min="1" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Outcome</label>
                <select value={quickLog.outcome} onChange={(e) => setQuickLog({...quickLog, outcome: e.target.value as VisitOutcome})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium">
                  {Object.values(VisitOutcome).map(v => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={!quickLog.customerId || !quickLog.agentId || !quickLog.notes} className="w-full h-[46px] bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-swift-red transition shadow-lg active:scale-95 disabled:opacity-50">
                  <Send size={16} />
                  Commit Record
                </button>
              </div>
            </div>
            <textarea placeholder="Discuss specific SKUs pitched, price objections, or re-stocking requests..." value={quickLog.notes} onChange={(e) => setQuickLog({...quickLog, notes: e.target.value})} className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swift-red resize-none text-sm font-medium" required></textarea>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group">
          <div className="p-3 bg-red-50 text-swift-red w-fit rounded-2xl mb-4 group-hover:bg-swift-red group-hover:text-white transition">
            <PhoneCall size={24} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Engagements</p>
          <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{reports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group">
          <div className="p-3 bg-blue-50 text-swift-navy w-fit rounded-2xl mb-4 group-hover:bg-swift-navy group-hover:text-white transition">
            <TrendingUp size={24} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Conversion Index</p>
          <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{conversionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Clock size={24} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Cumulative Talk Time</p>
          <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{totalDuration} <span className="text-xs font-normal text-slate-400">Minutes</span></p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em] w-12"></th>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em]">Dispatch Date</th>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em]">Wholesaler</th>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em]">Sales Agent</th>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em]">Outcome</th>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em]">Talk Time</th>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em] text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <React.Fragment key={report.id}>
                <tr className={`hover:bg-slate-50 transition group ${expandedId === report.id ? 'bg-slate-50' : ''}`}>
                  <td className="px-6 py-5 text-center">
                    <button onClick={() => setExpandedId(expandedId === report.id ? null : report.id)} className="p-1.5 text-slate-400 hover:text-swift-red">
                      {expandedId === report.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-5 font-mono text-xs text-slate-400">{new Date(report.date).toLocaleDateString()}</td>
                  <td className="px-6 py-5 font-black text-slate-800 italic uppercase tracking-tighter">{getCustomerName(report.customerId)}</td>
                  <td className="px-6 py-5"><span className="text-[10px] font-black uppercase text-swift-navy bg-blue-50 px-3 py-1 rounded-xl">{getAgentName(report.agentId)}</span></td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      report.outcome === VisitOutcome.ORDER_PLACED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      report.outcome === VisitOutcome.INTERESTED ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>{report.outcome.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-600 italic">{report.duration}m</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      {canManage && (
                        <>
                          <button onClick={() => onEdit(report)} className="p-2 text-slate-400 hover:text-swift-navy transition"><Edit2 size={16} /></button>
                          <button onClick={() => onDelete(report.id)} className="p-2 text-slate-400 hover:text-swift-red transition"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === report.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl max-w-4xl ml-12">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-swift-red mb-4">Interaction Transcript</h5>
                        <p className="text-slate-700 leading-relaxed italic text-sm">"{report.notes || 'No notes archived for this call.'}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallReportModule;
