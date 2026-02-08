
import { prisma } from './prisma';
import { externalDb } from './database';
import { Partner, Agent, Order, Sale, InventoryItem, CallReport, User, Role, WorkOrder, InventoryLog } from '../types';

/**
 * API GATEWAY (Neon Postgres Bridge)
 * This service acts as the 'Switchboard' - choosing between the Cloud Server 
 * or Local Simulation based on connectivity.
 */

// Helper to decide if we use the server
const useServer = () => externalDb.isOnline();

export const api = {
  partners: {
    getAll: async (): Promise<Partner[]> => { 
      if (useServer()) return (await externalDb.fetchTable<Partner>('partners')) || [];
      return prisma.partner.findMany(); 
    },
    create: async (data: any): Promise<Partner> => { 
      if (useServer()) return (await externalDb.createRecord<Partner>('partners', data)) || prisma.partner.create(data);
      return prisma.partner.create(data); 
    },
    delete: async (id: string): Promise<void> => { 
      if (useServer()) await externalDb.request(`/partners/${id}`, { method: 'DELETE' });
      return prisma.partner.delete(id); 
    },
  },
  agents: {
    getAll: async (): Promise<Agent[]> => { 
      if (useServer()) return (await externalDb.fetchTable<Agent>('agents')) || [];
      return prisma.salesAgent.findMany(); 
    },
    create: async (data: any): Promise<Agent> => { 
      if (useServer()) return (await externalDb.createRecord<Agent>('agents', data)) || prisma.salesAgent.create(data);
      return prisma.salesAgent.create(data); 
    },
    delete: async (id: string): Promise<void> => { 
      if (useServer()) await externalDb.request(`/agents/${id}`, { method: 'DELETE' });
      return prisma.salesAgent.delete(id); 
    },
  },
  orders: {
    getAll: async (): Promise<Order[]> => { 
      if (useServer()) return (await externalDb.fetchTable<Order>('orders')) || [];
      return prisma.order.findMany(); 
    },
    create: async (data: any): Promise<Order> => { 
      if (useServer()) return (await externalDb.createRecord<Order>('orders', data)) || prisma.order.create(data);
      return prisma.order.create(data); 
    },
    updatePending: async (id: string, data: any): Promise<void> => { 
      if (useServer()) {
        await externalDb.request(`/orders/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ pendingDispatch: data })
        });
      }
      return prisma.order.updatePendingDispatch(id, data); 
    },
  },
  workOrders: {
    getAll: async (): Promise<WorkOrder[]> => { 
      if (useServer()) return (await externalDb.fetchTable<WorkOrder>('workOrders')) || []; 
      return prisma.workOrder.findMany(); 
    },
    issue: async (orderId: string): Promise<WorkOrder> => { 
      if (useServer()) return (await externalDb.createRecord<WorkOrder>('workOrders', { orderId, status: 'PENDING', priority: 'NORMAL' })) || prisma.workOrder.issue(orderId);
      return prisma.workOrder.issue(orderId); 
    },
    updateStatus: async (id: string, status: any): Promise<void> => { 
      if (useServer()) {
        await externalDb.request(`/workOrders/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
      }
      return prisma.workOrder.updateStatus(id, status); 
    },
  },
  sales: {
    getAll: async (): Promise<Sale[]> => { 
      if (useServer()) return (await externalDb.fetchTable<Sale>('sales')) || []; 
      return prisma.sale.findMany(); 
    },
    create: async (data: any): Promise<Sale> => { 
      if (useServer()) return (await externalDb.createRecord<Sale>('sales', data)) || prisma.sale.create(data); 
      return prisma.sale.create(data); 
    },
  },
  inventory: {
    getAll: async (): Promise<InventoryItem[]> => { 
      if (useServer()) return (await externalDb.fetchTable<InventoryItem>('inventory')) || []; 
      return prisma.inventory.findMany(); 
    },
    create: async (data: any): Promise<InventoryItem> => { 
      if (useServer()) return (await externalDb.createRecord<InventoryItem>('inventory', data)) || prisma.inventory.create(data);
      return prisma.inventory.create(data); 
    },
    adjust: async (id: string, change: number, type: string, notes: string): Promise<void> => { 
      if (useServer()) {
        await externalDb.request(`/inventory/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantityChange: change, type, notes })
        });
      }
      return prisma.inventory.adjust(id, change, type, notes); 
    },
    getLogs: async (itemId: string): Promise<InventoryLog[]> => { 
      if (useServer()) {
        const logs = await externalDb.request<InventoryLog[]>(`/inventory/${itemId}/logs`);
        if (logs) return logs;
      }
      return prisma.inventory.findLogs(itemId); 
    },
    delete: async (id: string): Promise<void> => { 
      if (useServer()) await externalDb.request(`/inventory/${id}`, { method: 'DELETE' });
      return prisma.inventory.delete(id); 
    },
  },
  calls: {
    getAll: async (): Promise<CallReport[]> => { 
      if (useServer()) return (await externalDb.fetchTable<CallReport>('calls')) || []; 
      return prisma.callReport.findMany(); 
    },
    create: async (data: any): Promise<CallReport> => { 
      if (useServer()) return (await externalDb.createRecord<CallReport>('calls', data)) || prisma.callReport.create(data); 
      return prisma.callReport.create(data); 
    },
  },
  users: {
    getAll: async () => prisma.user.findMany(),
    create: async (data: any) => prisma.user.create(data),
    delete: async (id: string) => prisma.user.delete(id),
  },
  roles: {
    getAll: async () => prisma.role.findMany(),
    create: async (data: any) => prisma.role.create(data),
    delete: async (id: string) => prisma.role.delete(id),
  }
};
