
import { Customer, Agent, LogisticsReport, Commission, InventoryItem, CustomerType, SystemConfig, CallReport, VisitOutcome } from '../types';

const DB_KEY = 'polyflow_db';

interface DBStructure {
  customers: Customer[];
  agents: Agent[];
  logistics: LogisticsReport[];
  commissions: Commission[];
  inventory: InventoryItem[];
  callReports: CallReport[];
  config: SystemConfig;
}

const INITIAL_DATA: DBStructure = {
  customers: [
    { id: '1', name: 'Metro Retail Wholesalers', type: CustomerType.EXISTING, email: 'procurement@metroretail.com', location: 'Industrial Zone A', assignedAgentId: 'a1', productsPitched: ['HDPE Rollers', 'Printed Shopping Bags'], status: 'Active Account' },
    { id: '2', name: 'FreshGrocer Mart', type: CustomerType.NEW, email: 'ops@freshgrocer.com', location: 'Central District', assignedAgentId: 'a2', productsPitched: ['Biodegradable Bags'], status: 'Trial Phase' },
  ],
  agents: [
    { id: 'a1', name: 'Sarah Miller', role: 'Regional Sales Head', performanceScore: 92, customersAcquired: 145 },
    { id: 'a2', name: 'James Wilson', role: 'Industrial Account Rep', performanceScore: 78, customersAcquired: 32 },
  ],
  logistics: [
    { id: 'l1', agentId: 'a1', vehicleId: 'TRUCK-HD-01', fuelUsage: 45.5, distanceCovered: 120, date: '2023-10-24' },
  ],
  callReports: [
    { id: 'cr1', customerId: '1', agentId: 'a1', date: '2023-10-25', duration: 12, outcome: VisitOutcome.ORDER_PLACED, notes: 'Follow up on HDPE Roller shipment. Client increased order by 50 units.' },
    { id: 'cr2', customerId: '2', agentId: 'a2', date: '2023-10-26', duration: 8, outcome: VisitOutcome.INTERESTED, notes: 'Discussed biodegradable options. Scheduled warehouse visit for next Tuesday.' },
  ],
  commissions: [
    { 
      id: 'c1', 
      agentId: 'a1', 
      amount: 1250.00, 
      status: 'Paid', 
      date: '2023-10-15',
      breakdown: [
        { label: 'Bulk Roller Order (Metro)', amount: 1000.00 },
        { label: 'Packing Bales Retention Bonus', amount: 250.00 }
      ]
    }
  ],
  inventory: [
    { id: 'inv1', customerId: '1', productName: 'HDPE Heavy Duty Rollers (50kg)', quantity: 120, unit: 'rolls', status: 'In Stock', lastRestocked: '2023-10-20' },
    { id: 'inv2', customerId: '1', productName: 'Medium Packing Bags (1000pc Bales)', quantity: 45, unit: 'bales', status: 'In Stock', lastRestocked: '2023-10-22' },
    { id: 'inv3', customerId: '2', productName: 'Biodegradable Carrier Bags', quantity: 15, unit: 'bales', status: 'Low Stock', lastRestocked: '2023-10-15' },
  ],
  config: {
    recommendedCommissionRate: 12.5,
    targetEfficiencyMetric: 'Delivery Fulfillment Speed',
    customerSegmentationAdvice: ['Focus on Industrial Tier 1 Wholesalers', 'Incentivize bulk biodegradable bag orders'],
    logisticsThreshold: 50,
    lastUpdated: '2023-10-01'
  }
};

const _refreshInventoryStatus = (item: InventoryItem) => {
  if (item.quantity === 0) item.status = 'Out of Stock';
  else if (item.quantity <= 30) item.status = 'Low Stock';
  else item.status = 'In Stock';
};

const internalDb = {
  get(): DBStructure {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      // Fix: Explicitly reference internalDb instead of 'this' to avoid binding issues
      internalDb.save(INITIAL_DATA);
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  },
  save(data: DBStructure) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('db-update'));
  }
};

/**
 * MOCK PRISMA CLIENT
 * A frontend-safe ORM simulation for Swift Plastics OS
 */
export const prisma = {
  customer: {
    findMany: () => internalDb.get().customers,
    findUnique: (id: string) => internalDb.get().customers.find(c => c.id === id),
    create: (data: Omit<Customer, 'id'>) => {
      const state = internalDb.get();
      const newItem = { ...data, id: crypto.randomUUID() };
      state.customers.push(newItem);
      internalDb.save(state);
      return newItem;
    },
    update: (id: string, data: Partial<Customer>) => {
      const state = internalDb.get();
      state.customers = state.customers.map(c => c.id === id ? { ...c, ...data } : c);
      internalDb.save(state);
    },
    delete: (id: string) => {
      const state = internalDb.get();
      state.customers = state.customers.filter(c => c.id !== id);
      state.inventory = state.inventory.filter(i => i.customerId !== id);
      internalDb.save(state);
    }
  },
  agent: {
    findMany: () => internalDb.get().agents,
    create: (data: Omit<Agent, 'id'>) => {
      const state = internalDb.get();
      const newItem = { ...data, id: crypto.randomUUID() };
      state.agents.push(newItem);
      internalDb.save(state);
      return newItem;
    },
    update: (id: string, data: Partial<Agent>) => {
      const state = internalDb.get();
      state.agents = state.agents.map(a => a.id === id ? { ...a, ...data } : a);
      internalDb.save(state);
    },
    delete: (id: string) => {
      const state = internalDb.get();
      state.agents = state.agents.filter(a => a.id !== id);
      internalDb.save(state);
    }
  },
  callReport: {
    findMany: () => internalDb.get().callReports,
    create: (data: Omit<CallReport, 'id'>) => {
      const state = internalDb.get();
      const newItem = { ...data, id: crypto.randomUUID() };
      state.callReports.push(newItem);
      internalDb.save(state);
      return newItem;
    },
    update: (id: string, data: Partial<CallReport>) => {
      const state = internalDb.get();
      state.callReports = state.callReports.map(c => c.id === id ? { ...c, ...data } : c);
      internalDb.save(state);
    },
    delete: (id: string) => {
      const state = internalDb.get();
      state.callReports = state.callReports.filter(c => c.id !== id);
      internalDb.save(state);
    }
  },
  logistics: {
    findMany: () => internalDb.get().logistics,
    create: (data: Omit<LogisticsReport, 'id'>) => {
      const state = internalDb.get();
      const newItem = { ...data, id: crypto.randomUUID() };
      state.logistics.push(newItem);
      internalDb.save(state);
      return newItem;
    },
    update: (id: string, data: Partial<LogisticsReport>) => {
      const state = internalDb.get();
      state.logistics = state.logistics.map(l => l.id === id ? { ...l, ...data } : l);
      internalDb.save(state);
    },
    delete: (id: string) => {
      const state = internalDb.get();
      state.logistics = state.logistics.filter(l => l.id !== id);
      internalDb.save(state);
    }
  },
  commission: {
    findMany: () => internalDb.get().commissions,
    create: (data: Omit<Commission, 'id'>) => {
      const state = internalDb.get();
      const newItem = { ...data, id: crypto.randomUUID() };
      state.commissions.push(newItem);
      internalDb.save(state);
      return newItem;
    },
    update: (id: string, data: Partial<Commission>) => {
      const state = internalDb.get();
      state.commissions = state.commissions.map(c => c.id === id ? { ...c, ...data } : c);
      internalDb.save(state);
    },
    delete: (id: string) => {
      const state = internalDb.get();
      state.commissions = state.commissions.filter(c => c.id !== id);
      internalDb.save(state);
    },
    processBatch: () => {
      const state = internalDb.get();
      state.commissions = state.commissions.map(c => ({ ...c, status: 'Paid' as const }));
      internalDb.save(state);
    }
  },
  inventory: {
    findMany: () => internalDb.get().inventory,
    create: (data: Omit<InventoryItem, 'id'>) => {
      const state = internalDb.get();
      const newItem = { ...data, id: crypto.randomUUID() };
      _refreshInventoryStatus(newItem);
      state.inventory.push(newItem);
      internalDb.save(state);
      return newItem;
    },
    update: (id: string, data: { quantity: number }) => {
      const state = internalDb.get();
      const item = state.inventory.find(i => i.id === id);
      if (item) {
        item.quantity = Math.max(0, data.quantity);
        _refreshInventoryStatus(item);
        item.lastRestocked = new Date().toISOString().split('T')[0];
        internalDb.save(state);
      }
    },
    increment: (id: string, amount: number) => {
      const state = internalDb.get();
      const item = state.inventory.find(i => i.id === id);
      if (item) {
        item.quantity += amount;
        _refreshInventoryStatus(item);
        item.lastRestocked = new Date().toISOString().split('T')[0];
        internalDb.save(state);
      }
    },
    delete: (id: string) => {
      const state = internalDb.get();
      state.inventory = state.inventory.filter(i => i.id !== id);
      internalDb.save(state);
    }
  }
};

// Backwards compatibility for the old 'db' export
export const db = {
  get: () => internalDb.get(),
  updateConfig: (updates: Partial<SystemConfig>) => {
    const state = internalDb.get();
    state.config = { ...state.config, ...updates, lastUpdated: new Date().toISOString() };
    internalDb.save(state);
  },
  // Map old method names to prisma client
  addCallReport: (data: Omit<CallReport, 'id'>) => prisma.callReport.create(data),
  updateCallReport: (id: string, data: Partial<CallReport>) => prisma.callReport.update(id, data),
  deleteCallReport: (id: string) => prisma.callReport.delete(id),
  addCustomer: (data: Omit<Customer, 'id'>) => prisma.customer.create(data),
  updateCustomer: (id: string, data: Partial<Customer>) => prisma.customer.update(id, data),
  deleteCustomer: (id: string) => prisma.customer.delete(id),
  addAgent: (data: Omit<Agent, 'id'>) => prisma.agent.create(data),
  updateAgent: (id: string, data: Partial<Agent>) => prisma.agent.update(id, data),
  deleteAgent: (id: string) => prisma.agent.delete(id),
  addLogisticsReport: (data: Omit<LogisticsReport, 'id'>) => prisma.logistics.create(data),
  updateLogistics: (id: string, data: Partial<LogisticsReport>) => prisma.logistics.update(id, data),
  deleteLogistics: (id: string) => prisma.logistics.delete(id),
  addCommission: (data: Omit<Commission, 'id'>) => prisma.commission.create(data),
  updateCommission: (id: string, data: Partial<Commission>) => prisma.commission.update(id, data),
  deleteCommission: (id: string) => prisma.commission.delete(id),
  processBatchCommissions: () => prisma.commission.processBatch(),
  updateInventory: (id: string, amount: number) => prisma.inventory.increment(id, amount),
  setInventoryQuantity: (id: string, data: { quantity: number }) => prisma.inventory.update(id, data),
  removeInventory: (id: string) => prisma.inventory.delete(id),
  addInventory: (data: Omit<InventoryItem, 'id'>) => prisma.inventory.create(data)
};
