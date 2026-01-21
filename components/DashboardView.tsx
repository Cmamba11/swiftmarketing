
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Handshake, Target, Package, Layers, Factory } from 'lucide-react';
import { Partner, Agent, InventoryItem } from '../types';

interface DashboardProps {
  partners: Partner[];
  agents: Agent[];
  inventory: InventoryItem[];
}

const DashboardView: React.FC<DashboardProps> = ({ partners, agents, inventory }) => {
  const rollerCount = inventory.filter(i => i.productType === 'ROLLER').reduce((a, b) => a + b.quantity, 0);
  const bagCount = inventory.filter(i => i.productType === 'PACKING_BAG').reduce((a, b) => a + b.quantity, 0);

  const productBreakdown = [
    { name: 'Partner Rollers', value: rollerCount },
    { name: 'Factory Reserve Bags', value: bagCount }
  ].filter(p => p.value > 0);

  const SWIFT_NAVY = '#1A2B6D';
  const SWIFT_RED = '#E31E24';
  const COLORS = [SWIFT_RED, SWIFT_NAVY, '#3b82f6', '#8b5cf6'];

  const stats = [
    { label: 'Total Industrial Partners', value: partners.length, icon: Handshake, color: 'bg-[#1A2B6D]' },
    { label: 'Active Personnel', value: agents.length, icon: Target, color: 'bg-[#E31E24]' },
    { label: 'Current Factory Output', value: `${inventory.reduce((a, b) => a + b.quantity, 0).toLocaleString()} units`, icon: Factory, color: 'bg-[#1A2B6D]' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg group-hover:scale-110 transition`}>
                <stat.icon size={28} />
              </div>
              <span className="text-[10px] font-black text-swift-red bg-red-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-red-100">Live OS</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition duration-1000"><Package size={200} /></div>
          <h3 className="text-2xl font-black text-swift-navy mb-10 flex items-center gap-4 uppercase italic tracking-tighter">
            Inventory Partitioning
          </h3>
          <div className="h-[300px]">
            {productBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productBreakdown} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                    {productBreakdown.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic font-black uppercase tracking-widest">Awaiting Run Initialization</div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition duration-1000"><Handshake size={200} /></div>
          <h3 className="text-2xl font-black text-swift-navy mb-10 flex items-center gap-4 uppercase italic tracking-tighter">
            Regional Partner Reach
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agents.map(a => ({ name: a.name, score: a.performanceScore }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} />
                <Bar dataKey="score" fill={SWIFT_NAVY} radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
