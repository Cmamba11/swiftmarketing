
// types.ts - Core system types

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

  // Order & Sales Permissions
  canViewOrders: boolean;
  canCreateOrders: boolean;
  canEditOrders: boolean;
  canDeleteOrders: boolean;
  canVerifyOrders: boolean;
  canApproveAsAgentHead: boolean;
  canApproveAsAccountOfficer: boolean;

  // Inventory Permissions
  canViewInventory: boolean;
  canCreateInventory: boolean;
  canEditInventory: boolean;
  canDeleteInventory: boolean;

  // Work Order Permissions
  canViewWorkOrders: boolean;
  canManageWorkOrders: boolean; // Start/Complete
  canDeleteWorkOrders: boolean;

  // Call Report Permissions
  canViewCalls: boolean;
  canCreateCalls: boolean;
  canEditCalls: boolean;
  canDeleteCalls: boolean;

  // Logistics Permissions
  canViewLogistics: boolean;
  canManageLogistics: boolean;

  // Security & Admin
  canViewSecurity: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canAccessAIArchitect: boolean;
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
  customerId: string;
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
  micron: string; 
  colors: string[]; 
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
  productName: string;
  productType: 'ROLLER' | 'PACKING_BAG';
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
  importerName?: string;
  items: OrderItem[];
  orderDate: string;
  status: 'PENDING' | 'AWAITING_PROD' | 'IN_PROD' | 'READY_FOR_DISPATCH' | 'CLOSED' | 'CANCELLED' | 'PARTIALLY_SETTLED';
  totalValue: number;
  internalId: string;
  
  // TRIPLE VERIFICATION
  adminApproved: boolean; 
  agentHeadApproved: boolean;
  accountOfficerApproved: boolean;

  proofOfPayment?: string;
  
  // SETTLEMENT TRIPLE VERIFICATION
  settlementAdminApproved: boolean;
  settlementAgentHeadApproved: boolean;
  settlementAccountOfficerApproved: boolean;
  
  finalWeight?: number;
  finalUnits?: number;
  settlementNotes?: string;
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
  projectedImpact?: string;
}

export interface WorkOrder {
  id: string;
  internalId: string;
  orderId: string;
  status: 'PENDING' | 'IN_PROD' | 'COMPLETED';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  startDate?: string;
  notes?: string;
}

export type ViewState = 'DASHBOARD' | 'PARTNERS' | 'AGENTS' | 'ORDERS' | 'SALES' | 'WORK_ORDERS' | 'CALL_REPORTS' | 'PORTFOLIO' | 'USER_MANAGEMENT' | 'ROLE_MANAGEMENT' | 'PRISMA_SCHEMA' | 'AI_ARCHITECT';
