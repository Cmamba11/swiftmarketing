
import React from 'react';
import { Truck, Fuel, Gauge, Edit2, Trash2, AlertTriangle, Sparkles, Search, MapPin } from 'lucide-react';
import { LogisticsReport, SystemConfig } from '../types';

interface LogisticsModuleProps {
  reports: LogisticsReport[];
  config: SystemConfig;
  onEdit: (report: LogisticsReport) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const LogisticsModule: React.FC<LogisticsModuleProps> = ({ reports, config, onEdit, onDelete, searchTerm, onSearchChange }) => {
  const totalFuel = reports.reduce((acc, r) => acc + r.fuelUsage, 0);
  const totalDist = reports.reduce((acc, r) => acc + r.distanceCovered, 0);
  const avgFuel = reports.length > 0 ? (totalFuel / reports.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-2xl mb-4">
            <Fuel size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Avg Fuel Consumption</p>
          <p className="text-3xl font-bold text-slate-800">{avgFuel}L <span className="text-sm font-normal text-slate-400">/ delivery</span></p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50 w-fit px-2 py-1 rounded-lg">
            <Sparkles size={12} />
            AI Cap: {config.logisticsThreshold}L
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mb-4">
            <Truck size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Batch Distance</p>
          <p className="text-3xl font-bold text-slate-800">{totalDist.toLocaleString()}km <span className="text-sm font-normal text-slate-400">total</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl mb-4">
            <Gauge size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Cycle Efficiency</p>
          <p className="text-3xl font-bold text-slate-800">{config.targetEfficiencyMetric.split(' ')[0]} <span className="text-sm font-normal text-slate-400">KPI</span></p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search deliveries or vehicle IDs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800">Daily Delivery Logs</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">Automatic fuel efficiency tagging enabled</p>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent / Route</th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle ID</th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fuel Usage</th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distance</th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50 transition group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="font-bold text-slate-800">Agent {report.agentId}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono text-xs font-bold text-slate-600 border border-slate-200 shadow-inner">{report.vehicleId}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${report.fuelUsage > config.logisticsThreshold ? 'text-red-600' : 'text-slate-700'}`}>
                      {report.fuelUsage}L
                    </span>
                    {report.fuelUsage > config.logisticsThreshold && (
                      <span title="Exceeds daily AI-set fuel threshold">
                        <AlertTriangle size={14} className="text-red-500" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-600">{report.distanceCovered}km</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => onEdit(report)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-200 transition shadow-sm"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(report.id)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-600 border border-transparent hover:border-slate-200 transition shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="p-20 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Truck size={32} />
            </div>
            <p className="text-slate-500 font-bold">No Delivery Logs Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsModule;
