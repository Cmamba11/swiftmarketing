
// This file is deprecated. Please use prisma.ts for relational database operations.
import { prisma } from './prisma';

export const db = {
  get: () => ({
    // Fix: Using prisma.partner instead of prisma.wholesaler
    customers: prisma.partner.findMany(),
    agents: prisma.salesAgent.findMany(),
    inventory: prisma.inventory.findMany(),
    callReports: prisma.callReport.findMany(),
    // Fix: Corrected property names to match prisma export
    commissions: prisma.commission.findMany(),
    logistics: prisma.logistics.findMany(),
    config: prisma.config.get()
  }),
  updateConfig: (updates: any) => {
    prisma.config.update(updates);
  },
  // Fix: Corrected processBatchCommissions to call the existing method in prisma.ts
  processBatchCommissions: () => {
    prisma.commission.processBatchCommissions();
  }
};

export { prisma };
