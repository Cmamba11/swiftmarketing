
import { Partner, Agent, InventoryItem, PartnerType, VisitOutcome, CallReport, User, Role, SystemConfig, LogisticsReport, Commission, Order, OrderItem } from '../types';
import { externalDb } from './database';

/**
 * SWIFT PLASTICS - CORE DATA ENGINE (Simulated Prisma)
 * Version 13: Granular Security Matrix
 */

const DB_KEY = 'swift_plastics_db_v13';
const CONFIG_KEY = 'swift_plastics_config_v2';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

interface DBState {
  users: User[];
  roles: Role[];
  partners: Partner[];
  agents: Agent[];
  inventory: InventoryItem[];
  calls: CallReport[];
  orders: Order[];
  logistics: LogisticsReport[];
  commissions: Commission[];
}

const getRaw = (): DBState => {
  const data = localStorage.getItem(DB_KEY);
  const fallback: DBState = { users: [], roles: [], partners: [], agents: [], inventory: [], calls: [], orders: [], logistics: [], commissions: [] };
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    return { ...fallback, ...parsed };
  } catch (e) {
    return fallback;
  }
};

const saveRaw = (data: DBState, silent: boolean = false) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  if (externalDb.getMode() === 'PRODUCTION') {
    externalDb.syncToCloud(data);
  }
  if (!silent) {
    window.dispatchEvent(new CustomEvent('prisma-mutation', { detail: { timestamp: Date.now() } }));
    window.dispatchEvent(new Event('prisma-mutation'));
  }
};

export const prisma = {
  dbInfo: {
    getMode: () => externalDb.getMode(),
    syncNow: async () => {
      const state = getRaw();
      return await externalDb.syncToCloud(state);
    }
  },
  config: {
    get: (): SystemConfig => {
      const data = localStorage.getItem(CONFIG_KEY);
      if (!data) return {
        recommendedCommissionRate: 10,
        targetEfficiencyMetric: 'Order Fulfillment',
        customerSegmentationAdvice: [],
        logisticsThreshold: 0,
        lastUpdated: new Date().toISOString()
      };
      return JSON.parse(data);
    },
    update: (data: Partial<SystemConfig>) => {
      const current = prisma.config.get();
      const updated = { ...current, ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('prisma-mutation'));
      return updated;
    }
  },
  role: {
    findMany: () => getRaw().roles,
    create: (data: Omit<Role, 'id'>) => {
      const state = getRaw();
      const newRole = { ...data, id: generateId() };
      state.roles.push(newRole);
      saveRaw(state);
      return newRole;
    },
    delete: (id: string) => {
      const state = getRaw();
      if (state.users.some(u => u.roleId === id)) throw new Error("Role in use.");
      state.roles = state.roles.filter(r => r.id !== id);
      saveRaw(state);
    }
  },
  user: {
    findMany: () => getRaw().users,
    findUnique: (args: { where: { username: string } }) => {
      return getRaw().users.find(u => u.username === args.where.username);
    },
    create: (data: Omit<User, 'id'>) => {
      const state = getRaw();
      const newUser = { ...data, id: generateId() };
      state.users.push(newUser);
      saveRaw(state);
      return newUser;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.users = state.users.filter(u => u.id !== id);
      saveRaw(state);
    }
  },
  partner: {
    findMany: () => getRaw().partners,
    create: (data: Omit<Partner, 'id' | 'assignedAgentId'>) => {
      const state = getRaw();
      const newItem: Partner = { ...data, id: generateId(), assignedAgentId: '' };
      state.partners.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.partners = state.partners.filter(p => p.id !== id);
      saveRaw(state);
    },
    update: (id: string, data: Partial<Partner>) => {
      const state = getRaw();
      state.partners = state.partners.map(p => p.id === id ? { ...p, ...data } : p);
      saveRaw(state);
    }
  },
  wholesaler: {
    findMany: () => prisma.partner.findMany(),
    create: (data: Omit<Partner, 'id' | 'assignedAgentId'>) => prisma.partner.create(data),
    delete: (id: string) => prisma.partner.delete(id),
    update: (id: string, data: Partial<Partner>) => prisma.partner.update(id, data)
  },
  salesAgent: {
    findMany: () => getRaw().agents,
    create: (data: Omit<Agent, 'id' | 'customersAcquired' | 'performanceScore'>) => {
      const state = getRaw();
      const newItem: Agent = { ...data, id: generateId(), customersAcquired: 0, performanceScore: 0 };
      state.agents.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.agents = state.agents.filter(a => a.id !== id);
      saveRaw(state);
    }
  },
  order: {
    findMany: () => getRaw().orders,
    create: (data: Omit<Order, 'id' | 'status'>) => {
      const state = getRaw();
      const newOrder: Order = { ...data, id: generateId(), status: 'PENDING' };
      let allFound = true;
      newOrder.items.forEach(item => {
        const inv = state.inventory.find(invItem => 
          invItem.productType === item.productType && 
          (item.productType === 'PACKING_BAG' ? invItem.partnerId === null : invItem.partnerId === newOrder.partnerId)
        );
        if (inv) {
          inv.quantity -= item.quantity;
          if (item.totalKg && inv.totalKg !== undefined) inv.totalKg -= item.totalKg;
        } else {
          allFound = false;
        }
      });
      if (allFound) newOrder.status = 'FULFILLED';
      state.orders.push(newOrder);
      saveRaw(state);
      return newOrder;
    }
  },
  inventory: {
    findMany: () => getRaw().inventory,
    create: (data: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
      const state = getRaw();
      const newItem: InventoryItem = { ...data, id: generateId(), lastRestocked: new Date().toISOString() };
      state.inventory.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.inventory = state.inventory.filter(i => i.id !== id);
      saveRaw(state);
    }
  },
  callReport: {
    findMany: () => getRaw().calls,
    create: (data: any) => {
      const state = getRaw();
      const newItem = { ...data, id: generateId() };
      state.calls.push(newItem);
      saveRaw(state);
      return newItem;
    }
  },
  logistics: {
    findMany: () => getRaw().logistics,
    create: (data: Omit<LogisticsReport, 'id'>) => {
      const state = getRaw();
      const newItem = { ...data, id: generateId() };
      state.logistics.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.logistics = state.logistics.filter(l => l.id !== id);
      saveRaw(state);
    }
  },
  commission: {
    findMany: () => getRaw().commissions,
    processBatchCommissions: () => {
      const state = getRaw();
      state.commissions = state.commissions.map(c => ({ ...c, status: 'Paid' as 'Paid' }));
      saveRaw(state);
    },
    create: (data: Omit<Commission, 'id'>) => {
      const state = getRaw();
      const newItem = { ...data, id: generateId() };
      state.commissions.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.commissions = state.commissions.filter(c => c.id !== id);
      saveRaw(state);
    }
  },
  seed: () => {
    const state = getRaw();
    if (state.roles.length === 0) {
      saveRaw({
        users: [],
        roles: [],
        partners: [],
        agents: [],
        inventory: [],
        calls: [],
        orders: [],
        logistics: [],
        commissions: []
      }, true);
    }
  }
};
