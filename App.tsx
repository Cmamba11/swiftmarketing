
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Users, UserSquare2, Sparkles, Menu, X, Package, 
  Code, PhoneCall, Database, Search, Zap, LogOut, ShieldAlert, UserPlus, Trash2, Edit3, Save, 
  BarChart3, TrendingUp, Target, Award, ShieldCheck, Key, Rocket, Settings2, Plus, Check, Shield, User as UserIcon, Lock
} from 'lucide-react';
import { ViewState, Agent, Customer, CallReport, User as UserType, Role, InventoryItem } from './types';
import { prisma } from './services/prisma';

// Import Views
import DashboardView from './components/DashboardView';
import CustomerModule from './components/CustomerModule';
import AgentModule from './components/AgentModule';
import AIArchitect from './components/AIArchitect';
import ProductionModule from './components/ProductionModule';
import CallReportModule from './components/CallReportModule';
import PrismaExplorer from './components/PrismaExplorer';

/**
 * ROLE MANAGEMENT COMMAND CENTER
 */
const RoleManagementView = ({ roles, onDelete, onCreate }: { roles: Role[], onDelete: (id: string) => void, onCreate: (data: Omit<Role, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    isSystemAdmin: false,
    canManageInventory: true,
    canManageWholesalers: true,
    canManageAgents: true,
    canManageCalls: true,
    canAccessAI: true,
    canCreate: true,
    canEdit: true,
    canDelete: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({ 
      name: '', description: '', isSystemAdmin: false,
      canManageInventory: true, canManageWholesalers: true,
      canManageAgents: true, canManageCalls: true, canAccessAI: true,
      canCreate: true, canEdit: true, canDelete: false
    });
    setShowAdd(false);
  };

  const PermissionToggle = ({ label, field, value, colorClass = "bg-swift-red" }: { label: string, field: keyof typeof formData, value: boolean, colorClass?: string }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <button 
        type="button"
        onClick={() => setFormData(prev => ({ ...prev, [field]: !value }))}
        className={`w-12 h-6 rounded-full transition-all relative ${value ? colorClass : 'bg-slate-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Settings2 size={200} /></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Access Control Center</h2>
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
            Provision organizational roles. Separate viewing rights from creation and deletion for strict security.
          </p>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="mt-8 flex items-center gap-3 px-8 py-4 bg-swift-red text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-xl"
          >
            {showAdd ? <X size={20} /> : <Plus size={20} />}
            {showAdd ? "Discard Changes" : "Forge New Role"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 text-swift-navy border-b border-slate-100 pb-4">
            <Shield size={24} className="text-swift-red" />
            Role Manifest Initialization
          </h3>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Name</label>
                <input 
                  type="text" value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-swift-red font-bold"
                  placeholder="E.g. Inventory Clerk" required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope Description</label>
                <input 
                  type="text" value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-swift-red font-bold"
                  placeholder="What can this person do?" required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutDashboard size={14} /> Module Visibility
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <PermissionToggle label="Inventory Module" field="canManageInventory" value={formData.canManageInventory} />
                <PermissionToggle label="Wholesaler Module" field="canManageWholesalers" value={formData.canManageWholesalers} />
                <PermissionToggle label="Sales Rep Module" field="canManageAgents" value={formData.canManageAgents} />
                <PermissionToggle label="Call Interaction Hub" field="canManageCalls" value={formData.canManageCalls} />
                <PermissionToggle label="AI Optimus Console" field="canAccessAI" value={formData.canAccessAI} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Key size={14} /> Action Permissions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PermissionToggle label="Allow Data Creation" field="canCreate" value={formData.canCreate} colorClass="bg-blue-600" />
                <PermissionToggle label="Allow Record Editing" field="canEdit" value={formData.canEdit} colorClass="bg-amber-500" />
                <PermissionToggle label="Allow Hard Deletion" field="canDelete" value={formData.canDelete} colorClass="bg-swift-red" />
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-swift-navy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-xl">
              Establish Permissions & Save Role
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl text-swift-navy group-hover:bg-swift-navy group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              {role.isSystemAdmin && (
                <span className="bg-swift-red text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Master Admin</span>
              )}
            </div>
            <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">{role.name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6 h-12 overflow-hidden">{role.description}</p>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 border-t border-slate-50 pt-4">
                {role.canManageInventory && <span className="text-[7px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">Inventory</span>}
                {role.canManageWholesalers && <span className="text-[7px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">Wholesalers</span>}
                {role.canManageAgents && <span className="text-[7px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">Agents</span>}
              </div>
              <div className="flex gap-4 border-t border-slate-50 pt-4">
                <div className="flex flex-col items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${role.canCreate ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <span className="text-[6px] font-black uppercase">Create</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${role.canEdit ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  <span className="text-[6px] font-black uppercase">Edit</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`w-3 h-3 rounded-full ${role.canDelete ? 'bg-swift-red' : 'bg-slate-200'}`} />
                  <span className="text-[6px] font-black uppercase">Delete</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              {!role.isSystemAdmin && (
                <button 
                  onClick={() => onDelete(role.id)}
                  className="p-3 text-slate-300 hover:text-swift-red hover:bg-red-50 rounded-2xl transition border border-transparent hover:border-red-100"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * USER MANAGEMENT VIEW
 */
const UserManagementView = ({ users, roles, onDelete, onCreate }: { users: UserType[], roles: Role[], onDelete: (id: string) => void, onCreate: (data: Omit<UserType, 'id'>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ username: '', name: '', roleId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleId) return;
    onCreate(formData);
    setFormData({ username: '', name: '', roleId: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-swift-navy rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><UserPlus size={200} /></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Personnel Directory</h2>
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">Manage system users and link them to security roles.</p>
          <button onClick={() => setShowAdd(!showAdd)} className="mt-8 flex items-center gap-3 px-8 py-4 bg-swift-red text-white rounded-2xl font-black uppercase hover:scale-105 transition shadow-xl">
            {showAdd ? <X size={20} /> : <UserPlus size={20} />}
            {showAdd ? "Cancel" : "Add Personnel"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-10 rounded-[3rem] border-2 border-swift-navy shadow-2xl animate-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
              <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
              <select value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 font-bold" required>
                <option value="">Select Role...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <button type="submit" className="md:col-span-3 py-4 bg-swift-navy text-white rounded-2xl font-black uppercase shadow-xl hover:bg-swift-red transition">Assign Credentials</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => {
          const role = roles.find(r => r.id === user.roleId);
          return (
            <div key={user.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-100 rounded-2xl text-swift-navy"><UserIcon size={24} /></div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{user.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">{role?.name || 'No Role'}</span>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button onClick={() => onDelete(user.id)} className="p-3 text-slate-300 hover:text-swift-red transition"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ROOT APP
 */
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
    customers: [] as Customer[],
    agents: [] as Agent[],
    calls: [] as CallReport[],
    inventory: [] as InventoryItem[],
    users: [] as UserType[],
    roles: [] as Role[],
    config: prisma.config.get()
  });

  const fetchData = useCallback(() => {
    // Seed checks if empty and initializes SILENTLY to prevent loop
    prisma.seed();
    setDbData({
      customers: prisma.wholesaler.findMany(),
      agents: prisma.salesAgent.findMany(),
      calls: prisma.callReport.findMany(),
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

  if (!currentUser) return (
    <LoginView onLogin={user => { setCurrentUser(user); localStorage.setItem('swift_session', JSON.stringify(user)); }} onBootstrap={fetchData} />
  );

  const currentUserRole = dbData.roles.find(r => r.id === currentUser.roleId);
  const isAdmin = currentUserRole?.isSystemAdmin || false;

  const handleCreateUser = (data: Omit<UserType, 'id'>) => {
    prisma.user.create(data);
    fetchData();
  };

  const handleCreateRole = (data: Omit<Role, 'id'>) => {
    prisma.role.create(data);
    fetchData();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Revoke access?')) {
      prisma.user.delete(id);
      if (id === currentUser.id) {
        setCurrentUser(null);
        localStorage.removeItem('swift_session');
      }
      fetchData();
    }
  };

  const handleDeleteRole = (id: string) => {
    try {
      prisma.role.delete(id);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex items-center gap-4 group"><SwiftLogo size="sm" /></div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 border-l border-slate-100 pl-6">
            <div className="text-right">
              <p className="text-[11px] font-black text-[#1A2B6D] uppercase tracking-tighter leading-none">{currentUser.name}</p>
              <p className="text-[9px] font-bold text-[#E31E24] uppercase mt-1">{currentUserRole?.name || 'Personnel'}</p>
            </div>
            <button onClick={() => { setCurrentUser(null); localStorage.removeItem('swift_session'); }} className="p-3 text-slate-400 hover:text-swift-red transition rounded-2xl hover:bg-red-50"><LogOut size={20} /></button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-[#1A2B6D] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30 shadow-2xl`}>
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            {sidebarOpen && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Modules</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 transition">{sidebarOpen ? <X size={14} /> : <Menu size={14} />}</button>
          </div>
          <nav className="flex-1 p-3 space-y-2 mt-4">
            {[
              { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard },
              { id: 'CUSTOMERS', label: 'Wholesalers', icon: Users, perm: currentUserRole?.canManageWholesalers },
              { id: 'AGENTS', label: 'Sales Force', icon: UserSquare2, perm: currentUserRole?.canManageAgents },
              { id: 'CALL_REPORTS', label: 'Call Hub', icon: PhoneCall, perm: currentUserRole?.canManageCalls },
              { id: 'PRODUCTION', label: 'Inventory', icon: Database, perm: currentUserRole?.canManageInventory },
            ].map(item => (isAdmin || item.perm) && (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewState)}
                className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeView === item.id ? 'bg-[#E31E24] text-white shadow-xl' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>}
              </button>
            ))}
            {isAdmin && (
              <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
                <button onClick={() => setActiveView('ROLE_MANAGEMENT')} className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeView === 'ROLE_MANAGEMENT' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><Shield size={20} />{sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">Roles</span>}</button>
                <button onClick={() => setActiveView('USER_MANAGEMENT')} className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeView === 'USER_MANAGEMENT' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><UserPlus size={20} />{sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">Personnel</span>}</button>
                <button onClick={() => setActiveView('PRISMA_SCHEMA')} className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeView === 'PRISMA_SCHEMA' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><Code size={20} />{sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">Schema</span>}</button>
                <button onClick={() => setActiveView('AI_ARCHITECT')} className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeView === 'AI_ARCHITECT' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><Sparkles size={20} />{sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">AI Optimus</span>}</button>
              </div>
            )}
          </nav>
        </aside>
        
        <main className="flex-1 overflow-y-auto relative bg-[#F9FAFB] p-10">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {activeView === 'DASHBOARD' && <DashboardView customers={dbData.customers} agents={dbData.agents} inventory={dbData.inventory} />}
            {activeView === 'CUSTOMERS' && (
              <CustomerModule 
                customers={dbData.customers} 
                onEdit={data => {}} 
                onDelete={id => prisma.wholesaler.delete(id)} 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm}
                permissions={currentUserRole}
              />
            )}
            {activeView === 'AGENTS' && (
              <AgentModule 
                agents={dbData.agents} 
                onEdit={() => {}} 
                onDelete={id => prisma.salesAgent.delete(id)} 
                onAssignLead={()=>{}} 
                onViewStats={() => {}} 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                permissions={currentUserRole}
              />
            )}
            {activeView === 'PRODUCTION' && (
              <ProductionModule 
                customers={dbData.customers} 
                inventory={dbData.inventory} 
                onDelete={id => prisma.inventory.delete(id)}
                permissions={currentUserRole}
              />
            )}
            {activeView === 'CALL_REPORTS' && (
              <CallReportModule 
                reports={dbData.calls} 
                customers={dbData.customers} 
                agents={dbData.agents} 
                onEdit={() => {}} 
                onDelete={id => {}} 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                permissions={currentUserRole}
              />
            )}
            {activeView === 'ROLE_MANAGEMENT' && <RoleManagementView roles={dbData.roles} onDelete={handleDeleteRole} onCreate={handleCreateRole} />}
            {activeView === 'USER_MANAGEMENT' && <UserManagementView users={dbData.users} roles={dbData.roles} onDelete={handleDeleteUser} onCreate={handleCreateUser} />}
            {activeView === 'AI_ARCHITECT' && <AIArchitect currentConfig={dbData.config} />}
            {activeView === 'PRISMA_SCHEMA' && <PrismaExplorer />}
          </div>
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
  const [password, setPassword] = useState('');
  const [isBootstrap, setIsBootstrap] = useState(false);

  useEffect(() => {
    const users = prisma.user.findMany();
    if (users.length === 0) setIsBootstrap(true);
  }, []);

  const handleAction = () => {
    if (isBootstrap) {
      if (!username || !name) return;
      const adminRole = prisma.role.create({
        name: 'System Owner',
        description: 'Absolute administrative control.',
        isSystemAdmin: true,
        canManageInventory: true,
        canManageWholesalers: true,
        canManageAgents: true,
        canManageCalls: true,
        canAccessAI: true,
        canCreate: true,
        canEdit: true,
        canDelete: true
      });
      const newUser = prisma.user.create({ username, name, roleId: adminRole.id });
      onBootstrap();
      onLogin(newUser);
    } else {
      const u = prisma.user.findUnique({where: {username}}); 
      if(u) onLogin(u);
      else alert("Authentication Failed. Check username and password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
      <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl border border-white/10">
        <SwiftLogo size="lg" className="mb-10" />
        {isBootstrap && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 text-swift-navy animate-pulse">
            <Rocket size={24} className="text-swift-red" />
            <p className="text-xs font-black uppercase">Initial Launch Sequence</p>
          </div>
        )}
        <div className="space-y-6">
          {isBootstrap && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swift-red font-bold" />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swift-red font-bold" />
          </div>
          <button onClick={handleAction} className="w-full py-5 bg-swift-navy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-swift-red transition shadow-xl flex items-center justify-center gap-3">
            {isBootstrap ? "Execute Deployment" : "Enter System"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
