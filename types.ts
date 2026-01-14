
export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemAdmin: boolean;
  // Module Permissions
  canManageInventory: boolean;
  canManageWholesalers: boolean;
  canManageAgents: boolean;
  canManageCalls: boolean;
  canAccessAI: boolean;
  // Action Permissions (Granular Control)
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  roleId: string; // References Role.id
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
  phone: string;
  contactPerson: string;
  location: string;
  address: string;
  assignedAgentId: string;
  productsPitched: string[];
  status: string;
  // Enhanced Info
  taxId: string;
  businessCategory: string;
  creditLimit: number;
  website?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  role: string;
  performanceScore: number;
  customersAcquired: number;
  // Enhanced Info
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
  duration: number; // Talk Time in minutes
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

export interface Commission {
  id: string;
  agentId: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Paid';
  breakdown?: { label: string; amount: number }[];
}

export interface InventoryItem {
  id: string;
  customerId: string;
  productName: string;
  quantity: number;
  unit: string;
  lastRestocked: string;
}

export interface SystemConfig {
  recommendedCommissionRate: number;
  targetEfficiencyMetric: string;
  customerSegmentationAdvice: string[];
  logisticsThreshold: number;
  lastUpdated: string;
}

export type ViewState = 'DASHBOARD' | 'CUSTOMERS' | 'AGENTS' | 'AI_ARCHITECT' | 'PRODUCTION' | 'CALL_REPORTS' | 'PRISMA_SCHEMA' | 'USER_MANAGEMENT' | 'ROLE_MANAGEMENT';
