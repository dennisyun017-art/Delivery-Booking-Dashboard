-- ============================================================================
-- 납품 시간 예약 대시보드 — Supabase schema
--
-- Run this once in the Supabase project's SQL Editor (Dashboard > SQL Editor).
-- Safe to re-run only after dropping the objects it creates.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: one row per company account (assembly BP or delivery BP)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_name text not null,
  -- 'admin' accounts are never created through public signup — see
  -- supabase/migrations/003_add_admin_role.sql for how to bootstrap one.
  role text not null check (role in ('assembly', 'delivery', 'admin')),
  phone text,
  -- Only meaningful for role = 'assembly'. How close together (in minutes)
  -- two deliveries to this company have to be before the dashboard flags
  -- them as a scheduling conflict. Each assembly company can tune its own.
  conflict_buffer_minutes int not null default 15,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Company names/roles are needed for dropdowns and name lookups across
-- companies, so any authenticated partner can read the (non-sensitive)
-- directory. Login emails live in auth.users and are never exposed here.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- deliveries: one row per delivery booking
-- ----------------------------------------------------------------------------
create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_company_id uuid not null references public.profiles (id),
  assembly_company_id uuid not null references public.profiles (id),
  requested_at timestamptz not null,
  lot_no text not null,
  wo_no text not null,
  contact_phone text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  revision int not null default 0,
  decided_by uuid references public.profiles (id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.deliveries enable row level security;

create index deliveries_assembly_idx on public.deliveries (assembly_company_id, requested_at);
create index deliveries_delivery_idx on public.deliveries (delivery_company_id, requested_at);

create policy "delivery company can view its own bookings"
  on public.deliveries for select
  to authenticated
  using (delivery_company_id = auth.uid());

create policy "delivery company can create bookings"
  on public.deliveries for insert
  to authenticated
  with check (delivery_company_id = auth.uid());

create policy "delivery company can edit its own bookings"
  on public.deliveries for update
  to authenticated
  using (delivery_company_id = auth.uid())
  with check (delivery_company_id = auth.uid());

create policy "assembly company can view bookings addressed to it"
  on public.deliveries for select
  to authenticated
  using (assembly_company_id = auth.uid());

create policy "assembly company can decide bookings addressed to it"
  on public.deliveries for update
  to authenticated
  using (assembly_company_id = auth.uid())
  with check (assembly_company_id = auth.uid());

-- The two UPDATE policies above only gate *row ownership*; Postgres RLS
-- can't restrict *which columns* a policy allows changing. The trigger
-- below is the real enforcement of "delivery companies can only edit
-- their own rejected bookings" and "assembly companies can only
-- approve/reject" — without it, an update statement issued directly
-- against the REST API (not just this app's UI) could bypass the intended
-- workflow.

create or replace function public.deliveries_guard_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role text;
  target_role text;
begin
  -- No authenticated user (e.g. run from the SQL Editor or another admin
  -- connection, not through the app) — skip the app-role guard entirely.
  if auth.uid() is null then
    return new;
  end if;

  select role into acting_role from public.profiles where id = auth.uid();
  if acting_role is distinct from 'delivery' then
    raise exception 'only delivery companies can create delivery bookings';
  end if;

  select role into target_role from public.profiles where id = new.assembly_company_id;
  if target_role is distinct from 'assembly' then
    raise exception 'assembly_company_id must reference an assembly company';
  end if;

  if btrim(coalesce(new.lot_no, '')) = '' then
    raise exception 'lot_no is required';
  end if;
  if btrim(coalesce(new.wo_no, '')) = '' then
    raise exception 'wo_no is required';
  end if;

  new.delivery_company_id := auth.uid();
  new.status := 'pending';
  new.revision := 0;
  new.reject_reason := null;
  new.decided_by := null;
  new.decided_at := null;
  return new;
end;
$$;

create trigger deliveries_guard_insert_trigger
  before insert on public.deliveries
  for each row execute function public.deliveries_guard_insert();

create or replace function public.deliveries_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role text;
begin
  -- No authenticated user (e.g. run from the SQL Editor or another admin
  -- connection, not through the app) — skip the app-role guard entirely.
  if auth.uid() is null then
    new.updated_at := now();
    return new;
  end if;

  select role into acting_role from public.profiles where id = auth.uid();

  if acting_role = 'delivery' then
    if old.status is distinct from 'rejected' then
      raise exception 'delivery companies may only resubmit a rejected booking';
    end if;
    if new.assembly_company_id is distinct from old.assembly_company_id
       or new.delivery_company_id is distinct from old.delivery_company_id then
      raise exception 'delivery companies may not reassign a booking';
    end if;
    -- resubmitting always resets the booking back to pending for review
    new.status := 'pending';
    new.reject_reason := null;
    new.decided_by := null;
    new.decided_at := null;
    new.revision := old.revision + 1;

  elsif acting_role = 'assembly' then
    if new.requested_at is distinct from old.requested_at
       or new.note is distinct from old.note
       or new.lot_no is distinct from old.lot_no
       or new.wo_no is distinct from old.wo_no
       or new.contact_phone is distinct from old.contact_phone
       or new.delivery_company_id is distinct from old.delivery_company_id then
      raise exception 'assembly companies may only approve or reject, not edit booking details';
    end if;
    if new.status not in ('approved', 'rejected') then
      raise exception 'assembly companies may only set status to approved or rejected';
    end if;
    new.decided_by := auth.uid();
    new.decided_at := now();

  else
    raise exception 'unrecognized role for update';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger deliveries_guard_update_trigger
  before update on public.deliveries
  for each row execute function public.deliveries_guard_update();
