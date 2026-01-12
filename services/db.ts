
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

export const db = {
  get(): DBStructure {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      this.save(INITIAL_DATA);
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  },

  save(data: DBStructure) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('db-update'));
  },

  updateConfig(newConfig: Partial<SystemConfig>) {
    const data = this.get();
    data.config = { ...data.config, ...newConfig, lastUpdated: new Date().toISOString() };
    this.save(data);
  },

  // Call Report Operations
  addCallReport(report: Omit<CallReport, 'id'>) {
    const data = this.get();
    const newReport = { ...report, id: crypto.randomUUID() };
    data.callReports.push(newReport);
    this.save(data);
    return newReport;
  },
  updateCallReport(id: string, updates: Partial<CallReport>) {
    const data = this.get();
    data.callReports = data.callReports.map(c => c.id === id ? { ...c, ...updates } : c);
    this.save(data);
  },
  deleteCallReport(id: string) {
    const data = this.get();
    data.callReports = data.callReports.filter(c => c.id !== id);
    this.save(data);
  },

  // Customer Operations
  addCustomer(customer: Omit<Customer, 'id'>) {
    const data = this.get();
    const newCustomer = { ...customer, id: crypto.randomUUID() };
    data.customers.push(newCustomer);
    this.save(data);
    return newCustomer;
  },
  updateCustomer(id: string, updates: Partial<Customer>) {
    const data = this.get();
    data.customers = data.customers.map(c => c.id === id ? { ...c, ...updates } : c);
    this.save(data);
  },
  deleteCustomer(id: string) {
    const data = this.get();
    data.customers = data.customers.filter(c => c.id !== id);
    data.inventory = data.inventory.filter(i => i.customerId !== id);
    this.save(data);
  },

  // Agent Operations
  addAgent(agent: Omit<Agent, 'id'>) {
    const data = this.get();
    const newAgent = { ...agent, id: crypto.randomUUID() };
    data.agents.push(newAgent);
    this.save(data);
    return newAgent;
  },
  updateAgent(id: string, updates: Partial<Agent>) {
    const data = this.get();
    data.agents = data.agents.map(a => a.id === id ? { ...a, ...updates } : a);
    this.save(data);
  },
  deleteAgent(id: string) {
    const data = this.get();
    data.agents = data.agents.filter(a => a.id !== id);
    this.save(data);
  },

  // Logistics Operations
  addLogisticsReport(report: Omit<LogisticsReport, 'id'>) {
    const data = this.get();
    const newReport = { ...report, id: crypto.randomUUID() };
    data.logistics.push(newReport);
    this.save(data);
    return newReport;
  },
  updateLogistics(id: string, updates: Partial<LogisticsReport>) {
    const data = this.get();
    data.logistics = data.logistics.map(l => l.id === id ? { ...l, ...updates } : l);
    this.save(data);
  },
  deleteLogistics(id: string) {
    const data = this.get();
    data.logistics = data.logistics.filter(l => l.id !== id);
    this.save(data);
  },

  // Commission Operations
  addCommission(commission: Omit<Commission, 'id'>) {
    const data = this.get();
    const newCommission = { ...commission, id: crypto.randomUUID() };
    data.commissions.push(newCommission);
    this.save(data);
    return newCommission;
  },
  updateCommission(id: string, updates: Partial<Commission>) {
    const data = this.get();
    data.commissions = data.commissions.map(c => c.id === id ? { ...c, ...updates } : c);
    this.save(data);
  },
  deleteCommission(id: string) {
    const data = this.get();
    data.commissions = data.commissions.filter(c => c.id !== id);
    this.save(data);
  },
  processBatchCommissions() {
    const data = this.get();
    data.commissions = data.commissions.map(c => ({ ...c, status: 'Paid' as const }));
    this.save(data);
  },

  // Inventory Operations
  updateInventory(id: string, quantity: number) {
    const data = this.get();
    const item = data.inventory.find(i => i.id === id);
    if (item) {
      item.quantity += quantity;
      this._refreshItemStatus(item);
      item.lastRestocked = new Date().toISOString().split('T')[0];
      this.save(data);
    }
  },
  setInventoryQuantity(id: string, newQuantity: number) {
    const data = this.get();
    const item = data.inventory.find(i => i.id === id);
    if (item) {
      item.quantity = Math.max(0, newQuantity);
      this._refreshItemStatus(item);
      item.lastRestocked = new Date().toISOString().split('T')[0];
      this.save(data);
    }
  },
  removeInventory(id: string) {
    const data = this.get();
    data.inventory = data.inventory.filter(i => i.id !== id);
    this.save(data);
  },
  addInventory(item: Omit<InventoryItem, 'id'>) {
    const data = this.get();
    const newItem = { ...item, id: crypto.randomUUID() };
    this._refreshItemStatus(newItem);
    data.inventory.push(newItem);
    this.save(data);
    return newItem;
  },
  _refreshItemStatus(item: InventoryItem) {
    if (item.quantity === 0) {
      item.status = 'Out of Stock';
    } else if (item.quantity <= 30) {
      item.status = 'Low Stock';
    } else {
      item.status = 'In Stock';
    }
  }
};
