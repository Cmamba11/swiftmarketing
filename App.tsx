
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, UserSquare2, Truck, Banknote, Sparkles, Menu, X, Package, 
  Terminal, Code, PhoneCall, Database, Bell, Search, Zap, LogOut, ShieldAlert, UserPlus, Trash2
} from 'lucide-react';
import { ViewState, CustomerType, Agent, Customer, CallReport, User, UserRole } from './types';
import { prisma } from './services/prisma';

// Import Views
import DashboardView from './components/DashboardView';
import CustomerModule from './components/CustomerModule';
import AgentModule from './components/AgentModule';
import LogisticsModule from './components/LogisticsModule';
import CommissionModule from './components/CommissionModule';
import AIArchitect from './components/AIArchitect';
import ProductionModule from './components/ProductionModule';
import CallReportModule from './components/CallReportModule';
import PrismaExplorer from './components/PrismaExplorer';

/**
 * HIGH-FIDELITY SWIFT LOGO COMPONENT
 * Recreated based on provided branding image
 */
const SwiftLogo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
  const scale = size === "sm" ? 0.6 : size === "lg" ? 1.5 : 1;
  const width = 160 * scale;
  const height = 100 * scale;

  return (
    <div className={`flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300 ${className}`}>
      <svg width={width} height={height} viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Red Sun Background */}
        <circle cx="80" cy="45" r="35" fill="#E31E24" />
        
        {/* White Waves inside Sun */}
        <path d="M60 40C65 37 70 43 75 40C80 37 85 43 90 40C95 37 100 43 105 40" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 44C67 41 72 47 77 44C82 41 87 47 92 44C97 41 102 47 107 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M64 48C69 45 74 51 79 48C84 45 89 51 94 48C99 45 104 51 109 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

        {/* Blue Splash Drops */}
        <path d="M102 28C102 28 100 32 101 35C102 38 105 38 106 35C107 32 102 28 102 28Z" fill="#1A2B6D" />
        <path d="M110 32C110 32 108 36 109 39C110 42 113 42 114 39C115 36 110 32 110 32Z" fill="#1A2B6D" />

        {/* "swift" Typography with background/outline effect */}
        <g filter="url(#shadow)">
          <rect x="35" y="45" width="90" height="25" rx="4" fill="#1A2B6D" />
          <text x="80" y="65" textAnchor="middle" fill="white" style={{ font: 'italic 900 32px sans-serif', letterSpacing: '-2px' }}>swift</text>
        </g>

        {/* Subtext Branding */}
        <text x="80" y="82" textAnchor="middle" fill="#E31E24" style={{ font: 'bold 9px sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>PLASTICS INC.</text>
        
        {/* EST 2022 Footer with Lines */}
        <line x1="40" y1="92" x2="65" y2="92" stroke="#E31E24" strokeWidth="1" />
        <text x="80" y="95" textAnchor="middle" fill="#E31E24" style={{ font: '500 7px sans-serif', letterSpacing: '1px' }}>EST. 2022</text>
        <line x1="95" y1="92" x2="120" y2="92" stroke="#E31E24" strokeWidth="1" />

        <defs>
          <filter id="shadow" x="0" y="0" width="200" height="200">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

/**
 * LOGIN VIEW
 */
const LoginView = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Safety: ensure seed runs
    prisma.seed();

    setTimeout(() => {
      const user = prisma.user.findUnique({ where: { username } });
      if (user && password === 'admin123') {
        onLogin(user);
      } else {
        setError('Invalid credentials. (Username: admin / Password: admin123)');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-swift-red/10 rounded-full -mr-48 -mt-48 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full -ml-48 -mb-48 blur-[120px]"></div>
      
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 p-12 relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-8">
          <SwiftLogo size="lg" />
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Authorized Personnel</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">System Core v3.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal ID</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-swift-red outline-none transition font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="e.g. admin"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-swift-red outline-none transition font-bold text-slate-800 placeholder:text-slate-300"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black rounded-xl animate-bounce uppercase text-center tracking-tight">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#1A2B6D] text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#1A2B6D]/90 active:scale-[0.98] transition shadow-2xl shadow-blue-900/20 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Establish Connection"}
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-4">
            <ShieldAlert size={14} className="text-slate-300" />
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Secured by SwiftOS Biometrics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * USER MANAGEMENT VIEW (ADMIN ONLY)
 */
const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', name: '', role: UserRole.AGENT });

  useEffect(() => {
    setUsers(prisma.user.findMany());
    const handleMutation = () => setUsers(prisma.user.findMany());
    window.addEventListener('prisma-mutation', handleMutation);
    return () => window.removeEventListener('prisma-mutation', handleMutation);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    prisma.user.create(newUserData);
    setNewUserData({ username: '', name: '', role: UserRole.AGENT });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this system user?')) prisma.user.delete(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-swift-navy">Access Control Hub</h3>
          <p className="text-sm text-slate-400">Admin management for factory personnel access</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-swift-red text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-100 hover:opacity-90 active:scale-95 transition"
        >
          <UserPlus size={18} />
          New User
        </button>
      </div>

      {showAdd && (
        <div className="bg-swift-navy p-8 rounded-3xl text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase">Full Name</label>
              <input 
                type="text" 
                value={newUserData.name}
                onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition"
                placeholder="John Doe" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase">Username</label>
              <input 
                type="text" 
                value={newUserData.username}
                onChange={e => setNewUserData({...newUserData, username: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition"
                placeholder="jdoe" required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase">Role</label>
              <select 
                value={newUserData.role}
                onChange={e => setNewUserData({...newUserData, role: e.target.value as UserRole})}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition"
              >
                {Object.values(UserRole).map(role => <option key={role} value={role} className="text-black">{role}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-white text-swift-navy py-3 rounded-xl font-bold">Add User</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-3 bg-white/10 rounded-xl"><X size={18}/></button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-widest">Full Name</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-widest">Username</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-widest">Role</th>
              <th className="px-6 py-5 text-[10px] font-bold text-swift-navy uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition group">
                <td className="px-6 py-5 font-bold text-slate-800">{u.name}</td>
                <td className="px-6 py-5 font-mono text-sm text-slate-400">{u.username}</td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    u.role === UserRole.ADMIN ? 'bg-swift-red text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => handleDelete(u.id)}
                    disabled={u.username === 'admin'}
                    className="p-2 text-slate-300 hover:text-red-500 transition disabled:opacity-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * ROOT APP
 */
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('swift_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse swift_session", e);
      return null;
    }
  });
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [dbData, setDbData] = useState({
    customers: [] as Customer[],
    agents: [] as Agent[],
    calls: [] as CallReport[],
    inventory: [] as any[],
    commissions: [] as any[],
    logistics: [] as any[],
    config: {
      recommendedCommissionRate: 10,
      targetEfficiencyMetric: 'Delivery Speed',
      customerSegmentationAdvice: [],
      logisticsThreshold: 50,
      lastUpdated: new Date().toISOString()
    }
  });

  const fetchData = () => {
    prisma.seed();
    setDbData({
      customers: prisma.wholesaler.findMany(),
      agents: prisma.salesAgent.findMany(),
      calls: prisma.callReport.findMany(),
      inventory: prisma.inventory.findMany(),
      commissions: prisma.commission.findMany(),
      logistics: prisma.logistics.findMany(),
      config: dbData.config
    });
  };

  useEffect(() => {
    // Crucial: Seed even if not logged in so Admin exists
    prisma.seed();
    
    if (currentUser) fetchData();
    const handleMutation = () => fetchData();
    const handleLog = (e: any) => setLogs(prev => [e.detail, ...prev].slice(0, 50));

    window.addEventListener('prisma-mutation', handleMutation);
    window.addEventListener('prisma-log', handleLog);
    return () => {
      window.removeEventListener('prisma-mutation', handleMutation);
      window.removeEventListener('prisma-log', handleLog);
    };
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('swift_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('swift_session');
  };

  if (!currentUser) return <LoginView onLogin={handleLogin} />;

  const isRole = (role: UserRole) => currentUser.role === role;
  const isAdmin = isRole(UserRole.ADMIN);

  // Filter accessible nav items based on roles
  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, access: true },
    { id: 'CUSTOMERS', label: 'Wholesalers', icon: Users, access: isAdmin || isRole(UserRole.AGENT) },
    { id: 'AGENTS', label: 'Sales Force', icon: UserSquare2, access: isAdmin || isRole(UserRole.AGENT) },
    { id: 'CALL_REPORTS', label: 'Call Hub', icon: PhoneCall, access: isAdmin || isRole(UserRole.AGENT) },
    { id: 'PRODUCTION', label: 'Inventory', icon: Database, access: isAdmin || isRole(UserRole.PRODUCTION) },
    { id: 'LOGISTICS', label: 'Logistics', icon: Truck, access: isAdmin || isRole(UserRole.LOGISTICS) || isRole(UserRole.PRODUCTION) },
  ].filter(i => i.access);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex items-center gap-4 group">
          <SwiftLogo size="sm" />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 border-l border-slate-100 pl-6">
            <div className="text-right">
              <p className="text-[11px] font-black text-[#1A2B6D] leading-none uppercase tracking-tighter">{currentUser.name}</p>
              <p className="text-[9px] font-bold text-[#E31E24] uppercase tracking-widest mt-1">Terminal {currentUser.role}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="p-3 text-slate-400 hover:text-swift-red transition rounded-2xl hover:bg-red-50 active:scale-95">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-[#1A2B6D] transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.05)]`}>
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            {sidebarOpen && <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Main Controls</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 transition">
              {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-2 mt-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewState)}
                className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  activeView === item.id ? 'bg-[#E31E24] text-white shadow-xl shadow-red-900/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={activeView === item.id ? 'animate-pulse' : ''} />
                {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>}
              </button>
            ))}
            
            {isAdmin && (
              <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
                <button
                  onClick={() => setActiveView('USER_MANAGEMENT')}
                  className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    activeView === 'USER_MANAGEMENT' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white'
                  }`}
                >
                  <ShieldAlert size={20} />
                  {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">Security Center</span>}
                </button>
                <button
                  onClick={() => setActiveView('PRISMA_SCHEMA')}
                  className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    activeView === 'PRISMA_SCHEMA' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white'
                  }`}
                >
                  <Code size={20} />
                  {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">Schema Lab</span>}
                </button>
                <button
                  onClick={() => setActiveView('AI_ARCHITECT')}
                  className={`flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                    activeView === 'AI_ARCHITECT' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white'
                  }`}
                >
                  <Sparkles size={20} />
                  {sidebarOpen && <span className="text-sm font-bold uppercase tracking-tight">AI Optimus</span>}
                </button>
              </div>
            )}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-[#F9FAFB] p-10">
          <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="flex items-center gap-3 mb-2">
               <div className="h-[2px] w-8 bg-swift-red"></div>
               <p className="text-[10px] font-black text-swift-red uppercase tracking-[0.4em]">{currentUser.role} ENVIRONMENT</p>
             </div>
             <h2 className="text-4xl font-black text-swift-navy tracking-tighter uppercase italic drop-shadow-sm">
               {activeView.replace('_', ' ')}
             </h2>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {activeView === 'DASHBOARD' && <DashboardView {...dbData} />}
            {activeView === 'CUSTOMERS' && <CustomerModule customers={dbData.customers} onEdit={()=>{}} onDelete={()=>{}} searchTerm="" onSearchChange={()=>{}} />}
            {activeView === 'AGENTS' && <AgentModule agents={dbData.agents} onEdit={()=>{}} onDelete={()=>{}} onAssignLead={()=>{}} onViewStats={()=>{}} searchTerm="" onSearchChange={()=>{}} />}
            {activeView === 'PRODUCTION' && <ProductionModule customers={dbData.customers} inventory={dbData.inventory} />}
            {activeView === 'CALL_REPORTS' && <CallReportModule reports={dbData.calls} customers={dbData.customers} agents={dbData.agents} onEdit={()=>{}} onDelete={()=>{}} searchTerm="" onSearchChange={()=>{}} />}
            {activeView === 'PRISMA_SCHEMA' && <PrismaExplorer />}
            {activeView === 'USER_MANAGEMENT' && <UserManagementView />}
            {activeView === 'LOGISTICS' && <LogisticsModule reports={dbData.logistics} config={dbData.config} onEdit={()=>{}} onDelete={()=>{}} searchTerm="" onSearchChange={()=>{}} />}
            {activeView === 'AI_ARCHITECT' && <AIArchitect currentConfig={dbData.config} />}
          </div>
        </main>
      </div>

      <DevOverlay logs={logs} />
    </div>
  );
};

const DevOverlay = ({ logs }: { logs: string[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button 
        onClick={() => setOpen(!open)}
        className="bg-slate-900 text-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-slate-700 hover:scale-110 active:scale-90 transition-all duration-300"
      >
        <Terminal size={20} className="text-emerald-400" />
        <span className="text-[10px] font-black uppercase tracking-widest">Database Stream</span>
      </button>
      {open && (
        <div className="absolute bottom-20 right-0 w-[400px] bg-slate-900 rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
          <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Logs</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active</span>
            </div>
          </div>
          <div className="p-6 h-[400px] overflow-y-auto font-mono text-[11px] space-y-3 bg-black/40">
            {logs.length === 0 ? <p className="text-slate-600 italic text-center mt-10">Monitoring relay status...</p> : 
             logs.map((log, i) => (
               <div key={i} className="text-slate-300 border-l-2 border-emerald-500/50 pl-4 py-2 leading-relaxed bg-white/5 rounded-r-lg">
                 <span className="text-emerald-400/50 block mb-1 text-[9px]">{new Date().toISOString()}</span>
                 {log}
               </div>
             ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
