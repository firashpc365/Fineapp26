-- ElitePro Financial OS - Supabase Schema
-- This migration creates all necessary tables for the app

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE AUTHENTICATION & USERS
-- ============================================================================

-- Extends Supabase auth.users with app-specific data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('ADMIN', 'JAG', 'PAUL')) DEFAULT 'ADMIN',
  company_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- ============================================================================
-- FINANCIAL TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  scope VARCHAR(50) CHECK (scope IN ('PERSONAL', 'BUSINESS', 'UNCERTAIN')) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('EXPENSE', 'INCOME', 'TRANSFER')) NOT NULL,
  category VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  description TEXT,
  project_hint VARCHAR(255),
  confidence_score DECIMAL(3, 2),
  source_document_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_scope ON public.transactions(scope);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- ============================================================================
-- RECEIPTS & DOCUMENT OCR
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  vendor_name VARCHAR(255) NOT NULL,
  document_date DATE NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  tax_amount DECIMAL(12, 2),
  document_type VARCHAR(50) CHECK (document_type IN ('RECEIPT', 'INVOICE', 'TRANSFER_PROOF')) NOT NULL,
  is_catering_supply BOOLEAN DEFAULT FALSE,
  raw_file_url TEXT,
  raw_file_path TEXT,
  extracted_text TEXT,
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_receipts_document_date ON public.receipts(document_date DESC);
CREATE INDEX idx_receipt_items_receipt_id ON public.receipt_items(receipt_id);

-- ============================================================================
-- CLIENTS / CONTACTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  contact_person VARCHAR(255),
  address TEXT,
  vat_number VARCHAR(50),
  commercial_registration VARCHAR(50),
  city VARCHAR(100),
  country VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) CHECK (status IN ('ACTIVE', 'INACTIVE', 'PROSPECT')) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_name ON public.clients(name);
CREATE INDEX idx_clients_status ON public.clients(status);

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  rating DECIMAL(3, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_suppliers_category ON public.suppliers(category);

-- ============================================================================
-- SERVICES / SERVICE CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) CHECK (category IN ('TENT', 'CATERING', 'BRANDING', 'GIFT', 'ENTERTAINMENT', 'GENERAL')) NOT NULL,
  description TEXT,
  selling_price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2) NOT NULL,
  profit DECIMAL(12, 2) GENERATED ALWAYS AS (selling_price - cost_price) STORED,
  specifications JSONB,
  includes JSONB,
  image_url TEXT,
  status VARCHAR(50) CHECK (status IN ('AVAILABLE', 'OUT_OF_STOCK')) DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_status ON public.services(status);

-- ============================================================================
-- QUOTES & QUOTATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  client_address TEXT,
  client_vat VARCHAR(50),
  client_cr VARCHAR(50),
  quote_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')) DEFAULT 'DRAFT',
  issue_date DATE NOT NULL,
  validity_date DATE,
  total_base_cost DECIMAL(12, 2),
  total_sell_price DECIMAL(12, 2) NOT NULL,
  total_tax DECIMAL(12, 2),
  total_with_tax DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'SAR',
  terms TEXT,
  notes TEXT,
  pdf_url TEXT,
  scope_of_work TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  base_cost_per_unit DECIMAL(12, 2),
  sell_price_per_unit DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * sell_price_per_unit) STORED,
  notes TEXT
);

CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_issue_date ON public.quotes(issue_date DESC);
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);

-- ============================================================================
-- RFQ (REQUEST FOR QUOTATION)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  rfq_number VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('RECEIVED', 'ACKNOWLEDGED', 'QUOTED', 'WON', 'LOST')) DEFAULT 'RECEIVED',
  event_date DATE,
  event_location VARCHAR(255),
  expected_pax INTEGER,
  requirements TEXT,
  attachments JSONB,
  notes TEXT,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  quoted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rfqs_user_id ON public.rfqs(user_id);
CREATE INDEX idx_rfqs_client_id ON public.rfqs(client_id);
CREATE INDEX idx_rfqs_status ON public.rfqs(status);

-- ============================================================================
-- PURCHASE ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  po_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) CHECK (status IN ('DRAFT', 'SENT', 'IN_TRANSIT', 'DELIVERED', 'PAID', 'CANCELLED')) DEFAULT 'DRAFT',
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  paid_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  received_quantity DECIMAL(10, 2) DEFAULT 0
);

CREATE INDEX idx_purchase_orders_user_id ON public.purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);

-- ============================================================================
-- PROJECTS & TASKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('ACTIVE', 'PENDING', 'ON_HOLD', 'COMPLETED', 'CANCELLED')) DEFAULT 'ACTIVE',
  total_amount DECIMAL(12, 2),
  cost DECIMAL(12, 2),
  profit DECIMAL(12, 2),
  paul_share DECIMAL(12, 2),
  start_date DATE,
  deadline DATE,
  completion_date DATE,
  priority VARCHAR(50) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED')) DEFAULT 'TODO',
  priority VARCHAR(50) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.task_dependencies (
  task_id UUID NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on_task_id),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX idx_project_tasks_assigned_to ON public.project_tasks(assigned_to);
CREATE INDEX idx_project_tasks_status ON public.project_tasks(status);

-- ============================================================================
-- AUDIT & LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================================================
-- BACKUP / EXPORT DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  export_type VARCHAR(50) CHECK (export_type IN ('FULL', 'FINANCIAL', 'QUOTES', 'PROJECTS')),
  file_name VARCHAR(255),
  file_url TEXT,
  file_size INTEGER,
  status VARCHAR(50) CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_data_exports_user_id ON public.data_exports(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "users_own_profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "users_own_transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_receipts" ON public.receipts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_receipt_items" ON public.receipt_items
  FOR ALL USING (receipt_id IN (SELECT id FROM public.receipts WHERE user_id = auth.uid()));

CREATE POLICY "users_own_clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_suppliers" ON public.suppliers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_services" ON public.services
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_quotes" ON public.quotes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_quote_items" ON public.quote_items
  FOR ALL USING (quote_id IN (SELECT id FROM public.quotes WHERE user_id = auth.uid()));

CREATE POLICY "users_own_rfqs" ON public.rfqs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_purchase_orders" ON public.purchase_orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_purchase_order_items" ON public.purchase_order_items
  FOR ALL USING (purchase_order_id IN (SELECT id FROM public.purchase_orders WHERE user_id = auth.uid()));

CREATE POLICY "users_own_projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_project_tasks" ON public.project_tasks
  FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "users_own_task_dependencies" ON public.task_dependencies
  FOR ALL USING (task_id IN (SELECT id FROM public.project_tasks WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())));

CREATE POLICY "users_own_activity_logs" ON public.activity_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_data_exports" ON public.data_exports
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- DONE
-- ============================================================================
