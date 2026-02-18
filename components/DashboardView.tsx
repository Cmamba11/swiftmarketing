
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Handshake, Target, Package, Layers, Factory, ShoppingCart, CheckCircle2, DollarSign } from 'lucide-react';
import { Partner, Agent, Order } from '../types';

interface DashboardProps {
  partners: Partner[];
  agents: Agent[];
  orders?: Order[];
}

const DashboardView: React.FC<DashboardProps> = ({ partners, agents, orders = [] }) => {
  const totalOrders = orders.length;
  const fulfilledOrders = orders.filter(o => o.status === 'CLOSED').length;
  const fulfillmentRate = totalOrders > 0 ? ((fulfilledOrders / totalOrders) * 100).toFixed(0) : 0;

  const totalSalesRevenue = orders
    .filter(o => o.status === 'CLOSED' || o.status === 'PARTIALLY_SETTLED')
    .reduce((a, b) => a + b.totalValue, 0);

  const stats = [
    { label: 'Strategic Accounts', value: partners.length, icon: Handshake, color: 'bg-swift-navy' },
    { label: 'Settlement Velocity', value: `${fulfillmentRate}%`, icon: TrendingUp, color: 'bg-swift-green' },
    { label: 'Active Pipeline', value: totalOrders, icon: ShoppingCart, color: 'bg-swift-navy' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition duration-700"><stat.icon size={120} /></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg group-hover:rotate-6 transition`}>
                <stat.icon size={28} />
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-100">Live Index</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 relative z-10">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none relative z-10">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-swift-navy p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition duration-1000 rotate-12"><DollarSign size={220} /></div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 flex items-center gap-4">
              <TrendingUp size={28} className="text-swift-green" />
              Settled Revenue Attribution
            </h3>
            <p className="text-5xl font-black italic text-swift-green mb-2 tracking-tighter">${totalSalesRevenue.toLocaleString()}</p>
            <p className="text-blue-100/60 text-sm font-medium uppercase tracking-widest">Aggregate Market Capitalization</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm relative group overflow-hidden flex flex-col">
          <h3 className="text-3xl font-black text-swift-navy mb-10 flex items-center gap-4 uppercase italic tracking-tighter">
            <CheckCircle2 size={28} className="text-swift-green" />
            Order Funnel Performance
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-10 px-6">
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Settlement Progress</p>
                   <p className="text-3xl font-black text-swift-navy italic tracking-tighter">{fulfilledOrders} / {totalOrders}</p>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                   <div className="h-full bg-swift-green rounded-full shadow-lg transition-all duration-1000" style={{ width: `${fulfillmentRate}%` }} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Backlog Depth</p>
                   <p className="text-2xl font-black text-swift-navy italic">{(totalOrders - fulfilledOrders).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Contract Velocity</p>
                   <p className="text-2xl font-black text-emerald-700 italic">High-Active</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
