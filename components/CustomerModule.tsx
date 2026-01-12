
import React from 'react';
import { Search, Filter, Edit2, Trash2, MapPin, Building2 } from 'lucide-react';
import { Customer } from '../types';

interface CustomerModuleProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const CustomerModule: React.FC<CustomerModuleProps> = ({ customers, onEdit, onDelete, searchTerm, onSearchChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
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
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-swift-navy font-bold transition shadow-sm">
            <Filter size={18} />
            Sort & Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Wholesaler Name</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Type</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Delivery Node</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-[0.1em] text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-red-50/20 transition group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-swift-navy/5 rounded-xl flex items-center justify-center text-swift-navy group-hover:bg-swift-navy group-hover:text-white transition-all duration-300">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 tracking-tight">{customer.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    customer.type === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    customer.type === 'EXISTING' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {customer.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-sm">
                    <MapPin size={14} className="text-swift-red" />
                    {customer.location}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${customer.status === 'Active Account' ? 'bg-emerald-500' : 'bg-swift-red animate-pulse'}`}></div>
                    <span className="text-sm text-slate-700 font-bold">{customer.status}</span>
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
