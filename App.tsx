
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Handshake, UserSquare2, Menu, X, Package, 
  PhoneCall, Database, Search, Zap, LogOut, ShieldAlert, UserPlus, Trash2, Edit3, Save, 
  BarChart3, TrendingUp, Target, Award, ShieldCheck, Key, Rocket, Settings2, Plus, Check, Shield, User as UserIcon, Lock,
  ShoppingCart, ClipboardList, Cloud, CloudOff, RefreshCw, Eye, EyeOff, Info, Briefcase, ReceiptText, Fingerprint, Sparkles, Hammer, Server
} from 'lucide-react';
import { ViewState, Agent, Partner, CallReport, User as UserType, Role, InventoryItem, Order, Sale, WorkOrder } from './types';
import { api } from './services/api';
import { prisma } from './services/prisma';

// Import Views
import DashboardView from './components/DashboardView';
import PartnerModule from './components/PartnerModule';
import AgentModule from './components/AgentModule';
import ProductionModule from './components/ProductionModule';
import CallReportModule from './components/CallReportModule';
import OrderModule from './components/OrderModule';
import WorkOrderModule from './components/WorkOrderModule';
import SalesModule from './components/SalesModule';
import PortfolioView from './components/PortfolioView';
import PrismaExplorer from './components/PrismaExplorer';
import AIArchitect from './components/AIArchitect';

const SwiftLogo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { width: 140, height: 40, iconSize: 28, textSize: 'text-lg', subSize: 'text-[6px]' },
    md: { width: 220, height: 60, iconSize: 48, textSize: 'text-2xl', subSize: 'text-[10px]' },
    lg: { width: 360, height: 100, iconSize: 84, textSize: 'text-4xl', subSize: 'text-[14px]' }
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg width={s.iconSize} height={s.iconSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15L85 35V65L50 85L15 65V35L50 15Z" fill="#003358" />
        <path d="M50 15L85 35L50 55L15 35L50 15Z" fill="#002340" />
        <path d="M40 30C55 20 75 25 85 45L65 50L95 55L90 25L80 35C70 20 50 15 35 25L40 30Z" fill="#0079C1" />
        <path d="M60 70C45 80 25 75 15 55L35 50L5 45L10 75L20 65C30 80 50 85 65 75L60 70Z" fill="#67B146" />
      </svg>
      <div className="flex flex-col">
        <span className={`${s.textSize} font-black text-[#003358] uppercase tracking-tighter leading-none`}>Swift</span>
        <span className={`${s.subSize} font-black text-[#003358] uppercase tracking-[0.1em] leading-none mt-1 opacity-90`}>Plastics Inc.</span>
      </div>
    </div>
  );
};

const UserManagementView = ({ users, roles, agents, onDelete, onCreate }: { users: UserType[], roles: Role[], agents: Agent[], onDelete: (id: string) => void, onCreate: (data: Omit<UserType, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', roleId: '', agentId: '' });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowAdd(false);
    setFormData({ username: '', password: '', name: '', roleId: '', agentId: '' });
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><UserIcon size={200} /></div>
        <div className="relative z-10">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Personnel Control</h2>
           <p className="text-blue-100 text-sm mt-2 opacity-70">Link employees to Sales Agent profiles to enable Portfolio Sync.</p>
           <button onClick={() => setShowAdd(!showAdd)} className="mt-8 px-8 py-4 bg-swift-green text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-xl">
              {showAdd ? <X size={20} /> : <UserPlus size={20} />} {showAdd ? "Cancel" : "Enroll Personnel"}
           </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="E.g. Sarah Miller" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="smiller" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Initial Password</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Security Role</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} required>
                <option value="">Select Access Level...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black text-swift-green uppercase tracking-widest ml-2">Link to Sales Agent Profile (Crucial for Portfolio Sync)</label>
              <select className="w-full p-4 bg-green-50 border border-green-100 rounded-xl font-black text-swift-navy italic" value={formData.agentId} onChange={e => setFormData({...formData, agentId: e.target.value})}>
                <option value="">Non-Sales / Management Only (No Portfolio)</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.employeeId})</option>)}
              </select>
            </div>
          </div>
          <button className="w-full py-6 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-swift-green transition-all">Authorize Personnel Access</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col shadow-sm hover:shadow-lg transition relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition"><Fingerprint size={80} /></div>
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="font-black text-slate-900 uppercase italic tracking-tighter text-xl leading-none">{user.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">@{user.username}</p>
               </div>
               <button onClick={() => onDelete(user.id)} className="p-2 text-slate-200 hover:text-swift-red transition"><Trash2 size={18} /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
               <span className="text-[8px] px-3 py-1 bg-swift-navy/5 rounded-full font-black text-swift-navy uppercase border border-swift-navy/10">
                 {roles.find(r => r.id === user.roleId)?.name}
               </span>
               {user.agentId && (
                 <span className="text-[8px] px-3 py-1 bg-swift-green/10 rounded-full font-black text-swift-green uppercase border border-swift-green/20 flex items-center gap-1">
                   <ShieldCheck size={10} /> Linked: {agents.find(a => a.id === user.agentId)?.name}
                 </span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RoleManagementView = ({ roles, onDelete, onCreate }: { roles: Role[], onDelete: (id: string) => void, onCreate: (data: Omit<Role, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ 
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
    onCreate(formData as any);
    setShowAdd(false);
    setFormData({ 
      name: '', description: '', isSystemAdmin: false,
      canViewPartners: true, canCreatePartners: false, canEditPartners: false, canDeletePartners: false,
      canViewAgents: true, canCreateAgents: false, canEditAgents: false, canDeleteAgents: false,
      canViewOrders: true, canCreateOrders: false, canEditOrders: false, canDeleteOrders: false,
      canViewInventory: true, canCreateInventory: false, canEditInventory: false, canDeleteInventory: false,
      canViewCalls: true, canCreateCalls: false, canEditCalls: false, canDeleteCalls: false,
      canViewSecurity: false, canManageUsers: false, canManageRoles: false
    });
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Shield size={200} /></div>
        <div className="relative z-10">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Access Profiles</h2>
           <p className="text-blue-100 text-sm mt-2 opacity-70">Define security clearance and permission sets.</p>
           <button onClick={() => setShowAdd(!showAdd)} className="mt-8 px-8 py-4 bg-swift-green text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-xl">
              {showAdd ? <X size={20} /> : <Shield size={20} />} {showAdd ? "Cancel" : "New Profile"}
           </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3rem] border-2 border-swift-navy shadow-3xl animate-in slide-in-from-top-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Role Name</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="E.g. Regional Manager" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="Permission scope summary" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
          </div>
          <button className="w-full py-6 bg-swift-navy text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-swift-green transition-all">Create Security Profile</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col shadow-sm hover:shadow-lg transition relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition"><Shield size={80} /></div>
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="font-black text-slate-900 uppercase italic tracking-tighter text-xl leading-none">{role.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role.description}</p>
               </div>
               {!role.isSystemAdmin && (
                 <button onClick={() => onDelete(role.id)} className="p-2 text-slate-200 hover:text-swift-red transition"><Trash2 size={18} /></button>
               )}
            </div>
            {role.isSystemAdmin && (
              <span className="text-[8px] px-3 py-1 bg-swift-red/10 rounded-full font-black text-swift-red uppercase border border-swift-red/20 w-fit">Full Admin Access</span>
            )}
          </div>
        ))}
      </div>
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
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    api.users.getAll().then(users => {
      if (users.length === 0) setIsBootstrap(true);
    });
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isBootstrap) {
        if (!username || !password || !name) {
          setError('CRITICAL: All fields required for system initialization.');
          setLoading(false);
          return;
        }

        const adminRole = await api.roles.create({ 
          name: 'System Owner', 
          description: 'Primary Administrative Control Profile', 
          isSystemAdmin: true, 
          canViewPartners: true, canCreatePartners: true, canEditPartners: true, canDeletePartners: true,
          canViewAgents: true, canCreateAgents: true, canEditAgents: true, canDeleteAgents: true,
          canViewOrders: true, canCreateOrders: true, canEditOrders: true, canDeleteOrders: true,
          canViewInventory: true, canCreateInventory: true, canEditInventory: true, canDeleteInventory: true,
          canViewCalls: true, canCreateCalls: true, canEditCalls: true, canDeleteCalls: true,
          canViewSecurity: true, canManageUsers: true, canManageRoles: true
        });

        const newUser = await api.users.create({ username, password, name, roleId: adminRole.id });
        onBootstrap();
        onLogin(newUser);
      } else {
        const users = await api.users.getAll();
        const user = users.find(u => u.username === username);
        if (user && user.password === password) {
          onLogin(user);
        } else {
          setError('ACCESS DENIED: Invalid personnel credentials.');
        }
      }
    } catch (err: any) {
      setError(`SYSTEM ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#1e293b,_#0f172a)]">
      <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-3xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition duration-1000">
           <Zap size={300} className="text-swift-green" />
        </div>
        <div className="relative z-10">
          <SwiftLogo size="md" className="mb-12" />
          <div className="mb-10">
            <h2 className="text-4xl font-black text-swift-navy uppercase italic tracking-tighter leading-none">
              {isBootstrap ? "Establish Control" : "Personnel Access"}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              {isBootstrap ? "Create primary administrative identity" : "Authorized Command Center Entry"}
            </p>
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-swift-red text-[10px] font-black uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}
          <form onSubmit={handleAction} className="space-y-6">
            {isBootstrap && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" placeholder="E.g. John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-swift-green transition-all" required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Username</label>
              <div className="relative">
                <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-swift-navy transition-all" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-swift-navy transition-all" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-swift-navy transition">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-6 bg-swift-navy text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-swift-green transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-300">
              {loading ? <RefreshCw className="animate-spin" /> : <Zap size={20} />}
              {isBootstrap ? "Establish Authority" : "Authorize Entry"}
            </button>
          </form>
          <p className="mt-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
            &copy; 2024 Swift Plastics Inc. &bull; Secure Industrial OS
          </p>
        </div>
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
  const [isLoading, setIsLoading] = useState(false);
  
  const [dbData, setDbData] = useState({
    partners: [] as Partner[],
    agents: [] as Agent[],
    calls: [] as CallReport[],
    orders: [] as Order[],
    workOrders: [] as WorkOrder[],
    sales: [] as Sale[],
    inventory: [] as InventoryItem[],
    users: [] as UserType[],
    roles: [] as Role[],
    config: prisma.config.get()
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [partners, agents, calls, orders, workOrders, sales, inventory, users, roles] = await Promise.all([
      api.partners.getAll(),
      api.agents.getAll(),
      api.calls.getAll(),
      api.orders.getAll(),
      api.workOrders.getAll(),
      api.sales.getAll(),
      api.inventory.getAll(),
      api.users.getAll(),
      api.roles.getAll(),
    ]);

    setDbData({
      partners, agents, calls, orders, workOrders, sales, inventory, users, roles,
      config: prisma.config.get()
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const handleMutation = () => fetchData();
    window.addEventListener('prisma-mutation', handleMutation);
    return () => window.removeEventListener('prisma-mutation', handleMutation);
  }, [fetchData]);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('swift_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('swift_session');
    setActiveView('DASHBOARD');
  };

  if (!currentUser) return <LoginView onLogin={handleLogin} onBootstrap={fetchData} />;

  const currentUserRole = dbData.roles.find(r => r.id === currentUser.roleId);
  const isAdmin = currentUserRole?.isSystemAdmin || dbData.users.length <= 1;
  const hasPerm = (p: keyof Role) => isAdmin || (currentUserRole && (currentUserRole as any)[p]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex items-center gap-4 group">
          <SwiftLogo size="sm" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${prisma.dbInfo.getMode() === 'PRODUCTION' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {isLoading ? <RefreshCw size={14} className="animate-spin text-blue-500" /> : <Server size={14} className={prisma.dbInfo.getMode() === 'PRODUCTION' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />}
            {isLoading ? 'Syncing...' : (prisma.dbInfo.getMode() === 'PRODUCTION' ? 'Neon Cloud Linked' : 'Simulation Mode')}
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
             <p className="text-[11px] font-black text-swift-navy uppercase tracking-tighter leading-none">{currentUser.name}</p>
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{currentUserRole?.name || 'System Principal'}</p>
           </div>
           <button onClick={handleLogout} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-swift-red hover:bg-red-50 transition border border-transparent hover:border-red-100"><LogOut size={20} /></button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-swift-navy transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30 shadow-2xl`}>
          <nav className="flex-1 p-3 space-y-2 mt-4">
            {[
              { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard, perm: true },
              { id: 'PORTFOLIO', label: 'My Portfolio', icon: Briefcase, perm: true },
              { id: 'PARTNERS', label: 'Partner Hub', icon: Handshake, perm: hasPerm('canViewPartners') },
              { id: 'ORDERS', label: 'Order Hub', icon: ShoppingCart, perm: hasPerm('canViewOrders') },
              { id: 'WORK_ORDERS', label: 'Shop Floor', icon: Hammer, perm: hasPerm('canViewInventory') },
              { id: 'SALES', label: 'Sales Ledger', icon: ReceiptText, perm: hasPerm('canViewOrders') },
              { id: 'AGENTS', label: 'Sales Force', icon: UserSquare2, perm: hasPerm('canViewAgents') },
              { id: 'CALL_REPORTS', label: 'Interaction Log', icon: PhoneCall, perm: hasPerm('canViewCalls') },
              { id: 'PRODUCTION', label: 'Inventory', icon: Database, perm: hasPerm('canViewInventory') },
              { id: 'USER_MANAGEMENT', label: 'Personnel', icon: UserIcon, perm: hasPerm('canManageUsers') },
              { id: 'ROLE_MANAGEMENT', label: 'Security', icon: Shield, perm: hasPerm('canManageRoles') },
              { id: 'AI_ARCHITECT', label: 'Strategy AI', icon: Sparkles, perm: isAdmin },
              { id: 'PRISMA_SCHEMA', label: 'DB Architect', icon: Server, perm: isAdmin },
            ].map(item => item.perm && (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewState)}
                className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all group ${activeView === item.id ? 'bg-swift-green text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon size={20} className={activeView === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition'} />
                {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>}
              </button>
            ))}
          </nav>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-6 text-white/20 hover:text-white transition flex justify-center">
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </aside>
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-10 pb-32">
            {activeView === 'DASHBOARD' && <DashboardView partners={dbData.partners} agents={dbData.agents} inventory={dbData.inventory} orders={dbData.orders} />}
            {activeView === 'PORTFOLIO' && <PortfolioView currentUser={currentUser} agents={dbData.agents} partners={dbData.partners} orders={dbData.orders} sales={dbData.sales} reports={dbData.calls} inventory={dbData.inventory} isAdmin={isAdmin} />}
            {activeView === 'PARTNERS' && <PartnerModule partners={dbData.partners} inventory={dbData.inventory} agents={dbData.agents} onDelete={id => api.partners.delete(id)} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} />}
            {activeView === 'ORDERS' && <OrderModule orders={dbData.orders} partners={dbData.partners} inventory={dbData.inventory} currentUser={currentUser} roles={dbData.roles} />}
            {activeView === 'WORK_ORDERS' && <WorkOrderModule workOrders={dbData.workOrders} orders={dbData.orders} partners={dbData.partners} permissions={currentUserRole} />}
            {activeView === 'SALES' && <SalesModule sales={dbData.sales} orders={dbData.orders} partners={dbData.partners} inventory={dbData.inventory} agents={dbData.agents} currentUser={currentUser} />}
            {activeView === 'AGENTS' && <AgentModule agents={dbData.agents} onDelete={id => api.agents.delete(id)} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} onEdit={()=>{}} onAssignLead={()=>{}} onViewStats={()=>{}} />}
            {activeView === 'PRODUCTION' && <ProductionModule partners={dbData.partners} inventory={dbData.inventory} permissions={currentUserRole} onDelete={id => api.inventory.delete(id)} />}
            {activeView === 'CALL_REPORTS' && <CallReportModule reports={dbData.calls} customers={dbData.partners} agents={dbData.agents} onDelete={()=>{}} onEdit={()=>{}} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} />}
            {activeView === 'ROLE_MANAGEMENT' && <RoleManagementView roles={dbData.roles} onDelete={id => api.roles.delete(id)} onCreate={data => api.roles.create(data)} />}
            {activeView === 'USER_MANAGEMENT' && <UserManagementView users={dbData.users} roles={dbData.roles} agents={dbData.agents} onDelete={id => api.users.delete(id)} onCreate={data => api.users.create(data)} />}
            {activeView === 'PRISMA_SCHEMA' && <PrismaExplorer />}
            {activeView === 'AI_ARCHITECT' && <AIArchitect currentConfig={dbData.config} />}
        </main>
      </div>
    </div>
  );
};

export default App;
