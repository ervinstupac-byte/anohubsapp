-- NC-12.1 Active Learning Ledger
-- Table to store operator veto reasons and feedback for AI training

create table if not exists public.operator_feedback (
    id uuid default gen_random_uuid() primary key,
    action_id text not null, -- ID of the Sovereign Decision (could be timestamp or uuid)
    reason text not null,    -- "Manual inspection", "Sensor drift", etc.
    timestamp timestamptz default now() not null,
    operator_id uuid references auth.users(id), -- Nullable if anonymous for now
    context jsonb            -- Snapshot of the state when vetoed
);

-- RLS Policies
alter table public.operator_feedback enable row level security;

create policy "Allow authenticated insert"
on public.operator_feedback for insert
to authenticated
with check (true);

create policy "Allow read for analytics"
on public.operator_feedback for select
to authenticated
using (true);
