
import { Partner, Agent, CallReport, Order, Sale, InventoryItem, InventoryLog, User, Role, SystemConfig, PartnerType, VisitOutcome, LogisticsReport } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateInternalOrderId = () => `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

const DB_KEY = 'swift_industrial_db';

interface DBState {
  partners: Partner[];
  agents: Agent[];
  calls: CallReport[];
  orders: Order[];
  sales: Sale[];
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  users: User[];
  roles: Role[];
  config: SystemConfig;
  logistics: LogisticsReport[];
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
  const initialState: DBState = {
    partners: [],
    agents: [],
    calls: [],
    orders: [],
    sales: [],
    inventory: [],
    inventoryLogs: [],
    users: [],
    roles: [],
    logistics: [],
    config: {
      recommendedCommissionRate: 10,
      targetEfficiencyMetric: 'Delivery Speed',
      customerSegmentationAdvice: ['High Volume', 'Retail'],
      logisticsThreshold: 50,
      lastUpdated: new Date().toISOString()
    }
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(initialState));
  }
  return initialState;
};

const getMode = () => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') ? 'PRODUCTION' : 'SIMULATION';
  } catch (e) {
    return 'SIMULATION';
  }
};

export const prisma = {
  seed,
  dbInfo: {
    getMode: getMode
  },
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
      const newAgent = { 
        ...data, 
        id: generateId(), 
        performanceScore: 0, 
        customersAcquired: 0, 
        dataAccuracyScore: 100, 
        timelinessScore: 100,
        baseSalary: Number(data.baseSalary || 0),
        commissionRate: Number(data.commissionRate || 10),
        weeklyTarget: Number(data.weeklyTarget || 0),
        monthlyTarget: Number(data.monthlyTarget || 0)
      };
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
  inventory: {
    findMany: () => getRaw().inventory,
    findLogs: (itemId: string) => getRaw().inventoryLogs.filter(l => l.inventoryItemId === itemId),
    create: (data: any) => {
      const state = getRaw();
      
      const existingItem = state.inventory.find(i => 
        i.partnerId === data.partnerId && 
        i.productName === data.productName && 
        i.productType === data.productType
      );

      if (existingItem) {
        const addedQty = Number(data.quantity);
        const addedKg = Number(data.totalKg || 0);
        
        existingItem.quantity += addedQty;
        if (data.totalKg) {
          existingItem.totalKg = (existingItem.totalKg || 0) + addedKg;
        }
        existingItem.lastRestocked = new Date().toISOString();

        state.inventoryLogs.push({
          id: generateId(),
          inventoryItemId: existingItem.id,
          type: 'RESTOCK',
          change: addedQty,
          finalQuantity: existingItem.quantity,
          timestamp: new Date().toISOString(),
          userName: 'Production System',
          notes: `Batch addition to existing stock. Added ${addedQty} ${existingItem.unit}${addedKg > 0 ? ` (${addedKg}kg)` : ''}.`
        });

        saveRaw(state);
        return existingItem;
      } else {
        const newItem = { 
          ...data, 
          id: generateId(), 
          lastRestocked: new Date().toISOString() 
        };
        state.inventory.push(newItem);
        
        state.inventoryLogs.push({
          id: generateId(),
          inventoryItemId: newItem.id,
          type: 'INITIAL_STOCK',
          change: Number(data.quantity),
          finalQuantity: Number(data.quantity),
          timestamp: new Date().toISOString(),
          userName: 'Production System',
          notes: `Initial asset initialization for ${data.productName}.`
        });

        saveRaw(state);
        return newItem;
      }
    },
    adjust: (id: string, change: number, type: string, notes: string) => {
      const state = getRaw();
      const item = state.inventory.find(i => i.id === id);
      if (!item) throw new Error("Asset not found in inventory.");
      item.quantity += change;
      state.inventoryLogs.push({
        id: generateId(),
        inventoryItemId: id,
        type: type as any,
        change,
        finalQuantity: item.quantity,
        timestamp: new Date().toISOString(),
        userName: 'Admin/Manager',
        notes
      });
      saveRaw(state);
    },
    delete: (id: string) => {
      const state = getRaw();
      state.inventory = state.inventory.filter(i => i.id !== id);
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
        status: 'PENDING' 
      };
      state.orders.push(newOrder);
      saveRaw(state);
      return newOrder;
    }
  },
  sale: {
    findMany: () => getRaw().sales,
    create: (data: any) => {
      const state = getRaw();
      const newSale = { ...data, id: generateId(), date: new Date().toISOString() };
      const invItem = state.inventory.find(i => i.id === data.inventoryItemId);
      const parentOrder = state.orders.find(o => o.id === data.orderId);
      
      const dispatchWeight = Number(data.totalKg || 0);
      const dispatchUnits = Number(data.volume || 0);

      if (invItem && invItem.quantity >= dispatchUnits) {
        invItem.quantity -= dispatchUnits;
        if (invItem.totalKg) {
          invItem.totalKg = Math.max(0, invItem.totalKg - dispatchWeight);
        }

        state.inventoryLogs.push({
          id: generateId(),
          inventoryItemId: invItem.id,
          type: 'SALE',
          change: -dispatchUnits,
          finalQuantity: invItem.quantity,
          timestamp: new Date().toISOString(),
          userName: 'Sales Terminal',
          notes: `Dispatch of ${dispatchUnits} units / ${dispatchWeight}kg.`
        });

        // UPDATE ORDER STATUS
        if (parentOrder) {
          const currentSaleValue = invItem.productType === 'ROLLER' 
            ? (dispatchWeight * data.unitPrice) 
            : (dispatchUnits * data.unitPrice);
            
          // If this sale covers or exceeds 90% of order value, mark fulfilled. Else partially.
          const totalSalesForThisOrder = state.sales
            .filter(s => s.orderId === parentOrder.id)
            .reduce((acc, s) => {
                const sInv = state.inventory.find(inv => inv.id === s.inventoryItemId);
                return acc + (sInv?.productType === 'ROLLER' ? (s.totalKg * s.unitPrice) : (s.volume * s.unitPrice));
            }, 0) + currentSaleValue;

          if (totalSalesForThisOrder >= parentOrder.totalValue * 0.95) {
            parentOrder.status = 'FULFILLED';
          } else {
            parentOrder.status = 'PARTIALLY_FULFILLED';
          }
        }
      } else {
        throw new Error("Insufficient stock volume for this dispatch.");
      }
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
    findUnique: ({ where }: { where: { username: string } }) => getRaw().users.find(u => u.username === where.username),
    create: (data: any) => {
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
  commission: {
    findMany: () => [],
    processBatchCommissions: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('prisma-mutation'));
      }
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
    },
    delete: (id: string) => {
      const state = getRaw();
      state.logistics = state.logistics.filter(l => l.id !== id);
      saveRaw(state);
    }
  }
};
