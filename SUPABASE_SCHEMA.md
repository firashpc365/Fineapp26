# Supabase Schema Documentation

## Overview
This document describes the database schema for ElitePro Financial OS. The schema supports:
- Multi-user financial tracking (Personal & Business modes)
- Client & supplier management
- Quote generation and RFQ handling
- Purchase order tracking
- Project management with task dependencies
- Receipt/invoice OCR and categorization
- Complete audit logging

---

## Table Relationships Diagram

```
user_profiles (core)
├── transactions (financial data)
├── receipts + receipt_items (OCR/invoices)
├── clients (CRM)
├── suppliers (vendor management)
├── services (catalog)
├── quotes + quote_items (sales)
├── rfqs (inbound requests)
├── purchase_orders + purchase_order_items (procurement)
├── projects + project_tasks + task_dependencies (workflow)
├── activity_logs (audit)
└── data_exports (backups)
```

---

## Core Tables

### `user_profiles`
Extends Supabase `auth.users` with app-specific fields.
- **Primary Key:** `id` (references `auth.users(id)`)
- **Indexes:** `role`
- **Foreign Keys:** None (auth-managed)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, FK to auth.users |
| display_name | VARCHAR(255) | Full name |
| role | VARCHAR(50) | ADMIN, JAG, or PAUL |
| company_name | VARCHAR(255) | Business entity |
| email | VARCHAR(255) | Unique email |
| phone | VARCHAR(20) | Contact number |
| avatar_url | TEXT | Profile image |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated |

---

## Financial & Transactions

### `transactions`
Individual financial transactions (expenses, income, transfers).
- **Primary Key:** `id`
- **Foreign Key:** `user_id` → `user_profiles`
- **Indexes:** `user_id`, `scope`, `type`, `created_at`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK |
| scope | VARCHAR(50) | PERSONAL, BUSINESS, UNCERTAIN |
| type | VARCHAR(50) | EXPENSE, INCOME, TRANSFER |
| category | VARCHAR(255) | e.g., "Food", "Transport", "JAG Settlement" |
| amount | DECIMAL(12,2) | Amount in specified currency |
| currency | VARCHAR(3) | Defaults to SAR |
| description | TEXT | Transaction details |
| project_hint | VARCHAR(255) | Associated project name (optional) |
| confidence_score | DECIMAL(3,2) | AI categorization confidence (0-1) |
| source_document_id | UUID | References receipt/document ID |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated |

---

### `receipts` & `receipt_items`
Digitized invoices and receipts with line-item breakdown.
- **Primary Key:** `receipts.id`, `receipt_items.id`
- **Foreign Keys:** `receipts.user_id` → `user_profiles`; `receipt_items.receipt_id` → `receipts`
- **Indexes:** User ID, document date

| Column | Type | Notes |
|--------|------|-------|
| vendor_name | VARCHAR(255) | Shop/supplier name |
| document_date | DATE | Date on receipt |
| total | DECIMAL(12,2) | Grand total |
| currency | VARCHAR(3) | Detected currency |
| tax_amount | DECIMAL(12,2) | VAT/tax component |
| document_type | VARCHAR(50) | RECEIPT, INVOICE, TRANSFER_PROOF |
| is_catering_supply | BOOLEAN | Bulk food = true |
| raw_file_url | TEXT | S3/cloud storage path |
| extracted_text | TEXT | OCR output |
| confidence_score | DECIMAL(3,2) | Quality score |

---

## Sales & Quotations

### `quotes` & `quote_items`
Professional quotations for clients.
- **Primary Key:** `quotes.id`, `quote_items.id`
- **Foreign Keys:** `quotes.user_id`, `quotes.client_id`; `quote_items.quote_id`, `quote_items.service_id`
- **Indexes:** User, client, status, issue date

| Column | Type | Notes |
|--------|------|-------|
| quote_number | VARCHAR(100) | Unique identifier (e.g., QT-2026-001) |
| status | VARCHAR(50) | DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED |
| client_name | VARCHAR(255) | Fallback if client_id is null |
| issue_date | DATE | Quote creation date |
| validity_date | DATE | Offer expiration date |
| total_base_cost | DECIMAL(12,2) | Sum of cost_price * qty |
| total_sell_price | DECIMAL(12,2) | Final quoted price |
| total_tax | DECIMAL(12,2) | Tax on sale price |
| total_with_tax | DECIMAL(12,2) | Final amount including tax |
| currency | VARCHAR(3) | Defaults to SAR |
| scope_of_work | TEXT | Detailed deliverables (HTML/markdown) |
| pdf_url | TEXT | Generated PDF path |
| sent_at | TIMESTAMP | When quote was sent |
| accepted_at | TIMESTAMP | When client accepted |

---

### `rfqs` (Request for Quotation)
Inbound quotation requests from clients.
- **Primary Key:** `id`
- **Foreign Keys:** `user_id`, `client_id`
- **Indexes:** User, client, status

| Column | Type | Notes |
|--------|------|-------|
| rfq_number | VARCHAR(100) | Tracking number |
| status | VARCHAR(50) | RECEIVED, ACKNOWLEDGED, QUOTED, WON, LOST |
| event_date | DATE | Requested event date |
| event_location | VARCHAR(255) | Venue |
| expected_pax | INTEGER | Expected attendees |
| requirements | TEXT | RFQ details |
| attachments | JSONB | File references |
| received_at | TIMESTAMP | When RFQ was received |
| quoted_at | TIMESTAMP | When quote was generated |

---

## CRM & Vendor Management

### `clients`
Customer/prospect contact information.
- **Primary Key:** `id`
- **Foreign Key:** `user_id`
- **Indexes:** User, name, status

| Column | Type | Notes |
|--------|------|-------|
| name | VARCHAR(255) | Company or person name |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(20) | Mobile/landline |
| contact_person | VARCHAR(255) | Named contact |
| address | TEXT | Full address |
| vat_number | VARCHAR(50) | Tax identification |
| commercial_registration | VARCHAR(50) | Company registration |
| city, country | VARCHAR(100) | Location |
| status | VARCHAR(50) | ACTIVE, INACTIVE, PROSPECT |

---

### `suppliers`
Vendor/supplier information.
- **Primary Key:** `id`
- **Foreign Key:** `user_id`
- **Indexes:** User, category

| Column | Type | Notes |
|--------|------|-------|
| name | VARCHAR(255) | Supplier name |
| category | VARCHAR(255) | e.g., "Food", "Equipment" |
| phone, email | VARCHAR/VARCHAR(255) | Contact details |
| rating | DECIMAL(3,2) | Quality rating (0-5) |

---

### `services`
Service/product catalog with pricing.
- **Primary Key:** `id`
- **Foreign Key:** `user_id`
- **Indexes:** User, category, status

| Column | Type | Notes |
|--------|------|-------|
| title | VARCHAR(255) | Service name |
| category | VARCHAR(100) | TENT, CATERING, BRANDING, GIFT, ENTERTAINMENT, GENERAL |
| selling_price | DECIMAL(12,2) | Retail price |
| cost_price | DECIMAL(12,2) | Wholesale/cost |
| profit | DECIMAL(12,2) | Generated as (selling_price - cost_price) |
| specifications | JSONB | e.g., `{"size": "6x12m", "color": "white"}` |
| includes | JSONB | Array of included items |
| image_url | TEXT | Product image |
| status | VARCHAR(50) | AVAILABLE or OUT_OF_STOCK |

---

## Procurement

### `purchase_orders` & `purchase_order_items`
Orders placed with suppliers.
- **Primary Key:** `purchase_orders.id`, `purchase_order_items.id`
- **Foreign Keys:** `purchase_orders.user_id`, `purchase_orders.supplier_id`
- **Indexes:** User, supplier, status

| Column | Type | Notes |
|--------|------|-------|
| po_number | VARCHAR(100) | Unique PO identifier |
| status | VARCHAR(50) | DRAFT, SENT, IN_TRANSIT, DELIVERED, PAID, CANCELLED |
| order_date | DATE | When PO was issued |
| expected_delivery_date | DATE | ETA |
| total_amount | DECIMAL(12,2) | Total cost |
| sent_at, delivered_at, paid_at | TIMESTAMP | Status transitions |

---

## Project Management

### `projects`
Projects tied to quotes and clients.
- **Primary Key:** `id`
- **Foreign Keys:** `user_id`, `client_id`, `quote_id`
- **Indexes:** User, client, status

| Column | Type | Notes |
|--------|------|-------|
| title | VARCHAR(255) | Project name |
| status | VARCHAR(50) | ACTIVE, PENDING, ON_HOLD, COMPLETED, CANCELLED |
| total_amount | DECIMAL(12,2) | Contract value |
| cost | DECIMAL(12,2) | Actual cost |
| profit | DECIMAL(12,2) | total_amount - cost |
| paul_share | DECIMAL(12,2) | Paul's commission |
| start_date, deadline | DATE | Timeline |
| priority | VARCHAR(50) | LOW, MEDIUM, HIGH, CRITICAL |

---

### `project_tasks` & `task_dependencies`
Individual tasks within a project with dependencies.
- **Primary Keys:** `project_tasks.id`
- **Foreign Keys:** `project_tasks.project_id`, `project_tasks.assigned_to`
- **Indexes:** Project, assigned to, status

| Column | Type | Notes |
|--------|------|-------|
| title | VARCHAR(255) | Task name |
| status | VARCHAR(50) | TODO, IN_PROGRESS, BLOCKED, COMPLETED |
| priority | VARCHAR(50) | LOW, MEDIUM, HIGH |
| assigned_to | UUID | FK to user_profiles |
| due_date | DATE | Task deadline |
| completed_at | TIMESTAMP | When task finished |

**task_dependencies** prevents circular dependencies with CHECK constraint.

---

## Audit & Backups

### `activity_logs`
Complete audit trail of user actions.
- **Primary Key:** `id`
- **Foreign Key:** `user_id`
- **Indexes:** User, created_at

| Column | Type | Notes |
|--------|------|-------|
| action | VARCHAR(255) | e.g., "quote_created", "transaction_categorized" |
| entity_type | VARCHAR(100) | e.g., "QUOTE", "TRANSACTION" |
| entity_id | UUID | ID of affected entity |
| changes | JSONB | Before/after diff |

---

### `data_exports`
Scheduled/on-demand data exports for backups.
- **Primary Key:** `id`
- **Foreign Key:** `user_id`
- **Indexes:** User

| Column | Type | Notes |
|--------|------|-------|
| export_type | VARCHAR(50) | FULL, FINANCIAL, QUOTES, PROJECTS |
| file_name | VARCHAR(255) | .json or .csv name |
| file_url | TEXT | Cloud storage URL |
| status | VARCHAR(50) | PENDING, PROCESSING, COMPLETED, FAILED |

---

## Row-Level Security (RLS)

**All tables have RLS enabled with user isolation policies:**
- Users can only access records where `user_id = auth.uid()`
- Child records (items, tasks) inherit parent user restrictions
- Enforced at the database level

---

## Applying the Migration

### Option 1: Supabase Dashboard
1. Go to **SQL Editor** in Supabase console
2. Create a new query
3. Copy-paste the contents of `supabase/migrations/001_init_schema.sql`
4. Click **Run**

### Option 2: Supabase CLI
```bash
supabase migration up
```

### Option 3: Direct PostgreSQL (if you have CLI access)
```bash
psql "postgresql://user:password@host:port/database" < supabase/migrations/001_init_schema.sql
```

---

## Environment Variables

Ensure these are set in `.env`:
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

---

## Next Steps

1. **Apply this migration** to your Supabase project
2. **Create CRUD helpers** in `src/lib/supabaseQueries.ts`
3. **Wire components** to read/write to these tables (Login, Dashboard, Quotes, etc.)
4. **Add real-time listeners** for live sync across tabs

---
