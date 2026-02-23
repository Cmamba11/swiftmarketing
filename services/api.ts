
import { externalDb } from './database';
import { offlineDataEngine } from './offlineDataEngine';
import { Partner, Agent, Order, Sale, CallReport, User, Role, WorkOrder } from '../types';

/**
 * SWIFT PLASTICS - HYBRID API BRIDGE
 * This service attempts to use the Relational Backend (ExternalDB).
 * If the backend is unreachable, it falls back to the Offline Engine for Demo/Sandbox mode.
 */

const isOnline = () => externalDb.isOnline();

export const api = {
  partners: {
    getAll: async (): Promise<Partner[]> => { 
      if (!isOnline()) return offlineDataEngine.partner.findMany();
      return (await externalDb.fetchTable<Partner>('partners')) || [];
    },
    create: async (data: any): Promise<Partner> => { 
      if (!isOnline()) return offlineDataEngine.partner.create(data);
      const res = await externalDb.createRecord<Partner>('partners', data);
      if (!res) throw new Error("Backend error.");
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
    delete: async (id: string): Promise<void> => { 
      if (!isOnline()) return offlineDataEngine.partner.delete(id);
      await externalDb.request(`/partners/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
  },
  agents: {
    getAll: async (): Promise<Agent[]> => { 
      if (!isOnline()) return offlineDataEngine.salesAgent.findMany();
      return (await externalDb.fetchTable<Agent>('agents')) || [];
    },
    create: async (data: any): Promise<Agent> => { 
      if (!isOnline()) return offlineDataEngine.salesAgent.create(data);
      const res = await externalDb.createRecord<Agent>('agents', data);
      if (!res) throw new Error("Backend error.");
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
    delete: async (id: string): Promise<void> => { 
      if (!isOnline()) return offlineDataEngine.salesAgent.delete(id);
      await externalDb.request(`/agents/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
  },
  orders: {
    getAll: async (): Promise<Order[]> => { 
      if (!isOnline()) return offlineDataEngine.order.findMany();
      return (await externalDb.fetchTable<Order>('orders')) || []; 
    },
    create: async (data: any): Promise<Order> => { 
      if (!isOnline()) return offlineDataEngine.order.create(data);
      const res = await externalDb.createRecord<Order>('orders', data);
      if (!res) throw new Error("Backend error.");
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
    approve: async (id: string, type: 'ADMIN' | 'AGENT_HEAD' | 'ACCOUNT_OFFICER'): Promise<void> => {
      if (!isOnline()) return offlineDataEngine.order.approve(id, type);
       await externalDb.request(`/orders/${id}/approve`, { 
         method: 'POST', 
         body: JSON.stringify({ type }) 
       });
       window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
    approveSettlement: async (id: string, type: 'ADMIN' | 'AGENT_HEAD' | 'ACCOUNT_OFFICER'): Promise<void> => {
      if (!isOnline()) return offlineDataEngine.order.approveSettlement(id, type);
       await externalDb.request(`/orders/${id}/settlement-approve`, { 
         method: 'POST', 
         body: JSON.stringify({ type }) 
       });
       window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
    updateSettlementData: async (id: string, data: any): Promise<void> => {
      if (!isOnline()) return offlineDataEngine.order.updateSettlementData(id, data);
       await externalDb.request(`/orders/${id}/settlement-data`, { 
         method: 'PATCH', 
         body: JSON.stringify(data) 
       });
       window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
    delete: async (id: string): Promise<void> => {
      if (!isOnline()) return offlineDataEngine.order.delete(id);
      await externalDb.request(`/orders/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
    close: async (id: string): Promise<void> => {
      if (!isOnline()) return offlineDataEngine.order.close(id);
      await externalDb.request(`/orders/${id}/close`, { method: 'POST' });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
  },
  sales: {
    getAll: async (): Promise<Sale[]> => { 
      if (!isOnline()) return offlineDataEngine.sale.findMany();
      return (await externalDb.fetchTable<Sale>('sales')) || []; 
    },
    create: async (data: any): Promise<Sale> => { 
      if (!isOnline()) return offlineDataEngine.sale.create(data);
      const res = await externalDb.createRecord<Sale>('sales', data);
      if (!res) throw new Error("Backend error.");
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
  },
  calls: {
    getAll: async (): Promise<CallReport[]> => { 
      if (!isOnline()) return offlineDataEngine.callReport.findMany();
      return (await externalDb.fetchTable<CallReport>('calls')) || []; 
    },
    create: async (data: any): Promise<CallReport> => { 
      if (!isOnline()) return offlineDataEngine.callReport.create(data);
      const res = await externalDb.createRecord<CallReport>('calls', data);
      if (!res) throw new Error("Backend error.");
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
  },
  users: {
    getAll: async () => {
      if (!isOnline()) return offlineDataEngine.user.findMany();
      return (await externalDb.fetchTable<User>('users')) || [];
    },
    create: async (data: any) => {
      if (!isOnline()) return offlineDataEngine.user.create(data);
      const res = await externalDb.createRecord<User>('users', data);
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
    update: async (id: string, updates: Partial<User>) => {
      if (!isOnline()) return offlineDataEngine.user.update(id, updates);
      const res = await externalDb.request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
    delete: async (id: string) => {
      if (!isOnline()) return offlineDataEngine.user.delete(id);
      await externalDb.request(`/users/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
  },
  roles: {
    getAll: async () => {
      if (!isOnline()) return offlineDataEngine.role.findMany();
      return (await externalDb.fetchTable<Role>('roles')) || [];
    },
    create: async (data: any) => {
      if (!isOnline()) return offlineDataEngine.role.create(data);
      const res = await externalDb.createRecord<Role>('roles', data);
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
    delete: async (id: string) => {
      if (!isOnline()) return offlineDataEngine.role.delete(id);
      await externalDb.request(`/roles/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
  },
  workOrders: {
    getAll: async (): Promise<WorkOrder[]> => {
      if (!isOnline()) return offlineDataEngine.workOrder.findMany();
      return (await externalDb.fetchTable<WorkOrder>('work-orders')) || [];
    },
    issue: async (orderId: string): Promise<WorkOrder> => {
      if (!isOnline()) return offlineDataEngine.workOrder.issue(orderId);
      const res = await externalDb.request<WorkOrder>(`/work-orders/issue`, { 
        method: 'POST', 
        body: JSON.stringify({ orderId }) 
      });
      if (!res) throw new Error("Backend error.");
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
      return res;
    },
    updateStatus: async (id: string, status: 'IN_PROD' | 'COMPLETED'): Promise<void> => {
      if (!isOnline()) return offlineDataEngine.workOrder.updateStatus(id, status);
      await externalDb.request(`/work-orders/${id}/status`, { 
        method: 'PATCH', 
        body: JSON.stringify({ status }) 
      });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
    delete: async (id: string): Promise<void> => {
      if (!isOnline()) return offlineDataEngine.workOrder.delete(id);
      await externalDb.request(`/work-orders/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    },
  },
  config: {
    get: async () => {
      if (!isOnline()) return offlineDataEngine.config.get();
      return await externalDb.request<any>('/config');
    },
    update: async (updates: any) => {
      if (!isOnline()) return offlineDataEngine.config.update(updates);
      await externalDb.request('/config', { method: 'PATCH', body: JSON.stringify(updates) });
      window.dispatchEvent(new CustomEvent('prisma-mutation'));
    }
  }
};
