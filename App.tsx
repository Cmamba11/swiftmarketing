
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Handshake, UserSquare2, Menu, X, Package, 
  Code, PhoneCall, Database, Search, Zap, LogOut, ShieldAlert, UserPlus, Trash2, Edit3, Save, 
  BarChart3, TrendingUp, Target, Award, ShieldCheck, Key, Rocket, Settings2, Plus, Check, Shield, User as UserIcon, Lock,
  ShoppingCart, ClipboardList, Cloud, CloudOff, RefreshCw, Eye, EyeOff, Info
} from 'lucide-react';
import { ViewState, Agent, Partner, CallReport, User as UserType, Role, InventoryItem, Order } from './types';
import { prisma } from './services/prisma';

// Import Views
import DashboardView from './components/DashboardView';
import PartnerModule from './components/PartnerModule';
import AgentModule from './components/AgentModule';
import ProductionModule from './components/ProductionModule';
import CallReportModule from './components/CallReportModule';
import OrderModule from './components/OrderModule';
import PrismaExplorer from './components/PrismaExplorer';

const RoleManagementView = ({ roles, onDelete, onCreate }: { roles: Role[], onDelete: (id: string) => void, onCreate: (data: Omit<Role, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Omit<Role, 'id'>>({ 
    name: '', 
    description: '', 
    isSystemAdmin: false,
    canViewPartners: true, canCreatePartners: false, canEditPartners: false, canDeletePartners: false,
    canViewAgents: true, canCreateAgents: false, canEditAgents: false, canDeleteAgents: false,
    canViewOrders: true, canCreateOrders: false, canEditOrders: false, canDeleteOrders: false,
    canViewInventory: true, canCreateInventory: false, canEditInventory: false, canDeleteInventory: false,
    canViewCalls: true, canCreateCalls: false, canEditCalls: false, canDeleteCalls: false,
    canViewSecurity: false, canManageUsers: false, canManageRoles: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowAdd(false);
  };

  const toggle = (key: keyof Omit<Role, 'id'>) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fix: Restrict keys to keyof Omit<Role, 'id'> to match formData and toggle function requirements
  const PermissionRow = ({ label, keys }: { label: string, keys: { view: keyof Omit<Role, 'id'>, create: keyof Omit<Role, 'id'>, edit: keyof Omit<Role, 'id'>, delete: keyof Omit<Role, 'id'> } }) => (
    <div className="grid grid-cols-5 items-center gap-4 py-4 border-b border-slate-100 last:border-none">
      <span className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">{label}</span>
      <Checkbox label="View" active={formData[keys.view] as boolean} onClick={() => toggle(keys.view)} />
      <Checkbox label="Create" active={formData[keys.create] as boolean} onClick={() => toggle(keys.create)} />
      <Checkbox label="Edit" active={formData[keys.edit] as boolean} onClick={() => toggle(keys.edit)} />
      <Checkbox label="Delete" active={formData[keys.delete] as boolean} onClick={() => toggle(keys.delete)} />
    </div>
  );

  const Checkbox = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${active ? 'bg-swift-red text-white border-swift-red shadow-md' : 'bg-slate-50 text-slate-300 border-slate-200 hover:border-slate-300'}`}>
      {active ? <Check size={14} /> : <div className="w-3.5 h-3.5" />}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Settings2 size={200} /></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter text-white">Security Command</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="mt-8 flex items-center gap-3 px-8 py-4 bg-swift-red text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-xl">
            {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? "Abort" : "Forge Role Policy"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Role Designation</label>
                <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-swift-red" placeholder="E.g. Sales Supervisor" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Administrative Level</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => toggle('isSystemAdmin')} className={`flex-1 py-4 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition ${formData.isSystemAdmin ? 'bg-swift-navy text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {formData.isSystemAdmin ? "God Mode Enabled" : "Standard Personnel"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-sm font-black text-swift-navy uppercase italic tracking-tighter mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                <ShieldCheck size={20} className="text-swift-red" />
                Access Control Matrix
              </h4>
              <div className="space-y-2">
                <PermissionRow label="Industrial Partners" keys={{ view: 'canViewPartners', create: 'canCreatePartners', edit: 'canEditPartners', delete: 'canDeletePartners' }} />
                <PermissionRow label="Sales Force" keys={{ view: 'canViewAgents', create: 'canCreateAgents', edit: 'canEditAgents', delete: 'canDeleteAgents' }} />
                <PermissionRow label="Order Hub" keys={{ view: 'canViewOrders', create: 'canCreateOrders', edit: 'canEditOrders', delete: 'canDeleteOrders' }} />
                <PermissionRow label="Manufacturing" keys={{ view: 'canViewInventory', create: 'canCreateInventory', edit: 'canEditInventory', delete: 'canDeleteInventory' }} />
                <PermissionRow label="Interaction Logs" keys={{ view: 'canViewCalls', create: 'canCreateCalls', edit: 'canEditCalls', delete: 'canDeleteCalls' }} />
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Checkbox label="Access Security Schema" active={formData.canViewSecurity} onClick={() => toggle('canViewSecurity')} />
                 <Checkbox label="Manage Personnel" active={formData.canManageUsers} onClick={() => toggle('canManageUsers')} />
                 <Checkbox label="Modify Policies" active={formData.canManageRoles} onClick={() => toggle('canManageRoles')} />
              </div>
            </div>

            <button className="w-full py-6 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-swift-red transition-all">Establish Security Policy</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative group">
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{role.name}</h4>
               {role.isSystemAdmin && <Shield size={18} className="text-swift-red animate-pulse" />}
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{role.isSystemAdmin ? 'Full System Override' : 'Restricted Access Profile'}</p>
             <div className="flex justify-end gap-2 border-t border-slate-50 pt-4 opacity-0 group-hover:opacity-100 transition-all">
               {!role.isSystemAdmin && (
                 <button onClick={() => onDelete(role.id)} className="p-3 text-slate-300 hover:text-swift-red transition">
                   <Trash2 size={16} />
                 </button>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserManagementView = ({ users, roles, onDelete, onCreate }: { users: UserType[], roles: Role[], onDelete: (id: string) => void, onCreate: (data: Omit<UserType, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', roleId: '' });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowAdd(false);
    setFormData({ username: '', password: '', name: '', roleId: '' });
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Personnel Control</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="mt-8 px-8 py-4 bg-swift-red text-white rounded-2xl font-black uppercase tracking-widest">Enroll Staff</button>
      </div>
      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border border-slate-200 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full p-4 border rounded-xl font-bold" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input className="w-full p-4 border rounded-xl font-bold" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            <input className="w-full p-4 border rounded-xl font-bold" type="password" placeholder="Initial Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <select className="w-full p-4 border rounded-xl font-bold" value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} required>
              <option value="">Select Security Role...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <button className="w-full py-4 bg-swift-navy text-white rounded-xl font-black uppercase tracking-widest shadow-xl">Authorize Access</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-lg transition">
            <div>
              <p className="font-black text-slate-900 uppercase italic tracking-tighter">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">@{user.username}</p>
              <span className="text-[8px] px-2 py-0.5 bg-swift-navy/5 rounded-full font-black text-swift-navy uppercase mt-1 inline-block">
                {roles.find(r => r.id === user.roleId)?.name}
              </span>
            </div>
            <button onClick={() => onDelete(user.id)} className="p-3 text-slate-200 hover:text-swift-red transition">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
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

  // Security Helper
  const hasPerm = (p: keyof Role) => isAdmin || (currentUserRole && currentUserRole[p]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex items-center gap-4 group">
          <SwiftLogo size="sm" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${prisma.dbInfo.getMode() === 'PRODUCTION' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {prisma.dbInfo.getMode() === 'PRODUCTION' ? <Cloud size={14} className="animate-pulse" /> : <CloudOff size={14} />}
            {prisma.dbInfo.getMode() === 'PRODUCTION' ? 'Cloud Link Active' : 'Simulation Mode'}
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
             <p className="text-[11px] font-black text-swift-navy uppercase tracking-tighter leading-none">{currentUser.name}</p>
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{currentUserRole?.name}</p>
           </div>
           <button onClick={() => { setCurrentUser(null); localStorage.removeItem('swift_session'); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-swift-red hover:bg-red-50 transition border border-transparent hover:border-red-100"><LogOut size={20} /></button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-[#1A2B6D] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30 shadow-2xl`}>
          <nav className="flex-1 p-3 space-y-2 mt-4">
            {[
              { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard, perm: true },
              { id: 'PARTNERS', label: 'Partner Hub', icon: Handshake, perm: hasPerm('canViewPartners') },
              { id: 'ORDERS', label: 'Order Hub', icon: ShoppingCart, perm: hasPerm('canViewOrders') },
              { id: 'AGENTS', label: 'Sales Force', icon: UserSquare2, perm: hasPerm('canViewAgents') },
              { id: 'CALL_REPORTS', label: 'Call Log', icon: PhoneCall, perm: hasPerm('canViewCalls') },
              { id: 'PRODUCTION', label: 'Production', icon: Database, perm: hasPerm('canViewInventory') },
              { id: 'PRISMA_SCHEMA', label: 'DB Schema', icon: Code, perm: hasPerm('canViewSecurity') },
            ].map(item => item.perm && (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewState)}
                className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all group ${activeView === item.id ? 'bg-[#E31E24] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon size={20} className={activeView === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition'} />
                {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>}
              </button>
            ))}
            {(hasPerm('canManageUsers') || hasPerm('canManageRoles')) && (
              <div className="pt-6 border-t border-white/5 space-y-2">
                {hasPerm('canManageRoles') && (
                  <button onClick={() => setActiveView('ROLE_MANAGEMENT')} className="flex items-center w-full gap-4 px-4 py-3 text-white/30 hover:text-white transition group">
                    <Shield size={20} className="group-hover:text-emerald-400" />
                    {sidebarOpen && <span className="text-xs font-bold uppercase">Policies</span>}
                  </button>
                )}
                {hasPerm('canManageUsers') && (
                  <button onClick={() => setActiveView('USER_MANAGEMENT')} className="flex items-center w-full gap-4 px-4 py-3 text-white/30 hover:text-white transition group">
                    <UserPlus size={20} className="group-hover:text-blue-400" />
                    {sidebarOpen && <span className="text-xs font-bold uppercase">Staff</span>}
                  </button>
                )}
              </div>
            )}
          </nav>
          
          {sidebarOpen && (
            <div className="p-6 bg-black/20 m-3 rounded-[2rem] border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <Zap size={16} className="text-amber-400" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">System Health</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[94%]" />
              </div>
              <p className="text-[8px] font-bold text-white/30 uppercase mt-2">V7.2 Stable Patch</p>
            </div>
          )}
        </aside>
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-10">
            {activeView === 'DASHBOARD' && <DashboardView partners={dbData.partners} agents={dbData.agents} inventory={dbData.inventory} />}
            {activeView === 'PARTNERS' && <PartnerModule partners={dbData.partners} inventory={dbData.inventory} onDelete={id => prisma.partner.delete(id)} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} />}
            {activeView === 'ORDERS' && <OrderModule orders={dbData.orders} partners={dbData.partners} inventory={dbData.inventory} />}
            {activeView === 'AGENTS' && <AgentModule agents={dbData.agents} onDelete={id => prisma.salesAgent.delete(id)} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} onEdit={()=>{}} onAssignLead={()=>{}} onViewStats={()=>{}} />}
            {activeView === 'PRODUCTION' && <ProductionModule partners={dbData.partners} inventory={dbData.inventory} onDelete={id => prisma.inventory.delete(id)} permissions={currentUserRole} />}
            {activeView === 'CALL_REPORTS' && <CallReportModule reports={dbData.calls} customers={dbData.partners} agents={dbData.agents} onDelete={()=>{}} onEdit={()=>{}} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} />}
            {activeView === 'PRISMA_SCHEMA' && <PrismaExplorer />}
            {activeView === 'ROLE_MANAGEMENT' && <RoleManagementView roles={dbData.roles} onDelete={id => prisma.role.delete(id)} onCreate={data => prisma.role.create(data)} />}
            {activeView === 'USER_MANAGEMENT' && <UserManagementView users={dbData.users} roles={dbData.roles} onDelete={id => prisma.user.delete(id)} onCreate={data => prisma.user.create(data)} />}
        </main>
      </div>
    </div>
  );
};

const SwiftLogo = ({ className = "", size = "sm" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
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
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isBootstrap, setIsBootstrap] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (prisma.user.findMany().length === 0) setIsBootstrap(true); }, []);

  const handleAction = () => {
    setError('');
    if (isBootstrap) {
      if (!username || !password || !name) {
        setError('All fields are mandatory for initialization.');
        return;
      }
      const adminRole = prisma.role.create({ 
        name: 'System Owner', 
        description: 'Primary System Administrator', 
        isSystemAdmin: true, 
        canViewPartners: true, canCreatePartners: true, canEditPartners: true, canDeletePartners: true,
        canViewAgents: true, canCreateAgents: true, canEditAgents: true, canDeleteAgents: true,
        canViewOrders: true, canCreateOrders: true, canEditOrders: true, canDeleteOrders: true,
        canViewInventory: true, canCreateInventory: true, canEditInventory: true, canDeleteInventory: true,
        canViewCalls: true, canCreateCalls: true, canEditCalls: true, canDeleteCalls: true,
        canViewSecurity: true, canManageUsers: true, canManageRoles: true
      });
      const newUser = prisma.user.create({ username, password, name, roleId: adminRole.id });
      onBootstrap();
      onLogin(newUser);
    } else {
      const u = prisma.user.findUnique({where: {username}}); 
      if(u && u.password === password) {
        onLogin(u);
      } else {
        setError("Invalid credentials. Personnel access denied.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition duration-1000"><SwiftLogo size="lg" /></div>
        <SwiftLogo size="lg" className="mb-10 relative z-10" />
        
        <div className="space-y-6 relative z-10">
          <h2 className="text-xl font-black text-swift-navy uppercase italic tracking-tighter mb-2">
            {isBootstrap ? "Establish Global Admin" : "Command Center Auth"}
          </h2>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-swift-red text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {isBootstrap && (
            <div className="animate-in slide-in-from-bottom-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Personnel Identity</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="Full Legal Name" value={name} onChange={e => setName(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-swift-red transition" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Username</label>
            <div className="relative">
              <UserSquare2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Access Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-swift-navy transition" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Credential Key</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-swift-navy transition" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-swift-navy transition">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button onClick={handleAction} className="w-full py-6 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-swift-red transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
            <Zap size={20} />
            {isBootstrap ? "Establish Control" : "Enter Command Center"}
          </button>
        </div>
        <p className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2024 Swift Plastics Industrial OS</p>
      </div>
    </div>
  );
};

export default App;
