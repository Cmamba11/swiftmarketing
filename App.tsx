
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Handshake, UserSquare2, Menu, X, Package, 
  Code, PhoneCall, Database, Search, Zap, LogOut, ShieldAlert, UserPlus, Trash2, Edit3, Save, 
  BarChart3, TrendingUp, Target, Award, ShieldCheck, Key, Rocket, Settings2, Plus, Check, Shield, User as UserIcon, Lock,
  ShoppingCart, ClipboardList, Cloud, CloudOff, RefreshCw, Eye, EyeOff, Info, Briefcase, ReceiptText, Fingerprint
} from 'lucide-react';
import { ViewState, Agent, Partner, CallReport, User as UserType, Role, InventoryItem, Order, Sale } from './types';
import { prisma } from './services/prisma';

// Import Views
import DashboardView from './components/DashboardView';
import PartnerModule from './components/PartnerModule';
import AgentModule from './components/AgentModule';
import ProductionModule from './components/ProductionModule';
import CallReportModule from './components/CallReportModule';
import OrderModule from './components/OrderModule';
import SalesModule from './components/SalesModule';
import PortfolioView from './components/PortfolioView';
import PrismaExplorer from './components/PrismaExplorer';

const SwiftLogo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { box: 'w-10 h-10', icon: 18, text: 'text-lg', sub: 'text-[6px]' },
    md: { box: 'w-14 h-14', icon: 28, text: 'text-2xl', sub: 'text-[8px]' },
    lg: { box: 'w-24 h-24', icon: 48, text: 'text-4xl', sub: 'text-[10px]' }
  };
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${s.box} bg-[#E31E24] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-all duration-500`}>
        <Zap size={s.icon} fill="white" />
      </div>
      <div className="flex flex-col">
        <span className={`${s.text} font-black text-[#1A2B6D] uppercase italic tracking-tighter leading-none`}>Swift</span>
        <span className={`${s.sub} font-black text-[#E31E24] uppercase tracking-[0.4em] leading-none mt-1`}>Plastics Industrial OS</span>
      </div>
    </div>
  );
};

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
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${active ? 'bg-[#E31E24] text-white border-[#E31E24] shadow-md' : 'bg-slate-50 text-slate-300 border-slate-200 hover:border-slate-300'}`}>
      {active ? <Check size={14} /> : <div className="w-3.5 h-3.5" />}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#1A2B6D] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Settings2 size={200} /></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter text-white">Security Command</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="mt-8 flex items-center gap-3 px-8 py-4 bg-[#E31E24] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-xl">
            {showAdd ? <X size={20} /> : <Plus size={20} />} {showAdd ? "Abort" : "Forge Role Policy"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-12 rounded-[3rem] border-2 border-[#1A2B6D] shadow-3xl animate-in slide-in-from-top-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Role Designation</label>
                <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#E31E24]" placeholder="E.g. Sales Supervisor" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Administrative Level</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => toggle('isSystemAdmin')} className={`flex-1 py-4 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition ${formData.isSystemAdmin ? 'bg-[#1A2B6D] text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {formData.isSystemAdmin ? "God Mode Enabled" : "Standard Personnel"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-sm font-black text-[#1A2B6D] uppercase italic tracking-tighter mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                <ShieldCheck size={20} className="text-[#E31E24]" />
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

            <button className="w-full py-6 bg-[#1A2B6D] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#E31E24] transition-all">Establish Security Policy</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative group">
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{role.name}</h4>
               {role.isSystemAdmin && <Shield size={18} className="text-[#E31E24] animate-pulse" />}
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{role.isSystemAdmin ? 'Full System Override' : 'Restricted Access Profile'}</p>
             <div className="flex justify-end gap-2 border-t border-slate-50 pt-4 opacity-0 group-hover:opacity-100 transition-all">
               {!role.isSystemAdmin && (
                 <button onClick={() => onDelete(role.id)} className="p-3 text-slate-300 hover:text-[#E31E24] transition">
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
  const [formData, setFormData] = useState({ username: '', password: '', name: '', roleId: '', agentId: '' });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowAdd(false);
    setFormData({ username: '', password: '', name: '', roleId: '', agentId: '' });
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-[#1A2B6D] rounded-[3rem] p-10 text-white shadow-2xl relative">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Personnel Control</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="mt-8 px-8 py-4 bg-[#E31E24] text-white rounded-2xl font-black uppercase tracking-widest">Enroll Staff</button>
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
          <button className="w-full py-4 bg-[#1A2B6D] text-white rounded-xl font-black uppercase tracking-widest shadow-xl">Authorize Access</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex justify-between items-center shadow-sm hover:shadow-lg transition">
            <div>
              <p className="font-black text-slate-900 uppercase italic tracking-tighter">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">@{user.username}</p>
              <span className="text-[8px] px-2 py-0.5 bg-[#1A2B6D]/5 rounded-full font-black text-[#1A2B6D] uppercase mt-1 inline-block">
                {roles.find(r => r.id === user.roleId)?.name}
              </span>
            </div>
            <button onClick={() => onDelete(user.id)} className="p-3 text-slate-200 hover:text-[#E31E24] transition">
              <Trash2 size={18} />
            </button>
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
    const users = prisma.user.findMany();
    if (users.length === 0) setIsBootstrap(true); 
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

        const adminRole = prisma.role.create({ 
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

        const newUser = prisma.user.create({ username, password, name, roleId: adminRole.id });
        onBootstrap();
        onLogin(newUser);
      } else {
        const user = prisma.user.findUnique({ where: { username } });
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
           <Zap size={300} className="text-[#E31E24]" />
        </div>

        <div className="relative z-10">
          <SwiftLogo size="md" className="mb-12" />
          
          <div className="mb-10">
            <h2 className="text-4xl font-black text-[#1A2B6D] uppercase italic tracking-tighter leading-none">
              {isBootstrap ? "Establish Control" : "Personnel Access"}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              {isBootstrap ? "Create primary administrative identity" : "Authorized Command Center Entry"}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-[#E31E24] text-[10px] font-black uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-top-2">
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
                  <input 
                    type="text" 
                    placeholder="E.g. John Doe" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-red-500/10 focus:border-[#E31E24] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Username</label>
              <div className="relative">
                <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-[#1A2B6D] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-[#1A2B6D] transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1A2B6D] transition">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-[#1A2B6D] text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-[#E31E24] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-300"
            >
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
  
  const [dbData, setDbData] = useState({
    partners: [] as Partner[],
    agents: [] as Agent[],
    calls: [] as CallReport[],
    orders: [] as Order[],
    sales: [] as Sale[],
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
      sales: prisma.sale.findMany(),
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
  const isAdmin = currentUserRole?.isSystemAdmin || false;
  const hasPerm = (p: keyof Role) => isAdmin || (currentUserRole && currentUserRole[p]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex items-center gap-4 group">
          <SwiftLogo size="sm" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${prisma.dbInfo.getMode() === 'PRODUCTION' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            <Cloud size={14} className={prisma.dbInfo.getMode() === 'PRODUCTION' ? 'animate-pulse' : ''} />
            {prisma.dbInfo.getMode() === 'PRODUCTION' ? 'Cloud Link Active' : 'Simulation Mode'}
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
             <p className="text-[11px] font-black text-[#1A2B6D] uppercase tracking-tighter leading-none">{currentUser.name}</p>
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{currentUserRole?.name}</p>
           </div>
           <button onClick={handleLogout} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#E31E24] hover:bg-red-50 transition border border-transparent hover:border-red-100"><LogOut size={20} /></button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-[#1A2B6D] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30 shadow-2xl`}>
          <nav className="flex-1 p-3 space-y-2 mt-4">
            {[
              { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard, perm: true },
              { id: 'PORTFOLIO', label: 'My Portfolio', icon: Briefcase, perm: true },
              { id: 'PARTNERS', label: 'Partner Hub', icon: Handshake, perm: hasPerm('canViewPartners') },
              { id: 'ORDERS', label: 'Order Hub', icon: ShoppingCart, perm: hasPerm('canViewOrders') },
              { id: 'SALES', label: 'Sales Ledger', icon: ReceiptText, perm: hasPerm('canViewOrders') },
              { id: 'AGENTS', label: 'Sales Force', icon: UserSquare2, perm: hasPerm('canViewAgents') },
              { id: 'CALL_REPORTS', label: 'Interaction Log', icon: PhoneCall, perm: hasPerm('canViewCalls') },
              { id: 'PRODUCTION', label: 'Production', icon: Database, perm: hasPerm('canViewInventory') },
              { id: 'PRISMA_SCHEMA', label: 'DB Schema', icon: Code, perm: hasPerm('canViewSecurity') },
              { id: 'USER_MANAGEMENT', label: 'Personnel', icon: UserIcon, perm: hasPerm('canManageUsers') },
              { id: 'ROLE_MANAGEMENT', label: 'Security', icon: Shield, perm: hasPerm('canManageRoles') },
            ].map(item => item.perm && (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewState)}
                className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all group ${activeView === item.id ? 'bg-[#E31E24] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
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
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-10">
            {activeView === 'DASHBOARD' && <DashboardView partners={dbData.partners} agents={dbData.agents} inventory={dbData.inventory} orders={dbData.orders} />}
            {activeView === 'PORTFOLIO' && <PortfolioView currentUser={currentUser} agents={dbData.agents} partners={dbData.partners} orders={dbData.orders} sales={dbData.sales} reports={dbData.calls} isAdmin={isAdmin} />}
            {activeView === 'PARTNERS' && <PartnerModule partners={dbData.partners} inventory={dbData.inventory} agents={dbData.agents} onDelete={id => prisma.partner.delete(id)} searchTerm={searchTerm} onSearchChange={setSearchTerm} permissions={currentUserRole} />}
            {activeView === 'ORDERS' && <OrderModule orders={dbData.orders} partners={dbData.partners} inventory={dbData.inventory} />}
            {activeView === 'SALES' && <SalesModule sales={dbData.sales} orders={dbData.orders} partners={dbData.partners} inventory={dbData.inventory} agents={dbData.agents} />}
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

export default App;
