
import React, { useState } from 'react';
import { Phone, Calendar, Clock, MessageSquare, Edit2, Trash2, Search, Filter, PhoneCall, TrendingUp, CheckCircle2, ChevronDown, ChevronUp, Save, Send, User, FileText } from 'lucide-react';
import { CallReport, Partner, Agent, VisitOutcome, Role } from '../types';
import { prisma } from '../services/prisma';

interface CallReportModuleProps {
  reports: CallReport[];
  customers: Partner[];
  agents: Agent[];
  onEdit: (report: CallReport) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  permissions?: Role;
}

const CallReportModule: React.FC<CallReportModuleProps> = ({ reports, customers, agents, onEdit, onDelete, searchTerm, onSearchChange, permissions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickLog, setQuickLog] = useState({ customerId: '', agentId: '', outcome: VisitOutcome.FOLLOW_UP, summary: '', notes: '', talkTime: 5 });

  const canManage = permissions?.isSystemAdmin || permissions?.canEditCalls;

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown Customer';
  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || 'Unknown Agent';

  const totalDuration = reports.reduce((acc, r) => acc + r.duration, 0);
  const conversionRate = reports.length > 0 
    ? ((reports.filter(r => r.outcome === VisitOutcome.ORDER_PLACED).length / reports.length) * 100).toFixed(1)
    : '0';

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLog.customerId || !quickLog.agentId || !quickLog.notes || !quickLog.summary) return;
    
    prisma.callReport.create({
      customerId: quickLog.customerId,
      agentId: quickLog.agentId,
      date: new Date().toISOString(),
      duration: Number(quickLog.talkTime),
      outcome: quickLog.outcome,
      summary: quickLog.summary,
      notes: quickLog.notes
    });

    setQuickLog({ customerId: '', agentId: '', outcome: VisitOutcome.FOLLOW_UP, summary: '', notes: '', talkTime: 5 });
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
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
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Brief Discussion (Subject)</label>
                <input type="text" value={quickLog.summary} onChange={(e) => setQuickLog({...quickLog, summary: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium" placeholder="E.g. Price inquiry for industrial bags" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Talk Time (Mins)</label>
                <input type="number" value={quickLog.talkTime} onChange={(e) => setQuickLog({...quickLog, talkTime: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red text-sm font-medium" min="1" required />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={!quickLog.customerId || !quickLog.agentId || !quickLog.notes || !quickLog.summary} className="w-full h-[46px] bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-swift-red transition shadow-lg active:scale-95 disabled:opacity-50">
                  <Send size={16} />
                  Commit Record
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Interaction Notes (Transcript)</label>
              <textarea placeholder="Discuss specific SKUs pitched, price objections, or re-stocking requests..." value={quickLog.notes} onChange={(e) => setQuickLog({...quickLog, notes: e.target.value})} className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swift-red resize-none text-sm font-medium" required></textarea>
            </div>
            <div className="mt-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Outcome</label>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(VisitOutcome).map(v => (
                      <button key={v} type="button" onClick={() => setQuickLog({...quickLog, outcome: v})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${quickLog.outcome === v ? 'bg-swift-red text-white border-swift-red shadow-md' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                        {v.replace('_', ' ')}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
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
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em]">Wholesaler</th>
              <th className="px-6 py-5 text-[10px] font-black text-swift-navy uppercase tracking-[0.1em]">Interaction Recap</th>
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
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-800 italic uppercase tracking-tighter leading-none">{getCustomerName(report.customerId)}</p>
                    <p className="text-[9px] font-mono text-slate-400 uppercase mt-1.5">{new Date(report.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-md">
                      <p className="text-[10px] font-black text-swift-navy uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <FileText size={10} className="text-swift-red" />
                        {report.summary || 'General Inquiry'}
                      </p>
                      <p className="text-xs font-medium text-slate-500 italic line-clamp-2 leading-relaxed">
                        {report.notes || 'No detailed transcript recorded.'}
                      </p>
                      <p className="text-[8px] font-black uppercase text-slate-300 mt-2 tracking-widest">Authorized AO: {getAgentName(report.agentId)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      report.outcome === VisitOutcome.ORDER_PLACED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      report.outcome === VisitOutcome.INTERESTED ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>{report.outcome.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-600 italic tracking-tighter">{report.duration}m</td>
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
                    <td colSpan={6} className="px-6 py-8 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-xl max-w-4xl ml-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 -mr-8 -mt-8"><MessageSquare size={160} /></div>
                        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6 relative z-10">
                           <div className="flex items-center gap-3">
                              <div className="p-3 bg-swift-navy text-white rounded-2xl shadow-lg"><User size={20}/></div>
                              <div>
                                <h5 className="text-lg font-black text-swift-navy uppercase italic tracking-tighter">Full Interaction Ledger</h5>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{new Date(report.date).toLocaleString()} &bull; {report.duration}min Call</p>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-6 relative z-10">
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Header</p>
                            <p className="text-swift-navy font-black text-xl italic uppercase tracking-tighter">"{report.summary}"</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <FileText size={12} className="text-swift-red" />
                              Detailed Conversation Notes
                            </p>
                            <p className="text-slate-700 leading-relaxed font-medium italic bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
                              {report.notes || 'No extensive notes were archived for this session.'}
                            </p>
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
        {reports.length === 0 && (
          <div className="py-24 text-center">
            <div className="opacity-10 mb-4 flex justify-center"><Phone size={64}/></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No interaction data archived in current partition</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallReportModule;
