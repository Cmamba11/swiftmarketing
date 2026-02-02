
export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemAdmin: boolean;
  
  // Partner Permissions
  canViewPartners: boolean;
  canCreatePartners: boolean;
  canEditPartners: boolean;
  canDeletePartners: boolean;

  // Agent Permissions
  canViewAgents: boolean;
  canCreateAgents: boolean;
  canEditAgents: boolean;
  canDeleteAgents: boolean;

  // Order Permissions
  canViewOrders: boolean;
  canCreateOrders: boolean;
  canEditOrders: boolean;
  canDeleteOrders: boolean;

  // Inventory Permissions
  canViewInventory: boolean;
  canCreateInventory: boolean;
  canEditInventory: boolean;
  canDeleteInventory: boolean;

  // Call Report Permissions
  canViewCalls: boolean;
  canCreateCalls: boolean;
  canEditCalls: boolean;
  canDeleteCalls: boolean;

  // Security & Admin
  canViewSecurity: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
}

export interface User {
  id: string;
  username: string;
  password?: string;
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

export type Customer = Partner;
export type CustomerType = PartnerType;

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
  partnerId: string | null;
  productName: string;
  productType: 'ROLLER' | 'PACKING_BAG';
  quantity: number;
  totalKg?: number;
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

export type ViewState = 'DASHBOARD' | 'PARTNERS' | 'AGENTS' | 'ORDERS' | 'PRODUCTION' | 'CALL_REPORTS' | 'PRISMA_SCHEMA' | 'USER_MANAGEMENT' | 'ROLE_MANAGEMENT';
