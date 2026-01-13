import { Customer, Agent, LogisticsReport, Commission, InventoryItem, CustomerType, VisitOutcome, CallReport, User, UserRole } from '../types';

/**
 * NEXT.JS SERVER SIMULATION LAYER
 * This service mimics a backend Prisma client interacting with a relational store.
 */

const DB_KEY = 'swift_plastics_db_v3';

interface DBState {
  users: User[];
  wholesalers: Customer[];
  agents: Agent[];
  logistics: LogisticsReport[];
  commissions: Commission[];
  inventory: InventoryItem[];
  calls: CallReport[];
}

const getRaw = (): DBState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return { users: [], wholesalers: [], agents: [], logistics: [], commissions: [], inventory: [], calls: [] };
  return JSON.parse(data);
};

const saveRaw = (data: DBState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('prisma-mutation'));
};

const logQuery = (model: string, method: string, args: any) => {
  const log = `[PRISMA] ${new Date().toLocaleTimeString()} query ${model}.${method}(${JSON.stringify(args)})`;
  console.debug(log);
  window.dispatchEvent(new CustomEvent('prisma-log', { detail: log }));
};

export const prisma = {
  user: {
    findMany: () => {
      logQuery('user', 'findMany', {});
      return getRaw().users;
    },
    findUnique: (args: { where: { username: string } }) => {
      logQuery('user', 'findUnique', args);
      let state = getRaw();
      // Auto-seed if empty
      if (state.users.length === 0) {
        prisma.seed();
        state = getRaw();
      }
      return state.users.find(u => u.username === args.where.username);
    },
    create: (data: Omit<User, 'id'>) => {
      logQuery('user', 'create', data);
      const state = getRaw();
      const newUser = { ...data, id: crypto.randomUUID() };
      state.users.push(newUser);
      saveRaw(state);
      return newUser;
    },
    delete: (id: string) => {
      logQuery('user', 'delete', id);
      const state = getRaw();
      state.users = state.users.filter(u => u.id !== id);
      saveRaw(state);
    }
  },
  wholesaler: {
    findMany: (args?: { where?: any, include?: any }) => {
      logQuery('wholesaler', 'findMany', args);
      return getRaw().wholesalers;
    },
    create: (data: Omit<Customer, 'id'>) => {
      logQuery('wholesaler', 'create', data);
      const state = getRaw();
      const newItem = { ...data, id: crypto.randomUUID() };
      state.wholesalers.push(newItem);
      saveRaw(state);
      return newItem;
    },
    delete: (id: string) => {
      logQuery('wholesaler', 'delete', id);
      const state = getRaw();
      state.wholesalers = state.wholesalers.filter(w => w.id !== id);
      saveRaw(state);
    },
    update: (id: string, data: Partial<Customer>) => {
      logQuery('wholesaler', 'update', { id, data });
      const state = getRaw();
      state.wholesalers = state.wholesalers.map(w => w.id === id ? { ...w, ...data } : w);
      saveRaw(state);
    }
  },
  salesAgent: {
    findMany: () => {
      logQuery('salesAgent', 'findMany', {});
      return getRaw().agents;
    },
    create: (data: any) => {
      logQuery('salesAgent', 'create', data);
      const state = getRaw();
      const newItem = { ...data, id: crypto.randomUUID(), customersAcquired: 0 };
      state.agents.push(newItem);
      saveRaw(state);
      return newItem;
    }
  },
  inventory: {
    findMany: () => {
      logQuery('inventory', 'findMany', {});
      return getRaw().inventory;
    },
    delete: (id: string) => {
      logQuery('inventory', 'delete', id);
      const state = getRaw();
      state.inventory = state.inventory.filter(i => i.id !== id);
      saveRaw(state);
    },
    increment: (id: string, amount: number) => {
      logQuery('inventory', 'update/increment', { id, amount });
      const state = getRaw();
      state.inventory = state.inventory.map(i => {
        if (i.id === id) {
          const newQty = i.quantity + amount;
          return { 
            ...i, 
            quantity: newQty, 
            status: newQty > 30 ? 'In Stock' : (newQty > 0 ? 'Low Stock' : 'Out of Stock'),
            lastRestocked: new Date().toISOString()
          };
        }
        return i;
      });
      saveRaw(state);
    },
    update: (id: string, data: { quantity: number }) => {
      logQuery('inventory', 'update', { id, data });
      const state = getRaw();
      state.inventory = state.inventory.map(i => {
        if (i.id === id) {
          return { 
            ...i, 
            quantity: data.quantity,
            status: data.quantity > 30 ? 'In Stock' : (data.quantity > 0 ? 'Low Stock' : 'Out of Stock')
          };
        }
        return i;
      });
      saveRaw(state);
    }
  },
  callReport: {
    findMany: () => {
      logQuery('callReport', 'findMany', {});
      return getRaw().calls;
    },
    create: (data: any) => {
      logQuery('callReport', 'create', data);
      const state = getRaw();
      const newItem = { ...data, id: crypto.randomUUID() };
      state.calls.push(newItem);
      saveRaw(state);
      return newItem;
    }
  },
  logistics: {
    findMany: () => {
      logQuery('logistics', 'findMany', {});
      return getRaw().logistics;
    }
  },
  commission: {
    findMany: () => {
      logQuery('commission', 'findMany', {});
      return getRaw().commissions;
    },
    updateMany: (args: { where: { status: string }, data: { status: string } }) => {
      logQuery('commission', 'updateMany', args);
      const state = getRaw();
      state.commissions = state.commissions.map(c => 
        c.status === args.where.status ? { ...c, status: args.data.status as any } : c
      );
      saveRaw(state);
    }
  },
  seed: () => {
    const state = getRaw();
    if (state.users.length === 0) {
      saveRaw({
        users: [
          { id: 'u1', username: 'admin', name: 'Swift Admin', role: UserRole.ADMIN },
          { id: 'u2', username: 'agent1', name: 'Sarah Miller', role: UserRole.AGENT },
          { id: 'u3', username: 'factory', name: 'Production Head', role: UserRole.PRODUCTION }
        ],
        agents: [
          { id: 'a1', name: 'Sarah Miller', role: 'Regional Sales Head', performanceScore: 92, customersAcquired: 145 },
          { id: 'a2', name: 'James Wilson', role: 'Industrial Account Rep', performanceScore: 78, customersAcquired: 32 }
        ],
        wholesalers: [
          { id: '1', name: 'Metro Retail Wholesalers', type: CustomerType.EXISTING, email: 'procurement@metroretail.com', location: 'Industrial Zone A', assignedAgentId: 'a1', productsPitched: [], status: 'Active Account' }
        ],
        inventory: [
          { id: 'inv1', customerId: '1', productName: 'HDPE Heavy Duty Rollers', quantity: 120, unit: 'rolls', status: 'In Stock', lastRestocked: '2023-10-20' },
          { id: 'inv2', customerId: '1', productName: 'Medium Packing Bags', quantity: 45, unit: 'Bags', status: 'In Stock', lastRestocked: '2023-10-22' }
        ],
        commissions: [],
        logistics: [],
        calls: []
      });
    }
  }
};
