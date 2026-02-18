
/**
 * [FRONTEND - UI CORE]
 * MAIN APP ENTRY - HYBRID MODE (Demo Fallback Enabled)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Handshake, UserSquare2, Package, 
  PhoneCall, Database, Sparkles, Hammer, ShoppingCart, 
  ReceiptText, Briefcase, LogOut, Wifi, WifiOff, AlertCircle, RefreshCw, 
  Users, Shield, FlaskConical
} from 'lucide-react';
import { ViewState, Agent, Partner, CallReport, User as UserType, Role, Order, Sale, WorkOrder } from './types';
import { api } from './services/api';
import { externalDb } from './services/database';

// Import Views
import DashboardView from './components/DashboardView';
import PartnerModule from './components/PartnerModule';
import AgentModule from './components/AgentModule';
import CallReportModule from './components/CallReportModule';
import OrderModule from './components/OrderModule';
import SalesModule from './components/SalesModule';
import PortfolioView from './components/PortfolioView';
import AIArchitect from './components/AIArchitect';
import PrismaExplorer from './components/PrismaExplorer';
import WorkOrderModule from './components/WorkOrderModule';
import UserManagementModule from './components/UserManagementModule';
import RoleManagementModule from './components/RoleManagementModule';

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
        <span className={`${s.subSize} font-black text-[#003358] uppercase tracking-[0.1em] font-black leading-none mt-1 opacity-90`}>Plastics Inc.</span>
      </div>
    </div>
  );
};

const LoginView: React.FC<{ onLogin: (user: UserType) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthChecking(true);
    try {
      const users = await api.users.getAll();
      const user = users.find(u => u.username === username);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } catch (e) {
      setError('System Error - Check your local database connection.');
    } finally {
      setIsAuthChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <SwiftLogo size="md" className="mx-auto" />
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-swift-navy">Personnel Access</h2>
        </div>
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
             <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-swift-navy outline-none" required />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-swift-navy outline-none" required />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
          <button type="submit" disabled={isAuthChecking} className="w-full py-5 bg-swift-navy text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-swift-red transition active:scale-95 flex items-center justify-center gap-3">
            {isAuthChecking ? <RefreshCw className="animate-spin" size={20} /> : 'Initialize Session'}
          </button>
        </form>
        <p className="text-[8px] text-slate-400 uppercase font-bold text-center tracking-widest">Demo Login: admin / any</p>
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
  const [serverStatus, setServerStatus] = useState<{ status: 'ONLINE' | 'OFFLINE' | 'CHECKING'; latency: number }>({ status: 'CHECKING', latency: 0 });
  
  const [dbData, setDbData] = useState({
    partners: [] as Partner[],
    agents: [] as Agent[],
    calls: [] as CallReport[],
    orders: [] as Order[],
    sales: [] as Sale[],
    users: [] as UserType[],
    roles: [] as Role[],
    workOrders: [] as WorkOrder[],
    config: null as any
  });

  const checkConnectivity = useCallback(async () => {
    setServerStatus(prev => ({ ...prev, status: 'CHECKING' }));
    const result = await externalDb.checkHealth();
    setServerStatus({ status: result.status, latency: result.latency });
    return result.status === 'ONLINE';
  }, []);

  const fetchData = useCallback(async () => {
    await checkConnectivity(); // Try connecting, but don't block

    try {
      const [partners, agents, calls, orders, sales, users, roles, workOrders, config] = await Promise.all([
        api.partners.getAll(),
        api.agents.getAll(),
        api.calls.getAll(),
        api.orders.getAll(),
        api.sales.getAll(),
        api.users.getAll(),
        api.roles.getAll(),
        api.workOrders.getAll(),
        api.config.get()
      ]);

      setDbData({
        partners: partners || [],
        agents: agents || [],
        calls: calls || [],
        orders: orders || [],
        sales: sales || [],
        users: users || [],
        roles: roles || [],
        workOrders: workOrders || [],
        config: config
      });
    } catch (e) {
      console.error("Data fetch error, engine might be in sandbox mode:", e);
    }
  }, [checkConnectivity]);

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
  };

  if (!currentUser) return <LoginView onLogin={handleLogin} />;

  // Permission Logic
  const currentRole = dbData.roles.find(r => r.id === currentUser.roleId);
  const isAdmin = currentRole?.isSystemAdmin || currentUser.username === 'admin';

  const navItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { id: 'PARTNERS', icon: Handshake, label: 'Partners', show: isAdmin || currentRole?.canViewPartners },
    { id: 'AGENTS', icon: UserSquare2, label: 'Agents', show: isAdmin || currentRole?.canViewAgents },
    { id: 'ORDERS', icon: ShoppingCart, label: 'Orders', show: isAdmin || currentRole?.canViewOrders },
    { id: 'WORK_ORDERS', icon: Hammer, label: 'Work Orders', show: isAdmin || currentRole?.canViewWorkOrders },
    { id: 'SALES', icon: ReceiptText, label: 'Sales', show: isAdmin },
    { id: 'CALL_REPORTS', icon: PhoneCall, label: 'Calls', show: isAdmin || currentRole?.canViewCalls },
    { id: 'PORTFOLIO', icon: Briefcase, label: 'Portfolio', show: !!currentUser.agentId || isAdmin },
    { id: 'USER_MANAGEMENT', icon: Users, label: 'Personnel', show: isAdmin || currentRole?.canManageUsers },
    { id: 'ROLE_MANAGEMENT', icon: Shield, label: 'Permissions', show: isAdmin || currentRole?.canManageRoles },
    { id: 'AI_ARCHITECT', icon: Sparkles, label: 'AI Architect', show: isAdmin || currentRole?.canAccessAIArchitect },
    { id: 'PRISMA_SCHEMA', icon: Database, label: 'Database', show: isAdmin },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex items-center gap-6 group">
          <SwiftLogo size="sm" />
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${serverStatus.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {serverStatus.status === 'ONLINE' ? <Wifi size={14} className="animate-pulse" /> : <FlaskConical size={14} className="text-amber-500" />}
            <span>{serverStatus.status === 'ONLINE' ? `Live DB • ${serverStatus.latency}ms` : 'Demo Sandbox Mode'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400">Current User</p>
              <p className="text-xs font-black text-swift-navy uppercase italic">{currentUser.name}</p>
           </div>
           <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-slate-900 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30`}>
          <div className="flex-1 overflow-y-auto py-6 space-y-2">
            {navItems.filter(i => i.show).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id as ViewState)} className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${activeView === item.id ? 'bg-swift-navy text-white border-l-4 border-swift-green' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={20} />
                {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>}
              </button>
            ))}
          </div>
        </aside>
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-10">
            {activeView === 'DASHBOARD' && <DashboardView partners={dbData.partners} agents={dbData.agents} orders={dbData.orders} />}
            {activeView === 'ORDERS' && <OrderModule orders={dbData.orders} partners={dbData.partners} agents={dbData.agents} currentUser={currentUser} roles={dbData.roles} />}
            {activeView === 'WORK_ORDERS' && <WorkOrderModule workOrders={dbData.workOrders} orders={dbData.orders} partners={dbData.partners} permissions={currentRole} />}
            {activeView === 'PARTNERS' && <PartnerModule partners={dbData.partners} agents={dbData.agents} onDelete={(id) => api.partners.delete(id)} searchTerm="" onSearchChange={() => {}} permissions={currentRole} />}
            {activeView === 'AGENTS' && <AgentModule agents={dbData.agents} onDelete={(id) => api.agents.delete(id)} onEdit={() => {}} onAssignLead={() => {}} onViewStats={() => {}} searchTerm="" onSearchChange={() => {}} permissions={currentRole} />}
            {activeView === 'SALES' && <SalesModule sales={dbData.sales} orders={dbData.orders} partners={dbData.partners} agents={dbData.agents} currentUser={currentUser} roles={dbData.roles} />}
            {activeView === 'CALL_REPORTS' && <CallReportModule reports={dbData.calls} customers={dbData.partners} agents={dbData.agents} onEdit={() => {}} onDelete={() => {}} searchTerm="" onSearchChange={() => {}} permissions={currentRole} />}
            {activeView === 'PORTFOLIO' && <PortfolioView currentUser={currentUser} agents={dbData.agents} partners={dbData.partners} orders={dbData.orders} sales={dbData.sales} reports={dbData.calls} isAdmin={isAdmin || false} />}
            {activeView === 'USER_MANAGEMENT' && <UserManagementModule users={dbData.users} roles={dbData.roles} agents={dbData.agents} />}
            {activeView === 'ROLE_MANAGEMENT' && <RoleManagementModule roles={dbData.roles} />}
            {activeView === 'AI_ARCHITECT' && <AIArchitect currentConfig={dbData.config} />}
            {activeView === 'PRISMA_SCHEMA' && <PrismaExplorer />}
        </main>
      </div>
    </div>
  );
};

export default App;
