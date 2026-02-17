-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- ============================================================================
-- PHASE 2 SCHEMA: MAINTENANCE & OPERATIONS
-- ============================================================================

-- 1. WORK ORDERS
create table if not exists work_orders (
  id uuid default uuid_generate_v4() primary key,
  asset_id bigint, -- References assets(id)
  asset_name text,
  component text,
  description text,
  priority text check (priority in ('HIGH', 'MEDIUM', 'LOW')),
  status text default 'PENDING' check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  trigger_source text check (trigger_source in ('MANUAL', 'AI_PREDICTION', 'SERVICE_ALERT')),
  assigned_technician text,
  estimated_hours numeric,
  completion_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 2. MAINTENANCE LOGS (Technician Actions)
create table if not exists maintenance_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id text,
  technician text,
  action text,
  comment_bs text,
  summary_de text,
  measured_value numeric,
  pass boolean,
  proof_image_url text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INVENTORY ASSETS (Spare Parts)
create table if not exists inventory_assets (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  part_number text,
  category text,
  quantity numeric default 0,
  min_stock_threshold numeric default 0,
  unit_price numeric,
  turbine_types text[], -- Array of applicable turbine types
  maintenance_specs jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. AUDIT LOGS (Sovereign Audit System)
create table if not exists audit_logs (
  id uuid default uuid_generate_v4() primary key,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  operator_id text,
  action text,
  target text,
  status text check (status in ('SUCCESS', 'FAILURE')),
  details jsonb default '{}'::jsonb
);

-- 5. HPP STATUS (Real-time Snapshot)
create table if not exists hpp_status (
  id uuid default uuid_generate_v4() primary key,
  asset_id bigint, -- References assets(id)
  status text default 'OPTIMAL',
  payload jsonb default '{}'::jsonb, -- Stores vibration, temp, efficiency snapshots
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TELEMETRY LOGS (Aggregates & Faults ONLY)
-- Note: Raw 10Hz data is kept in-memory (CircularBuffer). This table is for persistent events.
create table if not exists telemetry_logs (
  id uuid default uuid_generate_v4() primary key,
  asset_id bigint, -- References assets(id)
  event_type text, -- 'FAULT', 'AGGREGATE_HOURLY', 'USER_ACTION'
  severity text check (severity in ('CRITICAL', 'WARNING', 'INFO')),
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. EXPERT KNOWLEDGE BASE (AI Diagnostics)
create table if not exists expert_knowledge_base (
  id uuid default uuid_generate_v4() primary key,
  symptom_key text, -- e.g., 'high_vibration_bearing_x'
  diagnosis text,
  recommended_action text,
  confidence_score numeric default 0.8,
  asset_type text, -- 'FRANCIS', 'PELTON', 'KAPLAN'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- RLS POLICIES (PUBLIC ACCESS FOR DEMO)
-- ============================================================================

-- Enable RLS on all tables
alter table work_orders enable row level security;
alter table maintenance_logs enable row level security;
alter table inventory_assets enable row level security;
alter table audit_logs enable row level security;
alter table hpp_status enable row level security;
alter table telemetry_logs enable row level security;
alter table expert_knowledge_base enable row level security;

-- Create PUBLIC read/write policies for all tables

-- Work Orders
create policy "Enable read access for all users" on work_orders for select using (true);
create policy "Enable insert access for all users" on work_orders for insert with check (true);
create policy "Enable update access for all users" on work_orders for update using (true);

-- Maintenance Logs
create policy "Enable read access for all users" on maintenance_logs for select using (true);
create policy "Enable insert access for all users" on maintenance_logs for insert with check (true);
create policy "Enable update access for all users" on maintenance_logs for update using (true);

-- Inventory Assets
create policy "Enable read access for all users" on inventory_assets for select using (true);
create policy "Enable insert access for all users" on inventory_assets for insert with check (true);
create policy "Enable update access for all users" on inventory_assets for update using (true);

-- Audit Logs
create policy "Enable read access for all users" on audit_logs for select using (true);
create policy "Enable insert access for all users" on audit_logs for insert with check (true);
create policy "Enable update access for all users" on audit_logs for update using (true);

-- HPP Status
create policy "Enable read access for all users" on hpp_status for select using (true);
create policy "Enable insert access for all users" on hpp_status for insert with check (true);
create policy "Enable update access for all users" on hpp_status for update using (true);

-- Telemetry Logs
create policy "Enable read access for all users" on telemetry_logs for select using (true);
create policy "Enable insert access for all users" on telemetry_logs for insert with check (true);
create policy "Enable update access for all users" on telemetry_logs for update using (true);

-- Expert Knowledge Base
create policy "Enable read access for all users" on expert_knowledge_base for select using (true);
create policy "Enable insert access for all users" on expert_knowledge_base for insert with check (true);
create policy "Enable update access for all users" on expert_knowledge_base for update using (true);
