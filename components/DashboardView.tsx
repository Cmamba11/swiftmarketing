
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Users, Target, Fuel, Banknote, Package, Layers } from 'lucide-react';
import { Customer, Agent, LogisticsReport, Commission, InventoryItem } from '../types';

interface DashboardProps {
  customers: Customer[];
  agents: Agent[];
  logistics: LogisticsReport[];
  commissions: Commission[];
  inventory: InventoryItem[];
}

const DashboardView: React.FC<DashboardProps> = ({ customers, agents, logistics, commissions, inventory }) => {
  const rollerCount = inventory.filter(i => i.productName.toLowerCase().includes('roller')).reduce((a, b) => a + b.quantity, 0);
  const bagCount = inventory.filter(i => i.productName.toLowerCase().includes('bag')).reduce((a, b) => a + b.quantity, 0);

  const productBreakdown = [
    { name: 'Rollers', value: rollerCount },
    { name: 'Packing Bags', value: bagCount },
    { name: 'Other Plastics', value: inventory.reduce((a, b) => a + b.quantity, 0) - (rollerCount + bagCount) }
  ].filter(p => p.value > 0);

  // Swift branding colors
  const SWIFT_NAVY = '#1A2B6D';
  const SWIFT_RED = '#E31E24';
  const SWIFT_LIGHT_BLUE = '#3b82f6';
  const COLORS = [SWIFT_RED, SWIFT_NAVY, SWIFT_LIGHT_BLUE, '#8b5cf6'];

  const stats = [
    { label: 'Total Wholesalers', value: customers.length, icon: Users, color: 'bg-[#1A2B6D]' },
    { label: 'Active Sales Reps', value: agents.length, icon: Target, color: 'bg-[#E31E24]' },
    { label: 'Monthly Output', value: `${inventory.reduce((a, b) => a + b.quantity, 0)} units`, icon: Layers, color: 'bg-[#1A2B6D]' },
    { label: 'Fuel Overhead', value: `${logistics.reduce((a, b) => a + b.fuelUsage, 0).toFixed(1)}L`, icon: Fuel, color: 'bg-amber-500' },
  ];

  const agentPerfData = agents.map(a => ({ name: a.name, acquisitions: a.customersAcquired }));

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-semibold text-swift-red bg-red-50 px-2 py-1 rounded-full uppercase tracking-tighter font-bold">Factory Live</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Production Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-swift-navy mb-6 flex items-center gap-2">
            <Package size={20} className="text-swift-red" />
            Stock Composition (Rollers vs Bags)
          </h3>
          <div className="h-[300px]">
            {productBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic font-medium">No production data available</div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {productBreakdown.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Performance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-swift-navy mb-6 flex items-center gap-2">
            <Target size={20} className="text-swift-red" />
            Sales Rep Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerfData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="acquisitions" fill={SWIFT_NAVY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Production Outlook */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-swift-navy mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-swift-red" />
          Production Output Trend (Units)
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { day: 'Mon', output: 450 }, { day: 'Tue', output: 520 }, { day: 'Wed', output: 480 },
              { day: 'Thu', output: 610 }, { day: 'Fri', output: 590 }, { day: 'Sat', output: 200 },
              { day: 'Sun', output: 50 }
            ]}>
              <defs>
                <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SWIFT_RED} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={SWIFT_RED} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="output" stroke={SWIFT_RED} strokeWidth={3} fillOpacity={1} fill="url(#colorOutput)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
