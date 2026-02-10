-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. MAINTENANCE LOGS
create table maintenance_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id text not null,
  technician text not null,
  comment_bs text,
  summary_de text,
  measured_value numeric,
  pass boolean default false,
  timestamp timestamptz default now(),
  proof_image_url text, -- Store URL if using Storage, or base64 (not recommended for prod but ok for prototype)
  metadata jsonb
);

-- 2. WORK ORDERS
create table work_orders (
  id uuid default uuid_generate_v4() primary key,
  asset_id text not null,
  asset_name text not null,
  component text not null,
  description text not null,
  priority text check (priority in ('HIGH', 'MEDIUM', 'LOW')),
  status text check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) default 'PENDING',
  trigger_source text, -- MANUAL, AI_PREDICTION, SERVICE_ALERT
  assigned_technician text,
  estimated_hours numeric,
  completion_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- 3. RLS POLICIES (Optional: Open for now for ease of prototype)
alter table maintenance_logs enable row level security;
alter table work_orders enable row level security;

create policy "Enable all access for all users" on maintenance_logs
  for all using (true) with check (true);

create policy "Enable all access for all users" on work_orders
  for all using (true) with check (true);
