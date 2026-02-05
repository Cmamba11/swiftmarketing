
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
  agentId?: string;
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
  businessCategory: string;
  website?: string;
  defaultRatePerKg?: number;
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
  employeeId: string;
  hireDate: string;
  emergencyContact: string;
  baseSalary: number;
  weeklyTarget: number;
  monthlyTarget: number;
  commissionRate: number;
  dataAccuracyScore: number;
  timelinessScore: number;
}

export interface Sale {
  id: string;
  orderId: string;
  agentId: string;
  partnerId: string;
  inventoryItemId: string;
  totalKg: number;
  volume: number;
  unitPrice: number;
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
  summary: string;
  notes: string;
  orderId?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productType: 'ROLLER' | 'PACKING_BAG';
  quantity: number;
  totalKg?: number;
  ratePerKg?: number;
  fulfilledQuantity: number;
}

export interface Order {
  id: string;
  partnerId?: string;
  guestCompanyName?: string;
  items: OrderItem[];
  orderDate: string;
  status: 'PENDING' | 'AWAITING_PROD' | 'IN_PROD' | 'READY_FOR_DISPATCH' | 'FULFILLED' | 'CANCELLED' | 'PARTIALLY_FULFILLED';
  totalValue: number;
  internalId: string;
  pendingDispatch?: {
    systemOwnerApproved: boolean;
    accountOfficerApproved: boolean;
    inventoryItemId: string;
    totalKg: number;
    volume: number;
    notes: string;
  };
}

export interface WorkOrder {
  id: string;
  orderId: string;
  internalId: string;
  status: 'PENDING' | 'IN_PROD' | 'COMPLETED';
  startDate?: string;
  completionDate?: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  notes: string;
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

// Fixed: Added missing view state identifiers to resolve type overlap errors in App.tsx
export type ViewState = 'DASHBOARD' | 'PARTNERS' | 'AGENTS' | 'ORDERS' | 'WORK_ORDERS' | 'SALES' | 'PRODUCTION' | 'CALL_REPORTS' | 'PORTFOLIO' | 'USER_MANAGEMENT' | 'ROLE_MANAGEMENT' | 'PRISMA_SCHEMA' | 'AI_ARCHITECT';
