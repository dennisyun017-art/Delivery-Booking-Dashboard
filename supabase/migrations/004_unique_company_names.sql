-- ============================================================================
-- Migration 004: prevent duplicate/near-duplicate company names.
--
-- Adds a generated, normalized column (whitespace collapsed, "(주)"/"㈜"/
-- "주식회사" stripped, lowercased) with a unique index on it, across both
-- assembly and delivery companies. "현대모비스", "현대 모비스", and
-- "현대모비스(주)" all normalize to the same key and can't coexist.
--
-- Run this in the SQL Editor of a Supabase project that already has
-- supabase/schema.sql applied.
-- ============================================================================

alter table public.profiles
  add column if not exists company_name_key text
  generated always as (
    lower(regexp_replace(regexp_replace(company_name, '\(주\)|㈜|주식회사', '', 'g'), '\s+', '', 'g'))
  ) stored;

-- If existing rows already collide once normalized, this fails — resolve
-- the duplicates manually (e.g. via the new /admin/companies rename tool)
-- before re-running.
create unique index if not exists profiles_company_name_key_idx
  on public.profiles (company_name_key);
