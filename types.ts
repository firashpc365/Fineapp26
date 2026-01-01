
export enum Scope {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
  UNCERTAIN = 'UNCERTAIN'
}

export enum AppMode {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS'
}

export enum UserRole {
  ADMIN = 'ADMIN', // Firash
  JAG = 'JAG',     // Proxy Partner
  PAUL = 'PAUL'    // Customer/Partner
}

export enum DocType {
  RECEIPT = 'RECEIPT',
  INVOICE = 'INVOICE',
  TRANSFER_PROOF = 'TRANSFER_PROOF'
}

export interface AppSettings {
  // Neural Engine
  aiThinkingMode: boolean;
  autoRecordConfidence: number;
  aiModelPreference: 'flash' | 'pro';
  
  // Interface
  compactSidebar: boolean;
  glassIntensity: 'low' | 'medium' | 'high';
  themeAccent: 'teal' | 'blue' | 'purple' | 'gold';
  activeWallpaper: string; 
  animationsEnabled: boolean;
  motionEffects: boolean;
  autoSync: boolean;

  // Visual Layer Control
  bgOverlayOpacity: number; // 0.0 to 1.0 (Transparency)
  enableTechGrid: boolean;  // Visibility of tech pattern
  enableNoise: boolean;     // Visibility of grain
  techGridPosition: 'back' | 'front'; // Layer ordering
  
  // Environment
  defaultCurrency: string;
  enableNotifications: boolean;
  language: 'en' | 'ar';
  
  // Business Logic
  defaultTaxRate: number;      // VAT e.g., 15
  jagInvoiceFeeRate: number;   // e.g., 10
  paulInvoiceFeeRate: number;  // e.g., 5
  paulCommissionRate: number;
  targetProfitMargin: number;
}

export interface TransactionResult {
  scope: Scope;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  category: string;
  amount: number | null;
  currency: string;
  description: string;
  project_hint: string | null;
  confidence_score: number;
}

export interface OCRResult {
  vendor_name: string;
  date: string;
  total: number;
  currency: string;
  tax_amount: number;
  items: Array<{ qty: number; desc: string; price: number }>;
  document_type: DocType;
  is_catering_supply: boolean;
}

export interface QuoteItem {
  name: string;
  base_cost: number;
}

export interface QuoteResult {
  calculated_items: Array<{
    item: string;
    base_cost: number;
    suggested_sell_price: number;
    reasoning: string;
  }>;
  scope_of_work_text: string;
  warnings: string[];
}

export interface RFQResult {
  suggested_package_id: string;
  logistics: {
    date: string;
    location: string;
    pax: number;
  };
  missing_info: string[];
  draft_reply_to_paul: string;
}

export interface MenuPackage {
  id: string;
  name: string;
  items: string[];
  base_cost_per_pax: number;
}

// CRM & Procurement Types
export type ServiceCategory = 'TENT' | 'CATERING' | 'BRANDING' | 'GIFT' | 'ENTERTAINMENT' | 'GENERAL';

export interface ServiceItem {
  id: number | string;
  title: string;
  category: ServiceCategory;
  selling_price: number;
  cost_price: number;
  profit?: number;
  specifications?: Record<string, string>; // e.g., { size: "6x12m", type: "Beach" }
  includes?: string[];
  description?: string; // Extended details, delivery terms, technical specs
  image_url?: string;
  status?: 'AVAILABLE' | 'OUT_OF_STOCK';
  created_at?: string;
}

export interface ClientItem {
  id: number;
  name: string;
  contact: string;
  vat: string;
  email: string;
  address?: string;
  cr?: string; // Commercial Registration
}

export interface SupplierItem {
  id: number;
  name: string;
  category: string;
  rating: string;
  contact: string;
}

export type POStatus = 'DRAFT' | 'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'PAID';

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: string;
  amount: number;
  status: POStatus;
  date: string;
}

export interface TaskItem {
  id: string;
  title: string;
  status: 'PENDING' | 'COMPLETED';
  dependencies: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  client_name: string;
  deadline: string;
  total_amount: number;
  cost: number;
  paul_share: number;
  status: "ACTIVE" | "PENDING" | "COMPLETED";
  tasks?: TaskItem[];
}
