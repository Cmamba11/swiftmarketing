
import React, { useState } from 'react';
import { Search, Edit2, Trash2, MapPin, Building2, Plus, X, Globe, FileText, Wallet } from 'lucide-react';
// Fix: Import Partner and PartnerType instead of Customer and CustomerType
import { Partner, Role, PartnerType } from '../types';
import { prisma } from '../services/prisma';

interface CustomerModuleProps {
  // Fix: Use Partner instead of Customer
  customers: Partner[];
  onEdit: (customer: Partner) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  permissions?: Role;
}

const CustomerModule: React.FC<CustomerModuleProps> = ({ customers, onEdit, onDelete, searchTerm, onSearchChange, permissions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', contactPerson: '', location: '', address: '',
    type: PartnerType.NEW, status: 'Active Account',
    // Fix: Added missing assignedAgentId to match Partner interface
    assignedAgentId: '',
    businessCategory: 'Distributor', website: ''
  });

  // Fix: Correct permission keys to match Role interface
  const canCreate = permissions?.isSystemAdmin || permissions?.canCreatePartners;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeletePartners;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Use prisma.partner instead of prisma.wholesaler
    prisma.partner.create({ ...formData });
    setFormData({ 
      name: '', email: '', phone: '', contactPerson: '', location: '', address: '', 
      type: PartnerType.NEW, status: 'Active Account',
      assignedAgentId: '',
      businessCategory: 'Distributor', website: ''
    });
    setShowAdd(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-swift-red outline-none transition font-bold" />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-lg active:scale-95">
            {showAdd ? <X size={18} /> : <Plus size={18} />}
            {showAdd ? "Discard" : "Register Wholesaler"}
          </button>
        )}
      </div>

      {showAdd && canCreate && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-swift-navy border-b border-slate-100 pb-4">
            <Building2 size={24} className="text-swift-red" />
            Industrial Partner Enrollment
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enterprise Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="E.g. Lagos Plastic Hub" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business Category</label>
                <select value={formData.businessCategory} onChange={e => setFormData({...formData, businessCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold">
                  <option value="Distributor">Wholesale Distributor</option>
                  <option value="Retailer">Industrial Retailer</option>
                  <option value="OEM">OEM Manufacturer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Head</label>
                <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="Manager Name" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="+234..." required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Website</label>
                <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" placeholder="https://..." />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-swift-red text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-navy transition shadow-xl">
              Authorize Wholesaler Access
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-swift-navy group-hover:bg-swift-red group-hover:text-white transition-colors">
                  <Building2 size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{customer.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12} className="text-swift-red" /> {customer.location}</p>
                </div>
              </div>
              <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border border-slate-100">
                {customer.businessCategory}
              </span>
            </div>
            
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex gap-4">
                {customer.website && (
                  <a href={customer.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition"><Globe size={18} /></a>
                )}
                <span className="text-[9px] font-black uppercase text-slate-400">Contact: {customer.contactPerson}</span>
              </div>
              <div className="flex gap-2">
                {canDelete && (
                  <button onClick={() => onDelete(customer.id)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-swift-red transition border border-transparent hover:border-slate-200">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerModule;
