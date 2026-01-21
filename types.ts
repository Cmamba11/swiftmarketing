
export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemAdmin: boolean;
  canManageInventory: boolean;
  canManageWholesalers: boolean;
  canManageAgents: boolean;
  canManageCalls: boolean;
  canAccessAI: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  roleId: string;
  lastLogin?: string;
}

export enum PartnerType {
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

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  email: string;
  phone: string;
  contactPerson: string;
  location: string;
  address: string;
  assignedAgentId: string;
  status: string;
  taxId: string;
  businessCategory: string;
  creditLimit: number;
  website?: string;
}

// Aliases for modules using Customer naming convention
export type Customer = Partner;
export type CustomerType = PartnerType;
export const CustomerType = PartnerType;

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  role: string;
  performanceScore: number;
  customersAcquired: number;
  employeeId: string;
  hireDate: string;
  emergencyContact: string;
  baseSalary: number;
}

export interface CallReport {
  id: string;
  customerId: string;
  agentId: string;
  date: string;
  duration: number;
  outcome: VisitOutcome;
  notes: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productType: 'ROLLER' | 'PACKING_BAG';
  quantity: number;
  totalKg?: number;
}

export interface Order {
  id: string;
  partnerId: string;
  items: OrderItem[];
  orderDate: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  totalValue: number;
}

export interface InventoryItem {
  id: string;
  partnerId: string | null; // NULL means Factory Reserve
  productName: string;
  productType: 'ROLLER' | 'PACKING_BAG';
  quantity: number;
  totalKg?: number; // Tracks current total weight in stock for Rollers
  unit: string;
  lastRestocked: string;
}

export interface LogisticsReport {
  id: string;
  agentId: string;
  vehicleId: string;
  fuelUsage: number;
  distanceCovered: number;
}

export interface Commission {
  id: string;
  agentId: string;
  amount: number;
  status: 'Pending' | 'Paid';
  date: string;
  breakdown?: { label: string; amount: number }[];
}

export interface SystemConfig {
  recommendedCommissionRate: number;
  targetEfficiencyMetric: string;
  customerSegmentationAdvice: string[];
  logisticsThreshold: number;
  lastUpdated: string;
}

export type ViewState = 'DASHBOARD' | 'PARTNERS' | 'AGENTS' | 'ORDERS' | 'AI_ARCHITECT' | 'PRODUCTION' | 'CALL_REPORTS' | 'PRISMA_SCHEMA' | 'USER_MANAGEMENT' | 'ROLE_MANAGEMENT';
