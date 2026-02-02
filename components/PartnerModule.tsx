
import React, { useState } from 'react';
import { Search, Edit2, Trash2, MapPin, Handshake, Plus, X, Globe, FileText, Wallet, PackageOpen, Weight } from 'lucide-react';
import { Partner, PartnerType, Role, InventoryItem } from '../types';
import { prisma } from '../services/prisma';

interface PartnerModuleProps {
  partners: Partner[];
  inventory: InventoryItem[];
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  permissions?: Role;
}

const PartnerModule: React.FC<PartnerModuleProps> = ({ partners, inventory, onDelete, searchTerm, onSearchChange, permissions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', contactPerson: '', location: '', address: '',
    type: PartnerType.NEW, status: 'Active Partner',
    taxId: '', businessCategory: 'Major Industrialist', creditLimit: 25000, website: ''
  });

  const canCreate = permissions?.isSystemAdmin || permissions?.canCreatePartners;
  const canDelete = permissions?.isSystemAdmin || permissions?.canDeletePartners;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    prisma.partner.create({ ...formData });
    setShowAdd(false);
  };

  const filteredPartners = partners.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search Partners..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-8 py-3 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-lg">
            {showAdd ? <X size={18} /> : <Plus size={18} />} Enroll Partner
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4 space-y-6">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-swift-navy border-b border-slate-100 pb-4">Industrial Partner Enrollment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <input placeholder="Partner Enterprise Name" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input placeholder="Location (City)" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, location: e.target.value})} required />
            <input placeholder="Tax ID" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, taxId: e.target.value})} required />
            <input placeholder="Contact Head" className="p-4 border rounded-xl font-bold" onChange={e => setFormData({...formData, contactPerson: e.target.value})} required />
          </div>
          <button type="submit" className="w-full py-4 bg-swift-red text-white rounded-xl font-black uppercase tracking-widest shadow-xl">Authorize Access</button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredPartners.map((partner) => {
          const partnerAssets = inventory.filter(i => i.partnerId === partner.id);
          return (
            <div key={partner.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-swift-navy font-black text-2xl uppercase shadow-inner">{partner.name.charAt(0)}</div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{partner.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12} className="text-swift-red" /> {partner.location}</p>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-100">Industrial Partner</span>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><PackageOpen size={14} className="text-swift-red" /> Branded Partner Asset Deck</h5>
                {partnerAssets.length > 0 ? (
                  <div className="space-y-3">
                    {partnerAssets.map(asset => (
                      <div key={asset.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                        <span className="text-xs font-black uppercase italic text-slate-700 tracking-tight">{asset.productName}</span>
                        <div className="flex items-center gap-4">
                          {asset.totalKg && (
                            <div className="flex items-center gap-1 text-swift-red font-black italic text-xs">
                              <Weight size={12} />
                              <span>{asset.totalKg}kg</span>
                            </div>
                          )}
                          <span className="text-lg font-black text-swift-navy tracking-tighter">{asset.quantity} <span className="text-[8px] text-slate-400 uppercase">Unit Vol</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] italic text-slate-400 font-bold uppercase tracking-widest bg-white/50 p-4 rounded-xl border border-dashed border-slate-200 text-center">Awaiting initial asset deployment</p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-50 pt-6">
                {canDelete && (
                  <button onClick={() => onDelete(partner.id)} className="p-3 bg-slate-50 rounded-xl text-slate-200 hover:text-swift-red transition border border-transparent hover:border-slate-100">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerModule;
