
import { Partner, Agent, CallReport, Order, Sale, InventoryItem, InventoryLog, User, Role, SystemConfig, PartnerType, VisitOutcome, LogisticsReport, WorkOrder } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateInternalOrderId = () => `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
const generateWorkOrderId = () => `WO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

const DB_KEY = 'swift_industrial_db';

interface DBState {
  partners: Partner[];
  agents: Agent[];
  calls: CallReport[];
  orders: Order[];
  workOrders: WorkOrder[];
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
    workOrders: [],
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
  workOrder: {
    findMany: () => getRaw().workOrders,
    issue: (orderId: string, priority: 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL') => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");
      
      const newWO: WorkOrder = {
        id: generateId(),
        orderId: order.id,
        internalId: generateWorkOrderId(),
        status: 'PENDING',
        priority,
        notes: `Production ticket for Order ${order.internalId}`
      };
      
      order.status = 'AWAITING_PROD';
      state.workOrders.push(newWO);
      saveRaw(state);
      return newWO;
    },
    updateStatus: (id: string, status: 'IN_PROD' | 'COMPLETED') => {
      const state = getRaw();
      const wo = state.workOrders.find(w => w.id === id);
      if (!wo) throw new Error("Work order not found");
      
      const order = state.orders.find(o => o.id === wo.orderId);
      wo.status = status;
      
      if (status === 'IN_PROD') {
        wo.startDate = new Date().toISOString();
        if (order) order.status = 'IN_PROD';
      } else if (status === 'COMPLETED') {
        wo.completionDate = new Date().toISOString();
        if (order) {
          order.status = 'READY_FOR_DISPATCH';
          // AUTO-REPLENISH INVENTORY
          order.items.forEach(item => {
            const partnerId = order.partnerId || null;
            prisma.inventory.create({
              partnerId,
              productName: item.productName,
              productType: item.productType,
              quantity: item.quantity,
              totalKg: item.totalKg,
              unit: item.productType === 'ROLLER' ? 'rolls' : 'bags'
            });
          });
        }
      }
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
    },
    updatePendingDispatch: (id: string, data: any) => {
      const state = getRaw();
      const order = state.orders.find(o => o.id === id);
      if (order) {
        order.pendingDispatch = {
          ...(order.pendingDispatch || { 
            systemOwnerApproved: false, 
            accountOfficerApproved: false, 
            inventoryItemId: '', 
            totalKg: 0, 
            volume: 0, 
            notes: '' 
          }),
          ...data
        };
        saveRaw(state);
      }
    }
  },
  sale: {
    findMany: () => getRaw().sales,
    create: (data: any) => {
      const state = getRaw();
      const targetOrder = state.orders.find(o => o.id === data.orderId);
      
      // HARD CHECK: Cannot log sale unless production is completed
      if (targetOrder && targetOrder.status !== 'READY_FOR_DISPATCH' && targetOrder.status !== 'PARTIALLY_FULFILLED' && targetOrder.status !== 'FULFILLED') {
        throw new Error("PROHIBITED: Cannot dispatch. Production is not complete for this order.");
      }

      const newSale = { ...data, id: generateId(), date: new Date().toISOString() };
      const invItem = state.inventory.find(i => i.id === data.inventoryItemId);
      
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
        if (targetOrder) {
          const currentSaleValue = invItem.productType === 'ROLLER' 
            ? (dispatchWeight * data.unitPrice) 
            : (dispatchUnits * data.unitPrice);
            
          const totalSalesForThisOrder = state.sales
            .filter(s => s.orderId === targetOrder.id)
            .reduce((acc, s) => {
                const sInv = state.inventory.find(inv => inv.id === s.inventoryItemId);
                return acc + (sInv?.productType === 'ROLLER' ? (s.totalKg * s.unitPrice) : (s.volume * s.unitPrice));
            }, 0) + currentSaleValue;

          if (totalSalesForThisOrder >= targetOrder.totalValue * 0.95) {
            targetOrder.status = 'FULFILLED';
          } else {
            targetOrder.status = 'PARTIALLY_FULFILLED';
          }
          // CLEAR PENDING DISPATCH DATA ONCE COMMITTED
          delete targetOrder.pendingDispatch;
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
