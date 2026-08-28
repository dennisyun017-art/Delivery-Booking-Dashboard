-- ============================================================================
-- Migration 007: 납품 BP사 -> Assembly BP사 "요청 사항" (간단한 요청 메모).
-- 비고(note)와 별개로, assembly BP사에게 직접 전달하고 싶은 요청을 적는 용도.
-- ============================================================================

alter table public.deliveries add column if not exists request_note text;

-- Re-create the update guard so assembly companies can't edit this new
-- column either (they may only approve/reject) — mirrors the existing
-- lot_no/wo_no/note/contact_phone protection.
create or replace function public.deliveries_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role text;
begin
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
    new.status := 'pending';
    new.reject_reason := null;
    new.decided_by := null;
    new.decided_at := null;
    new.revision := old.revision + 1;

  elsif acting_role = 'assembly' then
    if new.requested_at is distinct from old.requested_at
       or new.note is distinct from old.note
       or new.request_note is distinct from old.request_note
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
