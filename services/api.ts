
import { prisma } from './prisma';
import { externalDb } from './database';
import { Partner, Agent, Order, Sale, InventoryItem, CallReport, User, Role, WorkOrder } from '../types';

/**
 * API GATEWAY (Neon Postgres Bridge)
 * This service routes traffic between the UI and the Backend Project.
 */

const delay = (ms: number = 300) => new Promise(res => setTimeout(res, ms));

const logCloudActivity = (action: string, table: string) => {
  if (externalDb.getMode() === 'PRODUCTION') {
    console.log(`[NEON-BRIDGE] ${action} executed on ${table} at ${externalDb.getTargetUri().split('@')[1].split('/')[0]}`);
  }
};

export const api = {
  partners: {
    getAll: async () => { 
      await delay(); 
      logCloudActivity('FETCH_ALL', 'partners');
      return prisma.partner.findMany(); 
    },
    create: async (data: any) => { 
      await delay(); 
      logCloudActivity('CREATE', 'partners');
      return prisma.partner.create(data); 
    },
    delete: async (id: string) => { 
      await delay(); 
      logCloudActivity('DELETE', 'partners');
      return prisma.partner.delete(id); 
    },
  },
  agents: {
    getAll: async () => { await delay(); return prisma.salesAgent.findMany(); },
    create: async (data: any) => { await delay(); return prisma.salesAgent.create(data); },
    delete: async (id: string) => { await delay(); return prisma.salesAgent.delete(id); },
  },
  orders: {
    getAll: async () => { await delay(); return prisma.order.findMany(); },
    create: async (data: any) => { await delay(); return prisma.order.create(data); },
    updatePending: async (id: string, data: any) => { await delay(100); return prisma.order.updatePendingDispatch(id, data); },
  },
  workOrders: {
    getAll: async () => { await delay(); return prisma.workOrder.findMany(); },
    issue: async (orderId: string) => { await delay(); return prisma.workOrder.issue(orderId); },
    updateStatus: async (id: string, status: any) => { await delay(); return prisma.workOrder.updateStatus(id, status); },
  },
  sales: {
    getAll: async () => { await delay(); return prisma.sale.findMany(); },
    create: async (data: any) => { await delay(); return prisma.sale.create(data); },
  },
  inventory: {
    getAll: async () => { await delay(); return prisma.inventory.findMany(); },
    create: async (data: any) => { await delay(); return prisma.inventory.create(data); },
    adjust: async (id: string, change: number, type: string, notes: string) => { await delay(); return prisma.inventory.adjust(id, change, type, notes); },
    getLogs: async (itemId: string) => { await delay(); return prisma.inventory.findLogs(itemId); },
    delete: async (id: string) => { await delay(); return prisma.inventory.delete(id); },
  },
  calls: {
    getAll: async () => { await delay(); return prisma.callReport.findMany(); },
    create: async (data: any) => { await delay(); return prisma.callReport.create(data); },
  },
  users: {
    getAll: async () => { await delay(); return prisma.user.findMany(); },
    create: async (data: any) => { await delay(); return prisma.user.create(data); },
    delete: async (id: string) => { await delay(); return prisma.user.delete(id); },
  },
  roles: {
    getAll: async () => { await delay(); return prisma.role.findMany(); },
    create: async (data: any) => { await delay(); return prisma.role.create(data); },
    delete: async (id: string) => { await delay(); return prisma.role.delete(id); },
  }
};
