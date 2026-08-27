-- ============================================================================
-- Migration 002: add lot_no / wo_no (required) and contact_phone (optional)
-- to deliveries.
--
-- Run this in the SQL Editor of a Supabase project that already has
-- supabase/schema.sql applied. Safe to run once.
-- ============================================================================

-- Existing rows have no LOT/W-O on file yet, so add the columns nullable
-- first and backfill before enforcing NOT NULL — otherwise this fails
-- immediately on any table that already has rows.
alter table public.deliveries add column if not exists lot_no text;
alter table public.deliveries add column if not exists wo_no text;
alter table public.deliveries add column if not exists contact_phone text;

update public.deliveries set lot_no = '(미입력)' where lot_no is null;
update public.deliveries set wo_no = '(미입력)' where wo_no is null;

alter table public.deliveries alter column lot_no set not null;
alter table public.deliveries alter column wo_no set not null;

-- Re-create the insert/update guard triggers so they validate and protect
-- the new columns too (mirrors the current supabase/schema.sql).
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

create or replace function public.deliveries_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role text;
begin
  select role into acting_role from public.profiles where id = auth.uid();

  if acting_role = 'delivery' then
    if old.status is distinct from 'rejected' then
      raise exception 'delivery companies may only resubmit a rejected booking';
    end if;
    if new.assembly_company_id is distinct from old.assembly_company_id
       or new.delivery_company_id is distinct from old.delivery_company_id then
      raise exception 'delivery companies may not reassign a booking';
    end if;
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
