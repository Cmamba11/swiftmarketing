
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  PRODUCTION = 'PRODUCTION',
  LOGISTICS = 'LOGISTICS'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  lastLogin?: string;
}

export enum CustomerType {
  NEW = 'NEW',
  EXISTING = 'EXISTING',
  TARGETED = 'TARGETED'
}

export enum VisitOutcome {
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  FOLLOW_UP = 'FOLLOW_UP',
  ORDER_PLACED = 'ORDER_PLACED'
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  email: string;
  location: string;
  assignedAgentId: string;
  productsPitched: string[];
  status: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  performanceScore: number;
  customersAcquired: number;
}

export interface CallReport {
  id: string;
  customerId: string;
  agentId: string;
  date: string;
  duration: number; // in minutes
  outcome: VisitOutcome;
  notes: string;
}

export interface LogisticsReport {
  id: string;
  agentId: string;
  vehicleId: string;
  fuelUsage: number;
  distanceCovered: number;
  date: string;
}

export interface CommissionBreakdown {
  label: string;
  amount: number;
}

export interface Commission {
  id: string;
  agentId: string;
  amount: number;
  status: 'Pending' | 'Paid';
  date: string;
  breakdown?: CommissionBreakdown[];
}

export interface InventoryItem {
  id: string;
  customerId: string;
  productName: string;
  quantity: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface SystemConfig {
  recommendedCommissionRate: number;
  targetEfficiencyMetric: string;
  customerSegmentationAdvice: string[];
  logisticsThreshold: number;
  lastUpdated: string;
}

export type ViewState = 'DASHBOARD' | 'CUSTOMERS' | 'AGENTS' | 'LOGISTICS' | 'COMMISSIONS' | 'AI_ARCHITECT' | 'PRODUCTION' | 'CALL_REPORTS' | 'PRISMA_SCHEMA' | 'USER_MANAGEMENT';
