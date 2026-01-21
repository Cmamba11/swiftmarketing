
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Handshake, UserSquare2, Sparkles, Menu, X, Package, 
  Code, PhoneCall, Database, Search, Zap, LogOut, ShieldAlert, UserPlus, Trash2, Edit3, Save, 
  BarChart3, TrendingUp, Target, Award, ShieldCheck, Key, Rocket, Settings2, Plus, Check, Shield, User as UserIcon, Lock,
  ShoppingCart, ClipboardList
} from 'lucide-react';
import { ViewState, Agent, Partner, CallReport, User as UserType, Role, InventoryItem, Order } from './types';
import { prisma } from './services/prisma';

// Import Views
import DashboardView from './components/DashboardView';
import PartnerModule from './components/PartnerModule';
import AgentModule from './components/AgentModule';
import AIArchitect from './components/AIArchitect';
import ProductionModule from './components/ProductionModule';
import CallReportModule from './components/CallReportModule';
import OrderModule from './components/OrderModule';
import PrismaExplorer from './components/PrismaExplorer';

const RoleManagementView = ({ roles, onDelete, onCreate }: { roles: Role[], onDelete: (id: string) => void, onCreate: (data: Omit<Role, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', description: '', isSystemAdmin: false,
    canManageInventory: true, canManageWholesalers: true,
    canManageAgents: true, canManageCalls: true, canAccessAI: true,
    canCreate: true, canEdit: true, canDelete: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowAdd(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Settings2 size={200} /></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter text-white">Security Command</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="mt-8 flex items-center gap-3 px-8 py-4 bg-swift-red text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-xl">
            {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? "Abort" : "Forge Role"}
          </button>
        </div>
      </div>
      {showAdd && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input className="w-full p-4 border rounded-xl" placeholder="Role Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
            <button className="w-full py-4 bg-swift-navy text-white rounded-xl font-bold uppercase">Initialize Role</button>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
             <h4 className="text-xl font-black text-slate-800 uppercase italic mb-4">{role.name}</h4>
             <button onClick={() => onDelete(role.id)} className="text-swift-red font-black uppercase text-[10px]">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserManagementView = ({ users, roles, onDelete, onCreate }: { users: UserType[], roles: Role[], onDelete: (id: string) => void, onCreate: (data: Omit<UserType, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ username: '', name: '', roleId: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowAdd(false);
  };
  return (
    <div className="space-y-8">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Personnel Control</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="mt-8 px-8 py-4 bg-swift-red text-white rounded-2xl font-black uppercase">Enroll Staff</button>
      </div>
      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border border-slate-200 space-y-4 shadow-xl">
          <input className="w-full p-4 border rounded-xl" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input className="w-full p-4 border rounded-xl" placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} required />
          <select className="w-full p-4 border rounded-xl" onChange={e => setFormData({...formData, roleId: e.target.value})} required>
            <option value="">Select Role</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className="w-full py-4 bg-swift-navy text-white rounded-xl font-bold uppercase">Grant Access</button>
        </form>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem('swift_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dbData, setDbData] = useState({
    partners: [] as Partner[],
    agents: [] as Agent[],
    calls: [] as CallReport[],
    orders: [] as Order[],
    inventory: [] as InventoryItem[],
    users: [] as UserType[],
    roles: [] as Role[],
    config: prisma.config.get()
  });

  const fetchData = useCallback(() => {
    prisma.seed();
    setDbData({
      partners: prisma.partner.findMany(),
      agents: prisma.salesAgent.findMany(),
      calls: prisma.callReport.findMany(),
      orders: prisma.order.findMany(),
      inventory: prisma.inventory.findMany(),
      users: prisma.user.findMany(),
      roles: prisma.role.findMany(),
      config: prisma.config.get()
    });
  }, []);

  useEffect(() => {
    fetchData();
    const handleMutation = () => fetchData();
    window.addEventListener('prisma-mutation', handleMutation);
    return () => window.removeEventListener('prisma-mutation', handleMutation);
  }, [fetchData]);

  if (!currentUser) return <LoginView onLogin={user => { setCurrentUser(user); localStorage.setItem('swift_session', JSON.stringify(user)); }} onBootstrap={fetchData} />;

  const currentUserRole = dbData.roles.find(r => r.id === currentUser.roleId);
  const isAdmin = currentUserRole?.isSystemAdmin || false;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex items-center gap-4 group"><SwiftLogo size="sm" /></div>
        <div className="flex items-center gap-6">
           <p className="text-[11px] font-black text-swift-navy uppercase tracking-tighter">{currentUser.name}</p>
           <button onClick={() => { setCurrentUser(null); localStorage.removeItem('swift_session'); }} className="p-3 text-slate-400 hover:text-swift-red"><LogOut size={20} /></button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-[#1A2B6D] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30`}>
          <nav className="flex-1 p-3 space-y-2 mt-4">
            {[
              { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard },
              { id: 'PARTNERS', label: 'Partner Hub', icon: Handshake, perm: currentUserRole?.canManageWholesalers },
              { id: 'ORDERS', label: 'Order Hub', icon: ShoppingCart },
              { id: 'AGENTS', label: 'Sales Force', icon: UserSquare2, perm: currentUserRole?.canManageAgents },
              { id: 'CALL_REPORTS', label: 'Call Log', icon: PhoneCall, perm: currentUserRole?.canManageCalls },
              { id: 'PRODUCTION', label: 'Production', icon: Database, perm: currentUserRole?.canManageInventory },
            ].map(item => (isAdmin || item.perm) && (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewState)}
                className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all ${activeView === item.id ? 'bg-[#E31E24] text-white' : 'text-white/60 hover:text-white'}`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>}
              </button>
            ))}
            {isAdmin && (
              <div className="pt-6 border-t border-white/5 space-y-2">
                <button onClick={() => setActiveView('ROLE_MANAGEMENT')} className="flex items-center w-full gap-4 px-4 py-3 text-white/30 hover:text-white"><Shield size={20} />{sidebarOpen && <span className="text-xs font-bold uppercase">Roles</span>}</button>
                <button onClick={() => setActiveView('USER_MANAGEMENT')} className="flex items-center w-full gap-4 px-4 py-3 text-white/30 hover:text-white"><UserPlus size={20} />{sidebarOpen && <span className="text-xs font-bold uppercase">Staff</span>}</button>
              </div>
            )}
          </nav>
        </aside>
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-10">
            {activeView === 'DASHBOARD' && <DashboardView partners={dbData.partners} agents={dbData.agents} inventory={dbData.inventory} />}
            {activeView === 'PARTNERS' && <PartnerModule partners={dbData.partners} inventory={dbData.inventory} onDelete={id => prisma.partner.delete(id)} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} />}
            {activeView === 'ORDERS' && <OrderModule orders={dbData.orders} partners={dbData.partners} inventory={dbData.inventory} />}
            {activeView === 'AGENTS' && <AgentModule agents={dbData.agents} onDelete={id => prisma.salesAgent.delete(id)} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} onEdit={()=>{}} onAssignLead={()=>{}} onViewStats={()=>{}} />}
            {activeView === 'PRODUCTION' && <ProductionModule partners={dbData.partners} inventory={dbData.inventory} onDelete={id => prisma.inventory.delete(id)} permissions={currentUserRole} />}
            {activeView === 'CALL_REPORTS' && <CallReportModule reports={dbData.calls} customers={dbData.partners} agents={dbData.agents} onDelete={()=>{}} onEdit={()=>{}} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} />}
            {activeView === 'ROLE_MANAGEMENT' && <RoleManagementView roles={dbData.roles} onDelete={id => prisma.role.delete(id)} onCreate={data => prisma.role.create(data)} />}
            {activeView === 'USER_MANAGEMENT' && <UserManagementView users={dbData.users} roles={dbData.roles} onDelete={id => prisma.user.delete(id)} onCreate={data => prisma.user.create(data)} />}
        </main>
      </div>
    </div>
  );
};

const SwiftLogo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
  const scale = size === "sm" ? 0.6 : size === "lg" ? 1.5 : 1;
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg width={160 * scale} height={100 * scale} viewBox="0 0 160 100" fill="none">
        <circle cx="80" cy="45" r="35" fill="#E31E24" />
        <rect x="35" y="45" width="90" height="25" rx="4" fill="#1A2B6D" />
        <text x="80" y="65" textAnchor="middle" fill="white" style={{ font: 'italic 900 32px sans-serif', letterSpacing: '-2px' }}>swift</text>
        <text x="80" y="82" textAnchor="middle" fill="#E31E24" style={{ font: 'bold 9px sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>PLASTICS INC.</text>
      </svg>
    </div>
  );
};

const LoginView = ({ onLogin, onBootstrap }: { onLogin: (user: UserType) => void, onBootstrap: () => void }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [isBootstrap, setIsBootstrap] = useState(false);
  useEffect(() => { if (prisma.user.findMany().length === 0) setIsBootstrap(true); }, []);
  const handleAction = () => {
    if (isBootstrap) {
      const adminRole = prisma.role.create({ name: 'System Owner', description: 'Admin', isSystemAdmin: true, canManageInventory: true, canManageWholesalers: true, canManageAgents: true, canManageCalls: true, canAccessAI: true, canCreate: true, canEdit: true, canDelete: true });
      const newUser = prisma.user.create({ username, name, roleId: adminRole.id });
      onBootstrap();
      onLogin(newUser);
    } else {
      const u = prisma.user.findUnique({where: {username}}); 
      if(u) onLogin(u);
      else alert("Auth Failed");
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl">
        <SwiftLogo size="lg" className="mb-10" />
        <div className="space-y-6">
          {isBootstrap && <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 border rounded-2xl font-bold" />}
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-5 py-4 border rounded-2xl font-bold" />
          <button onClick={handleAction} className="w-full py-5 bg-swift-navy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-xl">
            {isBootstrap ? "Execute Deployment" : "Enter System"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
