
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, UserSquare2, Truck, Banknote, Sparkles, Menu, X, Plus, Package, BarChart3, TrendingUp, Droplets, MapPin, Search, Bell, Settings, PhoneCall, Database
} from 'lucide-react';
import { ViewState, CustomerType, Agent, Customer, LogisticsReport, Commission, CallReport, VisitOutcome } from './types';
import { db, prisma } from './services/db';
import DashboardView from './components/DashboardView';
import CustomerModule from './components/CustomerModule';
import AgentModule from './components/AgentModule';
import LogisticsModule from './components/LogisticsModule';
import CommissionModule from './components/CommissionModule';
import AIArchitect from './components/AIArchitect';
import ProductionModule from './components/ProductionModule';
import CallReportModule from './components/CallReportModule';
import PrismaExplorer from './components/PrismaExplorer';

const SwiftLogo = ({ className = "h-12" }: { className?: string }) => (
  <svg viewBox="0 0 300 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="65" r="45" fill="#E31E24" />
    <path d="M95 60 Q107.5 50 120 60 T145 60" stroke="white" strokeWidth="2" fill="none" />
    <path d="M95 65 Q107.5 55 120 65 T145 65" stroke="white" strokeWidth="2" fill="none" />
    <path d="M95 70 Q107.5 60 120 70 T145 70" stroke="white" strokeWidth="2" fill="none" />
    <rect x="90" y="65" width="160" height="55" rx="12" fill="#1A2B6D" />
    <text x="100" y="108" fill="white" fontSize="48" fontWeight="900" style={{ fontFamily: 'Arial Black, sans-serif' }}>swift</text>
    <text x="95" y="132" fill="#E31E24" fontSize="14" fontWeight="bold" letterSpacing="2" style={{ fontFamily: 'Arial, sans-serif' }}>PLASTICS INC.</text>
    <line x1="95" y1="145" x2="125" y2="145" stroke="#E31E24" strokeWidth="1" />
    <text x="135" y="148" fill="#E31E24" fontSize="10" fontWeight="bold" style={{ fontFamily: 'Arial, sans-serif' }}>EST. 2022</text>
    <line x1="205" y1="145" x2="235" y2="145" stroke="#E31E24" strokeWidth="1" />
  </svg>
);

const Header = () => (
  <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40 shadow-sm">
    <div className="flex items-center gap-4">
      <SwiftLogo className="h-16" />
    </div>
    
    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Global search..." 
          className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-slate-400"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2.5 text-slate-400 hover:text-swift-red hover:bg-red-50 rounded-xl transition-all">
          <Bell size={20} />
        </button>
        <button className="p-2.5 text-slate-400 hover:text-swift-navy hover:bg-blue-50 rounded-xl transition-all">
          <Settings size={20} />
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-swift-navy">Admin User</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Super Administrator</p>
          </div>
          <div className="w-10 h-10 bg-swift-navy rounded-xl flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
            AD
          </div>
        </div>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dbState, setDbState] = useState(db.get());
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedAgentStats, setSelectedAgentStats] = useState<Agent | null>(null);

  useEffect(() => {
    const handleUpdate = () => setDbState(db.get());
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const filteredCustomers = useMemo(() => 
    dbState.customers.filter(c => 
      c.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      c.location.toLowerCase().includes(globalSearch.toLowerCase())
    ), [dbState.customers, globalSearch]);

  const filteredAgents = useMemo(() => 
    dbState.agents.filter(a => 
      a.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      a.role.toLowerCase().includes(globalSearch.toLowerCase())
    ), [dbState.agents, globalSearch]);

  const filteredLogistics = useMemo(() => 
    dbState.logistics.filter(l => {
      const agent = dbState.agents.find(a => a.id === l.agentId);
      return agent?.name.toLowerCase().includes(globalSearch.toLowerCase()) || l.vehicleId.toLowerCase().includes(globalSearch.toLowerCase());
    }), [dbState.logistics, dbState.agents, globalSearch]);

  const filteredCommissions = useMemo(() => 
    dbState.commissions.filter(c => {
      const agent = dbState.agents.find(a => a.id === c.agentId);
      return agent?.name.toLowerCase().includes(globalSearch.toLowerCase());
    }), [dbState.commissions, dbState.agents, globalSearch]);

  const filteredCallReports = useMemo(() => 
    dbState.callReports.filter(r => {
      const customer = dbState.customers.find(c => c.id === r.customerId);
      return customer?.name.toLowerCase().includes(globalSearch.toLowerCase()) || r.notes.toLowerCase().includes(globalSearch.toLowerCase());
    }), [dbState.callReports, dbState.customers, globalSearch]);

  const handleNewEntry = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAssignLead = (agentId: string) => {
    setEditingItem({ assignedAgentId: agentId });
    setActiveView('CUSTOMERS');
    setShowModal(true);
  };

  const handleDelete = (id: string, view: ViewState) => {
    if (!confirm('Permanently delete this record? This action cannot be undone.')) return;
    switch (view) {
      case 'CUSTOMERS': prisma.customer.delete(id); break;
      case 'AGENTS': prisma.agent.delete(id); break;
      case 'LOGISTICS': prisma.logistics.delete(id); break;
      case 'COMMISSIONS': prisma.commission.delete(id); break;
      case 'PRODUCTION': prisma.inventory.delete(id); break;
      case 'CALL_REPORTS': prisma.callReport.delete(id); break;
    }
    if (editingItem?.id === id) {
      setEditingItem(null);
      setShowModal(false);
    }
  };

  const getModalTitle = () => {
    const prefix = editingItem?.id ? 'Edit' : 'New';
    switch (activeView) {
      case 'CUSTOMERS': return `${prefix} Wholesaler/Customer`;
      case 'AGENTS': return `${prefix} Sales Rep`;
      case 'PRODUCTION': return `${prefix} Production Item`;
      case 'LOGISTICS': return `${prefix} Delivery Log`;
      case 'COMMISSIONS': return `${prefix} Commission Payout`;
      case 'CALL_REPORTS': return `${prefix} Call Report`;
      default: return `${prefix} Entry`;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem?.id;
    
    try {
      if (activeView === 'CUSTOMERS') {
        const payload = {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          location: formData.get('location') as string,
          type: (formData.get('type') as CustomerType) || CustomerType.NEW,
          assignedAgentId: (formData.get('assignedAgentId') as string) || 'a1',
          productsPitched: editingItem?.productsPitched || [],
          status: (formData.get('status') as string) || 'Active'
        };
        id ? prisma.customer.update(id, payload) : prisma.customer.create(payload);
      } else if (activeView === 'AGENTS') {
        const payload = {
          name: formData.get('name') as string,
          role: formData.get('role') as string,
          performanceScore: parseInt(formData.get('perf') as string) || 0,
          customersAcquired: editingItem?.customersAcquired || 0
        };
        id ? prisma.agent.update(id, payload) : prisma.agent.create(payload);
      } else if (activeView === 'PRODUCTION') {
        const payload = {
          customerId: formData.get('customerId') as string,
          productName: formData.get('productName') as string,
          quantity: parseInt(formData.get('quantity') as string) || 0,
          unit: formData.get('unit') as string || 'bales',
          status: (editingItem?.status as any) || 'In Stock',
          lastRestocked: editingItem?.lastRestocked || new Date().toISOString().split('T')[0]
        };
        id ? prisma.inventory.update(id, { quantity: payload.quantity }) : prisma.inventory.create(payload);
      } else if (activeView === 'LOGISTICS') {
        const payload = {
          agentId: formData.get('agentId') as string,
          vehicleId: formData.get('vehicleId') as string,
          fuelUsage: parseFloat(formData.get('fuel') as string) || 0,
          distanceCovered: parseFloat(formData.get('dist') as string) || 0,
          date: (formData.get('date') as string) || new Date().toISOString().split('T')[0]
        };
        id ? prisma.logistics.update(id, payload) : prisma.logistics.create(payload);
      } else if (activeView === 'COMMISSIONS') {
        const breakdownStr = formData.get('breakdown') as string;
        const breakdown = breakdownStr ? breakdownStr.split('\n').filter(line => line.includes(':')).map(line => {
          const [label, val] = line.split(':');
          return { label: label.trim(), amount: parseFloat(val.trim()) || 0 };
        }) : [];

        const payload = {
          agentId: formData.get('agentId') as string,
          amount: parseFloat(formData.get('amount') as string) || 0,
          status: (formData.get('status') as any) || 'Pending',
          date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
          breakdown: breakdown.length > 0 ? breakdown : undefined
        };
        id ? prisma.commission.update(id, payload) : prisma.commission.create(payload);
      } else if (activeView === 'CALL_REPORTS') {
        const payload = {
          customerId: formData.get('customerId') as string,
          agentId: formData.get('agentId') as string,
          date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
          duration: parseInt(formData.get('duration') as string) || 0,
          outcome: (formData.get('outcome') as VisitOutcome) || VisitOutcome.INTERESTED,
          notes: formData.get('notes') as string
        };
        id ? prisma.callReport.update(id, payload) : prisma.callReport.create(payload);
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (err) {
      alert("Error saving entry. Please check your inputs.");
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-swift-navy transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col shadow-2xl z-30`}>
          <div className="p-6 flex items-center justify-between border-b border-white/10 h-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-swift-red rounded flex items-center justify-center text-white font-bold shadow-lg border border-white/20">S</div>
              {sidebarOpen && <h1 className="text-lg font-bold text-white tracking-tight uppercase">Dashboard</h1>}
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded bg-white/10 text-white/70 hover:text-white transition">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
              { id: 'DASHBOARD', label: 'Command Center', icon: LayoutDashboard },
              { id: 'CUSTOMERS', label: 'Wholesalers', icon: Users },
              { id: 'AGENTS', label: 'Sales Force', icon: UserSquare2 },
              { id: 'CALL_REPORTS', label: 'Comm Hub', icon: PhoneCall },
              { id: 'PRODUCTION', label: 'Product Stock', icon: Package },
              { id: 'LOGISTICS', label: 'Deliveries', icon: Truck },
              { id: 'COMMISSIONS', label: 'Earnings', icon: Banknote },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as ViewState); setGlobalSearch(''); }}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === item.id ? 'nav-active' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className={`font-medium ${!sidebarOpen && 'hidden'}`}>{item.label}</span>
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => setActiveView('PRISMA_SCHEMA')}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === 'PRISMA_SCHEMA' ? 'bg-white/20 text-white shadow-md' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Database size={20} />
                <span className={`font-medium ${!sidebarOpen && 'hidden'}`}>Prisma Schema</span>
              </button>
              <button
                onClick={() => setActiveView('AI_ARCHITECT')}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all mt-2 ${
                  activeView === 'AI_ARCHITECT' ? 'bg-white/20 text-white shadow-md' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Sparkles size={20} />
                <span className={`font-medium ${!sidebarOpen && 'hidden'}`}>Smart Planner</span>
              </button>
            </div>
          </nav>
          
          {sidebarOpen && (
            <div className="p-6 border-t border-white/10 bg-black/10">
              <p className="text-[9px] text-white/40 uppercase font-bold tracking-[0.3em]">Operational Suite v2.5</p>
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-6 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-swift-red animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ORM Architecture: Prisma</span>
              </div>
              <h2 className="text-3xl font-black text-swift-navy uppercase tracking-tight">{activeView.replace('_', ' ')}</h2>
            </div>
            
            <div className="flex gap-4">
               {activeView !== 'DASHBOARD' && activeView !== 'AI_ARCHITECT' && activeView !== 'PRISMA_SCHEMA' && (
                 <button onClick={handleNewEntry} className="flex items-center gap-2 px-6 py-3 bg-swift-red text-white rounded-xl hover:opacity-90 transition shadow-lg shadow-red-200 font-black uppercase text-xs tracking-wider">
                   <Plus size={18} />
                   <span>Create Entry</span>
                 </button>
               )}
            </div>
          </header>

          <div className="p-8 pb-24">
            {activeView === 'DASHBOARD' && <DashboardView {...dbState} />}
            {activeView === 'CUSTOMERS' && <CustomerModule customers={filteredCustomers} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'CUSTOMERS')} searchTerm={globalSearch} onSearchChange={setGlobalSearch} />}
            {activeView === 'AGENTS' && <AgentModule agents={filteredAgents} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'AGENTS')} onAssignLead={handleAssignLead} onViewStats={setSelectedAgentStats} searchTerm={globalSearch} onSearchChange={setGlobalSearch} />}
            {activeView === 'LOGISTICS' && <LogisticsModule reports={filteredLogistics} config={dbState.config} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'LOGISTICS')} searchTerm={globalSearch} onSearchChange={setGlobalSearch} />}
            {activeView === 'COMMISSIONS' && <CommissionModule commissions={filteredCommissions} config={dbState.config} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'COMMISSIONS')} agents={dbState.agents} searchTerm={globalSearch} onSearchChange={setGlobalSearch} />}
            {activeView === 'AI_ARCHITECT' && <AIArchitect currentConfig={dbState.config} />}
            {activeView === 'PRODUCTION' && <ProductionModule customers={dbState.customers} inventory={dbState.inventory} />}
            {activeView === 'CALL_REPORTS' && <CallReportModule reports={filteredCallReports} customers={dbState.customers} agents={dbState.agents} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'CALL_REPORTS')} searchTerm={globalSearch} onSearchChange={setGlobalSearch} />}
            {activeView === 'PRISMA_SCHEMA' && <PrismaExplorer />}
          </div>
        </main>
      </div>

      {/* Main Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-swift-navy">{getModalTitle()}</h3>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              {activeView === 'CUSTOMERS' && (
                <>
                  <input name="name" defaultValue={editingItem?.name} placeholder="Wholesaler Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  <input name="email" defaultValue={editingItem?.email} type="email" placeholder="Contact Email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  <input name="location" defaultValue={editingItem?.location} placeholder="Supply Region/Location" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  <div className="grid grid-cols-2 gap-3">
                    <select name="type" defaultValue={editingItem?.type || CustomerType.NEW} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red">
                      <option value={CustomerType.NEW}>New Wholesaler</option>
                      <option value={CustomerType.EXISTING}>Existing Route</option>
                      <option value={CustomerType.TARGETED}>Target Lead</option>
                    </select>
                    <select name="status" defaultValue={editingItem?.status || 'Active'} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red">
                      <option value="Active">Active Route</option>
                      <option value="Trial">Product Trial</option>
                      <option value="On Hold">Stock Hold</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Assigned Sales Rep</label>
                    <select name="assignedAgentId" defaultValue={editingItem?.assignedAgentId || 'a1'} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red">
                      {dbState.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeView === 'AGENTS' && (
                <>
                  <input name="name" defaultValue={editingItem?.name} placeholder="Full Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  <input name="role" defaultValue={editingItem?.role} placeholder="Focus (e.g. Packing Bags Rep)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Production Efficiency Score (%)</label>
                    <input name="perf" defaultValue={editingItem?.performanceScore} type="number" placeholder="Score (0-100)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" min="0" max="100" />
                  </div>
                </>
              )}

              {activeView === 'CALL_REPORTS' && (
                <>
                  <select name="customerId" defaultValue={editingItem?.customerId} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required>
                    <option value="">Select Wholesaler</option>
                    {dbState.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select name="agentId" defaultValue={editingItem?.agentId} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required>
                    <option value="">Select Sales Rep</option>
                    {dbState.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" />
                    <input name="duration" type="number" defaultValue={editingItem?.duration} placeholder="Duration (mins)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" />
                  </div>
                  <select name="outcome" defaultValue={editingItem?.outcome || VisitOutcome.INTERESTED} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red">
                    <option value={VisitOutcome.INTERESTED}>Interested</option>
                    <option value={VisitOutcome.ORDER_PLACED}>Order Placed</option>
                    <option value={VisitOutcome.FOLLOW_UP}>Requires Follow-up</option>
                    <option value={VisitOutcome.NOT_INTERESTED}>Not Interested</option>
                  </select>
                  <textarea name="notes" defaultValue={editingItem?.notes} placeholder="Interaction details..." className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red resize-none"></textarea>
                </>
              )}

              {activeView === 'LOGISTICS' && (
                <>
                  <select name="agentId" defaultValue={editingItem?.agentId} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required>
                    <option value="">Select Rep/Driver</option>
                    {dbState.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <input name="vehicleId" defaultValue={editingItem?.vehicleId} placeholder="Delivery Truck/Van ID" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="fuel" defaultValue={editingItem?.fuelUsage} type="number" step="0.1" placeholder="Fuel (Litres)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                    <input name="dist" defaultValue={editingItem?.distanceCovered} type="number" step="0.1" placeholder="Distance (KM)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  </div>
                  <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" />
                </>
              )}

              {activeView === 'COMMISSIONS' && (
                <>
                  <select name="agentId" defaultValue={editingItem?.agentId} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required>
                    <option value="">Pay To Sales Rep</option>
                    {dbState.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <input name="amount" defaultValue={editingItem?.amount} type="number" step="0.01" placeholder="Amount ($)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" required />
                  <div className="grid grid-cols-2 gap-3">
                    <select name="status" defaultValue={editingItem?.status || 'Pending'} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red">
                      <option value="Pending">Payment Pending</option>
                      <option value="Paid">Processed</option>
                    </select>
                    <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Breakdown (Line: Amount)</label>
                    <textarea 
                      name="breakdown" 
                      defaultValue={editingItem?.breakdown?.map((b: any) => `${b.label}: ${b.amount}`).join('\n')}
                      placeholder="HDPE Rollers: 450&#10;Printed Bags: 200" 
                      className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-swift-red resize-none font-mono text-sm"
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {editingItem?.id && (
                   <button 
                    type="button" 
                    onClick={() => { handleDelete(editingItem.id, activeView); setShowModal(false); }}
                    className="flex-1 py-4 bg-red-50 text-swift-red font-bold rounded-2xl border border-red-200 hover:bg-red-100 transition active:scale-95"
                   >
                    Delete
                  </button>
                )}
                <button type="submit" className="flex-[2] py-4 bg-swift-red text-white font-bold rounded-2xl shadow-lg shadow-red-100 hover:opacity-90 transition active:scale-95 uppercase tracking-wider text-xs">
                  {editingItem?.id ? 'Save Changes' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Statistics Modal */}
      {selectedAgentStats && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-swift-navy rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <UserSquare2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-swift-navy">{selectedAgentStats.name}</h3>
                  <p className="text-slate-500 font-medium">{selectedAgentStats.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgentStats(null)} className="p-2 hover:bg-slate-200 rounded-xl transition">
                <X size={28} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                <div className="flex items-center gap-3 text-swift-red mb-4 font-bold uppercase tracking-wider text-[10px]">
                  <BarChart3 size={18} />
                  Performance Metrics
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Acquisitions</span>
                    <span className="font-bold text-swift-navy text-lg">{selectedAgentStats.customersAcquired}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Efficiency Score</span>
                    <span className="font-bold text-emerald-600 text-lg">{selectedAgentStats.performanceScore}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 text-swift-navy mb-4 font-bold uppercase tracking-wider text-[10px]">
                  <TrendingUp size={18} />
                  Earnings Outlook
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Current Balance</span>
                    <span className="font-bold text-swift-navy text-lg">
                      ${dbState.commissions
                        .filter(c => c.agentId === selectedAgentStats.id)
                        .reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Payout Frequency</span>
                    <span className="font-bold text-swift-navy text-sm">Monthly</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-swift-navy mb-4 text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Droplets size={16} className="text-swift-red" />
                  Route & Logistics Detail
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Fuel</p>
                    <p className="text-lg font-bold text-swift-navy">
                      {(dbState.logistics.filter(l => l.agentId === selectedAgentStats.id).reduce((s, l) => s + l.fuelUsage, 0) / 
                        Math.max(1, dbState.logistics.filter(l => l.agentId === selectedAgentStats.id).length)).toFixed(1)}L
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Distance</p>
                    <p className="text-lg font-bold text-swift-navy">
                      {dbState.logistics.filter(l => l.agentId === selectedAgentStats.id).reduce((s, l) => s + l.distanceCovered, 0).toFixed(0)}km
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Coverage</p>
                    <p className="text-lg font-bold text-swift-navy">88%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button className="flex-1 py-4 bg-swift-navy text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition active:scale-95 uppercase tracking-widest text-xs" onClick={() => setSelectedAgentStats(null)}>
                Download Full Performance Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
