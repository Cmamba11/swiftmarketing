
import { Partner, Agent, InventoryItem, PartnerType, VisitOutcome, CallReport, User, Role, SystemConfig, LogisticsReport, Commission, Order, OrderItem, Sale, InventoryLog } from '../types';
import { externalDb } from './database';

/**
 * SWIFT PLASTICS - CORE DATA ENGINE (Simulated Prisma)
 * Version 18: PDF Design Specification Adherence
 */

const DB_KEY = 'swift_plastics_db_v18';
const CONFIG_KEY = 'swift_plastics_config_v2';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

const generateInternalOrderId = () => {
  return `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
};

interface DBState {
  users: User[];
  roles: Role[];
  partners: Partner[];
  agents: Agent[];
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  calls: CallReport[];
  orders: Order[];
  sales: Sale[];
  logistics: LogisticsReport[];
  commissions: Commission[];
}

const getRaw = (): DBState => {
  const data = localStorage.getItem(DB_KEY);
  const fallback: DBState = { 
    users: [], roles: [], partners: [], agents: [], inventory: [], 
    inventoryLogs: [], calls: [], orders: [], sales: [], logistics: [], commissions: [] 
  };
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

const getCurrentUserName = () => {
  try {
    const session = localStorage.getItem('swift_session');
    if (session) {
      const user = JSON.parse(session);
      return user.name;
    }
  } catch (e) {}
  return "System";
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
    create: (data: Omit<Partner, 'id'>) => {
      const state = getRaw();
      const newItem: Partner = { ...data, id: generateId() };
      state.partners.push(newItem);
      
      const agent = state.agents.find(a => a.id === data.assignedAgentId);
      if (agent) {
        agent.customersAcquired += 1;
      }

      saveRaw(state);
      return newItem;
    },
    update: (id: string, data: Partial<Partner>) => {
      const state = getRaw();
      state.partners = state.partners.map(p => p.id === id ? { ...p, ...data } : p);
      saveRaw(state);
    },
    delete: (id: string) => {
      const state = getRaw();
      state.partners = state.partners.filter(p => p.id !== id);
      saveRaw(state);
    }
  },
  salesAgent: {
    findMany: () => getRaw().agents,
    create: (data: Omit<Agent, 'id' | 'customersAcquired' | 'performanceScore' | 'dataAccuracyScore' | 'timelinessScore'>) => {
      const state = getRaw();
      const newItem: Agent = { 
        ...data, 
        id: generateId(), 
        customersAcquired: 0, 
        performanceScore: 0,
        dataAccuracyScore: 95,
        timelinessScore: 90
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
  order: {
    findMany: () => getRaw().orders,
    create: (data: Omit<Order, 'id' | 'status' | 'internalId'>) => {
      const state = getRaw();
      const newOrder: Order = { 
        ...data, 
        id: generateId(), 
        internalId: generateInternalOrderId(),
        status: 'PENDING' 
      };
      state.orders.push(newOrder);
      saveRaw(state);
      return newOrder;
    },
    update: (id: string, data: Partial<Order>) => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === id);
      if (order?.status === 'FULFILLED') {
        throw new Error("Business Rule: Fulfilled orders are locked and cannot be modified.");
      }
      state.orders = state.orders.map(o => o.id === id ? { ...o, ...data } : o);
      saveRaw(state);
    }
  },
  sale: {
    findMany: () => getRaw().sales,
    create: (data: Omit<Sale, 'id' | 'date' | 'unitPrice'> & { unitPrice?: number }) => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === data.orderId);
      const inventory = state.inventory.find(i => i.id === data.inventoryItemId);

      // Business Rule: Sales require Order ID
      if (!order) throw new Error("Sales require Order ID.");
      
      // Business Rule: Fulfilled orders are locked
      if (order.status === 'FULFILLED') {
        throw new Error("Business Rule: This order is FULFILLED and locked. Sales cannot occur without referencing an open order.");
      }
      
      // Business Rule: Sales must be linked to a Partner Inventory source
      if (!inventory) throw new Error("Sales must be linked to a Partner Inventory source.");
      
      // Business Rule: Inventory cannot go negative
      if (inventory.quantity < data.quantity) {
        throw new Error(`Inventory cannot go negative. Requested: ${data.quantity}, Available: ${inventory.quantity}`);
      }

      const orderItem = order.items.find(i => i.productType === inventory.productType);
      if (!orderItem) throw new Error("Product type mismatch: Sale does not match any item in the referenced Order.");
      
      // Business Rule: Overselling is blocked
      const remainingNeeded = orderItem.quantity - orderItem.fulfilledQuantity;
      if (data.quantity > remainingNeeded) {
        throw new Error(`Overselling Blocked: This sale exceeds the required order quantity. Only ${remainingNeeded} units remaining for fulfillment.`);
      }

      // 1. Partner Inventory Reduction
      inventory.quantity -= data.quantity;

      // Log the inventory reduction for traceability
      state.inventoryLogs.push({
        id: generateId(),
        inventoryItemId: inventory.id,
        type: 'SALE',
        change: -data.quantity,
        finalQuantity: inventory.quantity,
        timestamp: new Date().toISOString(),
        userName: getCurrentUserName(),
        notes: `Automated reduction for Order ${order.internalId}`
      });

      // 2. Update Order Fulfillment
      orderItem.fulfilledQuantity += data.quantity;

      // 3. Order Completion Logic (System-Driven)
      const allFulfilled = order.items.every(i => i.fulfilledQuantity >= i.quantity);
      if (allFulfilled) {
        order.status = 'FULFILLED';
        
        // Callback & Automation Trigger
        console.log(`[AUTOMATION] Order ${order.internalId} Fulfilled. Triggering callbacks...`);
        
        // Trigger Commission Calculation
        const agent = state.agents.find(a => a.id === data.agentId);
        if (agent) {
           const commAmount = order.totalValue * (prisma.config.get().recommendedCommissionRate / 100);
           state.commissions.push({
             id: generateId(),
             agentId: agent.id,
             amount: commAmount,
             status: 'Pending',
             date: new Date().toISOString(),
             breakdown: [
               { label: `Fulfillment Automation: ${order.internalId}`, amount: commAmount }
             ]
           });
        }
      }

      // 4. Traceability Record
      const newSale: Sale = { 
        ...data, 
        id: generateId(), 
        date: new Date().toISOString(), 
        unitPrice: data.unitPrice || 15.50 
      };
      state.sales.push(newSale);
      
      // Update Performance KPI
      const agent = state.agents.find(a => a.id === data.agentId);
      if (agent) {
        agent.performanceScore = Math.min(100, Math.floor((agent.performanceScore + (data.quantity / 20))));
        agent.dataAccuracyScore = Math.min(100, agent.dataAccuracyScore + 0.5);
      }

      saveRaw(state);
      return newSale;
    }
  },
  inventory: {
    findMany: () => getRaw().inventory,
    findLogs: (itemId: string) => {
      return getRaw().inventoryLogs
        .filter(l => l.inventoryItemId === itemId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    create: (data: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
      const state = getRaw();
      const newItem: InventoryItem = { ...data, id: generateId(), lastRestocked: new Date().toISOString() };
      state.inventory.push(newItem);

      // Initial Stock Log
      state.inventoryLogs.push({
        id: generateId(),
        inventoryItemId: newItem.id,
        type: 'INITIAL_STOCK',
        change: newItem.quantity,
        finalQuantity: newItem.quantity,
        timestamp: new Date().toISOString(),
        userName: getCurrentUserName(),
        notes: 'Initial production run'
      });

      saveRaw(state);
      return newItem;
    },
    adjust: (id: string, change: number, type: 'RESTOCK' | 'ADJUSTMENT' | 'REDUCTION', notes?: string) => {
      const state = getRaw();
      const item = state.inventory.find(i => i.id === id);
      if (!item) throw new Error("Item not found");

      if (item.quantity + change < 0) throw new Error("Inventory cannot go negative");

      item.quantity += change;
      item.lastRestocked = new Date().toISOString();

      state.inventoryLogs.push({
        id: generateId(),
        inventoryItemId: item.id,
        type,
        change,
        finalQuantity: item.quantity,
        timestamp: new Date().toISOString(),
        userName: getCurrentUserName(),
        notes
      });

      saveRaw(state);
      return item;
    },
    delete: (id: string) => {
      const state = getRaw();
      state.inventory = state.inventory.filter(i => i.id !== id);
      state.inventoryLogs = state.inventoryLogs.filter(l => l.inventoryItemId !== id);
      saveRaw(state);
    }
  },
  callReport: {
    findMany: () => getRaw().calls,
    create: (data: Omit<CallReport, 'id'>) => {
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
        partners: [],
        agents: [],
        inventory: [],
        inventoryLogs: [],
        calls: [],
        orders: [],
        sales: [],
        logistics: [],
        commissions: []
      }, true);
    }
  }
};
