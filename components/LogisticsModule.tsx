
import React, { useState } from 'react';
import { Truck, Fuel, Gauge, Edit2, Trash2, AlertTriangle, Sparkles, Search, MapPin, Plus, X, Check } from 'lucide-react';
import { LogisticsReport, SystemConfig } from '../types';
import { prisma } from '../services/prisma';

interface LogisticsModuleProps {
  reports: LogisticsReport[];
  config: SystemConfig;
  onEdit: (report: LogisticsReport) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const LogisticsModule: React.FC<LogisticsModuleProps> = ({ reports, config, onEdit, onDelete, searchTerm, onSearchChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    agentId: '',
    vehicleId: 'VAN-00',
    fuelUsage: 0,
    distanceCovered: 0
  });

  const totalFuel = reports.reduce((acc, r) => acc + r.fuelUsage, 0);
  const totalDist = reports.reduce((acc, r) => acc + r.distanceCovered, 0);
  const avgFuel = reports.length > 0 ? (totalFuel / reports.length).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    prisma.logistics.create({
      ...formData,
      fuelUsage: Number(formData.fuelUsage),
      distanceCovered: Number(formData.distanceCovered)
    });
    setFormData({ agentId: '', vehicleId: 'VAN-00', fuelUsage: 0, distanceCovered: 0 });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full group-hover:scale-110 transition duration-500"></div>
          <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-2xl mb-4 relative z-10">
            <Fuel size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1 relative z-10">Avg Fuel Consumption</p>
          <p className="text-4xl font-black text-[#1A2B6D] relative z-10">{avgFuel}L <span className="text-xs font-bold text-slate-400 uppercase">/ delivery</span></p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-amber-600 font-black uppercase tracking-[0.2em] bg-amber-50 w-fit px-3 py-1.5 rounded-xl">
            <Sparkles size={12} />
            AI Limit: {config.logisticsThreshold}L
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mb-4">
            <Truck size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Batch Distance</p>
          <p className="text-4xl font-black text-[#1A2B6D]">{totalDist.toLocaleString()}km <span className="text-xs font-bold text-slate-400 uppercase">total</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group">
          <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl mb-4">
            <Gauge size={24} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Cycle Efficiency</p>
          <p className="text-4xl font-black text-[#1A2B6D]">{config.targetEfficiencyMetric.split(' ')[0]} <span className="text-xs font-bold text-slate-400 uppercase">KPI</span></p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search deliveries or vehicle IDs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#E31E24] outline-none transition"
          />
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center justify-center gap-3 px-8 py-3 bg-[#1A2B6D] text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition shadow-xl"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
          {showAdd ? "Cancel" : "Log Delivery"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#1A2B6D] p-10 rounded-[3rem] text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4 border-l-4 border-[#E31E24] pl-6">
            New Logistics Dispatch Entry
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Agent ID</label>
              <input 
                type="text" 
                value={formData.agentId}
                onChange={e => setFormData({...formData, agentId: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                placeholder="a1" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Vehicle Reg</label>
              <input 
                type="text" 
                value={formData.vehicleId}
                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold font-mono uppercase"
                placeholder="VAN-123" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Fuel (Liters)</label>
              <input 
                type="number" 
                value={formData.fuelUsage}
                onChange={e => setFormData({...formData, fuelUsage: Number(e.target.value)})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Distance (KM)</label>
              <input 
                type="number" 
                value={formData.distanceCovered}
                onChange={e => setFormData({...formData, distanceCovered: Number(e.target.value)})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-[#E31E24] text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition shadow-lg">
              <Check size={20} className="mx-auto" />
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-black text-[#1A2B6D] uppercase italic tracking-tighter">Daily Delivery Ledger</h3>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Automatic fuel efficiency tagging enabled</p>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent / Route</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle ID</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuel Usage</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50 transition group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#1A2B6D]" />
                    <span className="font-black text-[#1A2B6D] uppercase tracking-tighter italic">Agent {report.agentId}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-slate-100 rounded-xl font-mono text-[10px] font-black text-slate-600 border border-slate-200 uppercase">{report.vehicleId}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black ${report.fuelUsage > config.logisticsThreshold ? 'text-[#E31E24]' : 'text-slate-700'}`}>
                      {report.fuelUsage}L
                    </span>
                    {report.fuelUsage > config.logisticsThreshold && (
                      <span title="Exceeds daily AI-set fuel threshold">
                        <AlertTriangle size={16} className="text-[#E31E24] animate-pulse" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-black text-slate-500">{report.distanceCovered}km</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                    <button onClick={() => onEdit(report)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-200 transition shadow-sm"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(report.id)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-[#E31E24] border border-transparent hover:border-slate-200 transition shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="p-24 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Truck size={32} />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Delivery Logs Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsModule;
