-- ============================================================================
-- Migration 003: add an 'admin' role.
--
-- Run this in the SQL Editor of a Supabase project that already has
-- supabase/schema.sql (+ migrations 002) applied.
--
-- Admins are provisioned out-of-band, not through public signup:
--   1. Have the intended admin sign up normally at /signup (as a delivery
--      company — the role doesn't matter, it gets overwritten below).
--   2. Run: update public.profiles set role = 'admin' where id =
--      (select id from auth.users where email = 'THEIR_EMAIL');
-- From then on they can invite assembly companies from /admin.
-- ============================================================================

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('assembly', 'delivery', 'admin'));
