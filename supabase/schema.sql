create extension if not exists pgcrypto;

create table if not exists public.public_audits (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  summary text not null,
  public_result jsonb not null,
  total_monthly_savings numeric not null default 0,
  total_annual_savings numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text not null,
  role text not null,
  team_size integer not null check (team_size > 0),
  audit_result jsonb not null,
  public_audit_id uuid references public.public_audits(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists public_audits_share_id_idx on public.public_audits (share_id);
create index if not exists audit_leads_email_idx on public.audit_leads (email);
create index if not exists audit_leads_created_at_idx on public.audit_leads (created_at desc);

alter table public.public_audits enable row level security;
alter table public.audit_leads enable row level security;

drop policy if exists "Public audits are readable by anyone" on public.public_audits;
create policy "Public audits are readable by anyone"
on public.public_audits
for select
to anon, authenticated
using (true);

drop policy if exists "Leads remain private" on public.audit_leads;
create policy "Leads remain private"
on public.audit_leads
for select
to authenticated
using (false);

revoke all on table public.audit_leads from anon, authenticated;
grant select on table public.public_audits to anon, authenticated;
