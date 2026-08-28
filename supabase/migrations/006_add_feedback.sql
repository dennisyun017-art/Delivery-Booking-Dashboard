-- ============================================================================
-- Migration 006: feedback/support tickets (문의·오류 신고)
--
-- Any authenticated company can file feedback with an optional screenshot;
-- the admin reviews, replies, and sets a status from /admin/feedback.
-- Uploads and admin replies always go through the service-role client
-- server-side, so there's no need for storage RLS policies or an
-- "admin can update" policy here — see src/app/admin/feedback-actions.ts
-- and src/app/feedback/actions.ts.
-- ============================================================================

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  image_path text,
  status text not null default 'open' check (status in ('open', 'answered', 'resolved')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create index feedback_reporter_idx on public.feedback (reporter_id, created_at desc);

create policy "reporters can view their own feedback"
  on public.feedback for select
  to authenticated
  using (reporter_id = auth.uid());

create policy "authenticated users can file feedback"
  on public.feedback for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- Private bucket for attached screenshots/photos. Nobody reads/writes it
-- directly from the browser — the server always uploads and signs URLs
-- via the service-role client, so no storage.objects policies are needed.
insert into storage.buckets (id, name, public)
values ('feedback', 'feedback', false)
on conflict (id) do nothing;
