
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
  agentId?: string; // Links a user to their specific Sales Agent profile
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
  assignedAgentId: string; // Known as "Account Officer"
  status: string;
  businessCategory: string;
  website?: string;
  defaultRatePerKg?: number; // Added to store partner-specific pricing
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
  employeeId: string; // Used as Agent Number in UI
  hireDate: string;
  emergencyContact: string;
  baseSalary: number;
  weeklyTarget: number;
  monthlyTarget: number;
  commissionRate: number; // Percentage, e.g., 10 for 10%
  // New KPI Specific Fields
  dataAccuracyScore: number; // 0-100%
  timelinessScore: number; // 0-100%
}

export interface Sale {
  id: string;
  orderId: string;
  agentId: string;
  partnerId: string;
  inventoryItemId: string; 
  totalKg: number; // Dispatched Weight
  volume: number; // Dispatched Units
  unitPrice: number; // For value calculation (Rate per KG or Per Bag)
  date: string;
  notes: string;
}

export interface CallReport {
  id: string;
  customerId: string;
  agentId: string;
  date: string;
  duration: number;
  outcome: VisitOutcome;
  summary: string; // Added for brief discussion overview
  notes: string;
  orderId?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productType: 'ROLLER' | 'PACKING_BAG';
  quantity: number; 
  totalKg?: number; 
  ratePerKg?: number; // Specific rate used for this order item
  fulfilledQuantity: number; 
}

export interface Order {
  id: string;
  partnerId?: string;
  guestCompanyName?: string; // Added for walk-in orders
  items: OrderItem[];
  orderDate: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'PARTIALLY_FULFILLED';
  totalValue: number;
  internalId: string;
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

export interface InventoryLog {
  id: string;
  inventoryItemId: string;
  type: 'INITIAL_STOCK' | 'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'REDUCTION';
  change: number;
  finalQuantity: number;
  timestamp: string;
  userName: string;
  notes?: string;
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

export type ViewState = 'DASHBOARD' | 'PARTNERS' | 'AGENTS' | 'ORDERS' | 'SALES' | 'PRODUCTION' | 'CALL_REPORTS' | 'PORTFOLIO' | 'PRISMA_SCHEMA' | 'USER_MANAGEMENT' | 'ROLE_MANAGEMENT';
