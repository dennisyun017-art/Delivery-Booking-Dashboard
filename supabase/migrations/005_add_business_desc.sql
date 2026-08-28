-- ============================================================================
-- Migration 005: add an optional business description to profiles
-- (e.g. "가공", "판금") shown next to the company name so the other side
-- can tell at a glance what a company does.
-- ============================================================================

alter table public.profiles add column if not exists business_desc text;
