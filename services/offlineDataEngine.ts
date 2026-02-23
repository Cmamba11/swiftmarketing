/**
 * [FRONTEND - UI LAYER]
 * OFFLINE DATA ENGINE (Local Storage Mock)
 */
import { Partner, Agent, CallReport, Order, Sale, User, Role, SystemConfig, PartnerType, VisitOutcome, LogisticsReport, WorkOrder, InventoryItem, InventoryLog } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateInternalOrderId = () => `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
const generateWorkOrderId = () => `WO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

const DB_KEY = 'swift_sales_db';

interface DBState {
  partners: Partner[];
  agents: Agent[];
  calls: CallReport[];
  orders: Order[];
  sales: Sale[];
  users: User[];
  roles: Role[];
  config: SystemConfig;
  logistics: LogisticsReport[];
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  workOrders: WorkOrder[];
}

const getRaw = (): DBState => {
  if (typeof window === 'undefined') return seed();
  const data = localStorage.getItem(DB_KEY);
  if (!data) return seed();
  return JSON.parse(data);
};

const saveRaw = (state: DBState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('prisma-mutation'));
};

const seed = (): DBState => {
  const adminRoleId = generateId();
  const initialState: DBState = {
    partners: [],
    agents: [],
    calls: [],
    orders: [],
    sales: [],
    users: [
      {
        id: generateId(),
        username: 'admin',
        name: 'System Administrator',
        roleId: adminRoleId
      }
    ],
    roles: [
      {
        id: adminRoleId,
        name: 'System Administrator',
        description: 'Full system access',
        isSystemAdmin: true,
        canViewPartners: true,
        canCreatePartners: true,
        canEditPartners: true,
        canDeletePartners: true,
        canViewAgents: true,
        canCreateAgents: true,
        canEditAgents: true,
        canDeleteAgents: true,
        canViewOrders: true,
        canCreateOrders: true,
        canEditOrders: true,
        canDeleteOrders: true,
        canVerifyOrders: true,
        canApproveAsAgentHead: true,
        canApproveAsAccountOfficer: true,
        canViewInventory: true,
        canCreateInventory: true,
        canEditInventory: true,
        canDeleteInventory: true,
        canViewWorkOrders: true,
        canCreateWorkOrders: true,
        canEditWorkOrders: true,
        canDeleteWorkOrders: true,
        canViewCalls: true,
        canCreateCalls: true,
        canEditCalls: true,
        canDeleteCalls: true,
        canViewSecurity: true,
        canManageUsers: true,
        canManageRoles: true
      } as any
    ],
    logistics: [],
    inventory: [],
    inventoryLogs: [],
    workOrders: [],
    config: {
      recommendedCommissionRate: 10,
      targetEfficiencyMetric: 'Lead Conversion',
      customerSegmentationAdvice: ['High Growth', 'SMB'],
      logisticsThreshold: 50,
      lastUpdated: new Date().toISOString()
    }
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(initialState));
  }
  return initialState;
};

export const offlineDataEngine = {
  seed,
  partner: {
    findMany: () => getRaw().partners,
    create: (data: any) => {
      const state = getRaw();
      const newPartner = { ...data, id: generateId() };
      state.partners.push(newPartner);
      saveRaw(state);
      return newPartner;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.partners = state.partners.filter(p => p.id !== id);
      saveRaw(state);
    }
  },
  salesAgent: {
    findMany: () => getRaw().agents,
    create: (data: any) => {
      const state = getRaw();
      const newAgent = { ...data, id: generateId(), performanceScore: 0, customersAcquired: 0, dataAccuracyScore: 100, timelinessScore: 100 };
      state.agents.push(newAgent);
      saveRaw(state);
      return newAgent;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.agents = state.agents.filter(a => a.id !== id);
      saveRaw(state);
    }
  },
  order: {
    findMany: () => getRaw().orders,
    create: (data: any) => {
      const state = getRaw();
      const newOrder: Order = { 
        ...data, 
        id: generateId(), 
        internalId: generateInternalOrderId(), 
        status: 'PENDING',
        adminApproved: false,
        agentHeadApproved: false,
        accountOfficerApproved: false,
        settlementAdminApproved: false,
        settlementAgentHeadApproved: false,
        settlementAccountOfficerApproved: false
      };
      state.orders.push(newOrder);
      saveRaw(state);
      return newOrder;
    },
    approve: (id: string, type: 'ADMIN' | 'AGENT_HEAD' | 'ACCOUNT_OFFICER') => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === id);
      if (order) {
        if (type === 'ADMIN') order.adminApproved = true;
        if (type === 'AGENT_HEAD') order.agentHeadApproved = true;
        if (type === 'ACCOUNT_OFFICER') order.accountOfficerApproved = true;
        saveRaw(state);
      }
    },
    approveSettlement: (id: string, type: 'ADMIN' | 'AGENT_HEAD' | 'ACCOUNT_OFFICER') => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === id);
      if (order) {
        if (type === 'ADMIN') order.settlementAdminApproved = true;
        if (type === 'AGENT_HEAD') order.settlementAgentHeadApproved = true;
        if (type === 'ACCOUNT_OFFICER') order.settlementAccountOfficerApproved = true;
        saveRaw(state);
      }
    },
    updateSettlementData: (id: string, data: { totalKg: number, volume: number, notes: string }) => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === id);
      if (order) {
        order.finalWeight = data.totalKg;
        order.finalUnits = data.volume;
        order.settlementNotes = data.notes;
        saveRaw(state);
      }
    },
    delete: (id: string) => {
      const state = getRaw();
      state.orders = state.orders.filter(o => o.id !== id);
      saveRaw(state);
    },
    close: (id: string) => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === id);
      if (order) {
        order.status = 'CLOSED';
        saveRaw(state);
      }
    }
  },
  sale: {
    findMany: () => getRaw().sales,
    create: (data: any) => {
      const state = getRaw();
      const newSale = { ...data, id: generateId(), date: new Date().toISOString() };
      state.sales.push(newSale);
      saveRaw(state);
      return newSale;
    }
  },
  callReport: {
    findMany: () => getRaw().calls,
    create: (data: any) => {
      const state = getRaw();
      const newCall = { ...data, id: generateId() };
      state.calls.push(newCall);
      saveRaw(state);
      return newCall;
    }
  },
  user: {
    findMany: () => getRaw().users,
    create: (data: any) => {
      const state = getRaw();
      const newUser = { ...data, id: generateId() };
      state.users.push(newUser);
      saveRaw(state);
      return newUser;
    },
    update: (id: string, updates: Partial<User>) => {
      const state = getRaw();
      const index = state.users.findIndex(u => u.id === id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updates };
        saveRaw(state);
        return state.users[index];
      }
      return null;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.users = state.users.filter(u => u.id !== id);
      saveRaw(state);
    }
  },
  role: {
    findMany: () => getRaw().roles,
    create: (data: any) => {
      const state = getRaw();
      const newRole = { ...data, id: generateId() };
      state.roles.push(newRole);
      saveRaw(state);
      return newRole;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.roles = state.roles.filter(r => r.id !== id);
      saveRaw(state);
    }
  },
  config: {
    get: () => getRaw().config,
    update: (updates: any) => {
      const state = getRaw();
      state.config = { ...state.config, ...updates, lastUpdated: new Date().toISOString() };
      saveRaw(state);
    }
  },
  logistics: {
    findMany: () => getRaw().logistics,
    create: (data: any) => {
      const state = getRaw();
      const newReport = { ...data, id: generateId() };
      state.logistics.push(newReport);
      saveRaw(state);
      return newReport;
    }
  },
  inventory: {
    findMany: () => getRaw().inventory,
    create: (data: any) => {
      const state = getRaw();
      const newItem = { ...data, id: generateId(), lastRestocked: new Date().toISOString() };
      state.inventory.push(newItem);
      state.inventoryLogs.push({
        id: generateId(),
        inventoryItemId: newItem.id,
        type: 'INITIAL_STOCK',
        change: newItem.quantity,
        finalQuantity: newItem.quantity,
        timestamp: new Date().toISOString(),
        userName: 'System',
        notes: 'Initial production run'
      });
      saveRaw(state);
      return newItem;
    },
    adjust: (id: string, change: number, type: any, notes: string) => {
      const state = getRaw();
      const item = state.inventory.find(i => i.id === id);
      if (item) {
        item.quantity += change;
        item.lastRestocked = new Date().toISOString();
        state.inventoryLogs.push({
          id: generateId(),
          inventoryItemId: id,
          type,
          change,
          finalQuantity: item.quantity,
          timestamp: new Date().toISOString(),
          userName: 'System',
          notes
        });
        saveRaw(state);
      }
    },
    findLogs: (inventoryItemId: string) => getRaw().inventoryLogs.filter(l => l.inventoryItemId === inventoryItemId),
    delete: (id: string) => {
      const state = getRaw();
      state.inventory = state.inventory.filter(i => i.id !== id);
      state.inventoryLogs = state.inventoryLogs.filter(l => l.inventoryItemId !== id);
      saveRaw(state);
    }
  },
  workOrder: {
    findMany: () => getRaw().workOrders,
    issue: (orderId: string, priority: 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL') => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === orderId);
      if (!order) throw new Error("Reference order missing.");
      const newWO: WorkOrder = {
        id: generateId(),
        orderId: order.id,
        internalId: generateWorkOrderId(),
        status: 'PENDING',
        priority,
        notes: `Production ticket for ${order.internalId}`
      };
      order.status = 'AWAITING_PROD';
      state.workOrders.push(newWO);
      saveRaw(state);
      return newWO;
    },
    updateStatus: (id: string, status: 'IN_PROD' | 'COMPLETED') => {
      const state = getRaw();
      const wo = state.workOrders.find(w => w.id === id);
      if (wo) {
        wo.status = status;
        const order = state.orders.find(o => o.id === wo.orderId);
        if (status === 'IN_PROD') {
          wo.startDate = new Date().toISOString();
          if (order) order.status = 'IN_PROD';
        }
        if (status === 'COMPLETED') {
           if (order) order.status = 'READY_FOR_DISPATCH';
        }
        saveRaw(state);
      }
    },
    delete: (id: string) => {
      const state = getRaw();
      state.workOrders = state.workOrders.filter(w => w.id !== id);
      saveRaw(state);
    }
  }
};