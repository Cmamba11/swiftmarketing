
import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, MapPin, Building2, Plus, X, Check } from 'lucide-react';
import { Customer, CustomerType } from '../types';
import { prisma } from '../services/prisma';

interface CustomerModuleProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const CustomerModule: React.FC<CustomerModuleProps> = ({ customers, onEdit, onDelete, searchTerm, onSearchChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    type: CustomerType.NEW,
    status: 'Active Account'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    prisma.wholesaler.create({
      ...formData,
      assignedAgentId: 'a1', // Default to head agent
      productsPitched: []
    });
    setFormData({ name: '', email: '', location: '', type: CustomerType.NEW, status: 'Active Account' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search wholesalers or locations..."
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
            {showAdd ? <X size={18} /> : <Plus size={18} />}
            {showAdd ? "Cancel" : "Register Wholesaler"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-[#1A2B6D] p-8 rounded-[2.5rem] text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
            <Building2 size={24} className="text-swift-red" />
            New Wholesaler Profile
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Company Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                placeholder="Industrial Plastics LLC" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Procurement Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                placeholder="orders@company.com" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Delivery Node</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:bg-white/20 transition font-bold"
                placeholder="Zone A - Pier 4" required
              />
            </div>
            <div className="flex gap-3">
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as CustomerType})}
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition font-bold"
              >
                {Object.values(CustomerType).map(t => <option key={t} value={t} className="text-black">{t}</option>)}
              </select>
              <button type="submit" className="px-6 py-3 bg-[#E31E24] text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition shadow-lg">
                <Check size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.2em]">Wholesaler Name</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.2em]">Type</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.2em]">Delivery Node</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.2em] text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-red-50/20 transition group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A2B6D]/5 rounded-xl flex items-center justify-center text-[#1A2B6D] group-hover:bg-[#1A2B6D] group-hover:text-white transition-all duration-300">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 tracking-tight">{customer.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    customer.type === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    customer.type === 'EXISTING' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {customer.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-slate-600 font-black text-xs uppercase tracking-tight">
                    <MapPin size={14} className="text-[#E31E24]" />
                    {customer.location}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${customer.status === 'Active Account' ? 'bg-emerald-500' : 'bg-[#E31E24] animate-pulse'}`}></div>
                    <span className="text-[10px] text-slate-700 font-black uppercase">{customer.status}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition duration-300">
                    <button onClick={() => onEdit(customer)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-swift-navy transition shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(customer.id)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-swift-red transition shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <Building2 size={32} />
            </div>
            <p className="text-slate-500 font-bold text-lg">No wholesalers found in database</p>
            <p className="text-sm text-slate-400 font-medium">Try updating your search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerModule;
