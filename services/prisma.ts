
import { Customer, Agent, InventoryItem, CustomerType, VisitOutcome, CallReport, User, Role, SystemConfig, LogisticsReport, Commission } from '../types';

/**
 * SWIFT PLASTICS - CORE DATA ENGINE (Simulated Prisma)
 * Version 6: Removed Safety Clearance Concepts
 */

const DB_KEY = 'swift_plastics_db_v6';
const CONFIG_KEY = 'swift_plastics_config_v2';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface DBState {
  users: User[];
  roles: Role[];
  wholesalers: Customer[];
  agents: Agent[];
  inventory: InventoryItem[];
  calls: CallReport[];
  logistics: LogisticsReport[];
  commissions: Commission[];
}

const getRaw = (): DBState => {
  const data = localStorage.getItem(DB_KEY);
  const fallback: DBState = { users: [], roles: [], wholesalers: [], agents: [], inventory: [], calls: [], logistics: [], commissions: [] };
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

const saveRaw = (data: DBState, silent: boolean = false) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  if (!silent) {
    window.dispatchEvent(new CustomEvent('prisma-mutation', { detail: { timestamp: Date.now() } }));
    window.dispatchEvent(new Event('prisma-mutation'));
  }
};

export const prisma = {
  config: {
    get: (): SystemConfig => {
      const data = localStorage.getItem(CONFIG_KEY);
      if (!data) return {
        recommendedCommissionRate: 10,
        targetEfficiencyMetric: 'Lead Generation',
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
      if (state.users.some(u => u.roleId === id)) {
        throw new Error("Cannot delete role assigned to active users.");
      }
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
  wholesaler: {
    findMany: () => getRaw().wholesalers,
    create: (data: Omit<Customer, 'id' | 'assignedAgentId' | 'productsPitched'>) => {
      const state = getRaw();
      const newItem: Customer = { 
        ...data, 
        id: generateId(), 
        assignedAgentId: '', 
        productsPitched: [] 
      };
      state.wholesalers.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.wholesalers = state.wholesalers.filter(w => w.id !== id);
      saveRaw(state);
    },
    update: (id: string, data: Partial<Customer>) => {
      const state = getRaw();
      state.wholesalers = state.wholesalers.map(w => w.id === id ? { ...w, ...data } : w);
      saveRaw(state);
    }
  },
  salesAgent: {
    findMany: () => getRaw().agents,
    create: (data: Omit<Agent, 'id' | 'customersAcquired' | 'performanceScore'>) => {
      const state = getRaw();
      const newItem: Agent = { 
        ...data, 
        id: generateId(), 
        customersAcquired: 0, 
        performanceScore: 0 
      };
      state.agents.push(newItem);
      saveRaw(state);
      return newItem;
    },
    update: (id: string, data: Partial<Agent>) => {
      const state = getRaw();
      state.agents = state.agents.map(a => a.id === id ? { ...a, ...data } : a);
      saveRaw(state);
    },
    delete: (id: string) => {
      const state = getRaw();
      state.agents = state.agents.filter(a => a.id !== id);
      saveRaw(state);
    }
  },
  inventory: {
    findMany: () => getRaw().inventory,
    create: (data: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
      const state = getRaw();
      const newItem: InventoryItem = { 
        ...data, 
        id: generateId(), 
        lastRestocked: new Date().toISOString()
      };
      state.inventory.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.inventory = state.inventory.filter(i => i.id !== id);
      saveRaw(state);
    },
    increment: (id: string, amount: number) => {
      const state = getRaw();
      state.inventory = state.inventory.map(i => {
        if (i.id === id) {
          return { 
            ...i, 
            quantity: i.quantity + amount, 
            lastRestocked: new Date().toISOString()
          };
        }
        return i;
      });
      saveRaw(state);
    },
    update: (id: string, data: Partial<InventoryItem>) => {
      const state = getRaw();
      state.inventory = state.inventory.map(i => i.id === id ? { ...i, ...data } : i);
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
    },
    delete: (id: string) => {
      const state = getRaw();
      state.calls = state.calls.filter(c => c.id !== id);
      saveRaw(state);
    }
  },
  logistics: {
    findMany: () => getRaw().logistics,
    create: (data: any) => {
      const state = getRaw();
      const newItem = { ...data, id: generateId(), date: new Date().toISOString() };
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
      state.commissions = state.commissions.map(c => ({ ...c, status: 'Paid' as const }));
      saveRaw(state);
    }
  },
  seed: () => {
    const state = getRaw();
    if (state.roles.length === 0) {
      saveRaw({
        users: [],
        roles: [],
        wholesalers: [],
        agents: [],
        inventory: [],
        calls: [],
        logistics: [],
        commissions: []
      }, true);
    }
  }
};
