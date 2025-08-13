-- SECURITY HARDENING MIGRATION FOR PRODUCTS OWNERSHIP AND RLS
-- 1) Prerequisites
create extension if not exists pgcrypto;

-- 2) Add user_id ownership column and index
alter table public.products
  add column if not exists user_id uuid;

create index if not exists idx_products_user_id on public.products(user_id);

-- Ensure RLS is enabled
alter table public.products enable row level security;

-- 3) Roles infrastructure (admin override)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  END IF;
END$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique(user_id, role)
);

-- Lock down the table with RLS (function below bypasses via SECURITY DEFINER)
alter table public.user_roles enable row level security;

-- Optional minimal policy to allow users to view their own roles (not required for has_role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Users can read their own roles'
  ) THEN
    CREATE POLICY "Users can read their own roles" ON public.user_roles
    FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END$$;

-- 4) Function to check role (SECURITY DEFINER, strict search_path, schema-qualified)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;

-- 5) Trigger to auto-populate user_id on insert
create or replace function public.set_product_user_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_product_user_id'
  ) THEN
    DROP TRIGGER trg_set_product_user_id ON public.products;
  END IF;
END$$;

create trigger trg_set_product_user_id
before insert on public.products
for each row execute function public.set_product_user_id();

-- 6) Harden existing handle_new_user function (no trigger created here to avoid touching auth schema)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

-- 7) Replace permissive RLS policies on products with strict owner-based ones + admin override
DO $$
BEGIN
  -- Drop any existing permissive/default policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Allow authenticated users to read products') THEN
    DROP POLICY "Allow authenticated users to read products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Allow authenticated users to insert products') THEN
    DROP POLICY "Allow authenticated users to insert products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Allow authenticated users to update their products') THEN
    DROP POLICY "Allow authenticated users to update their products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Allow authenticated users to delete products') THEN
    DROP POLICY "Allow authenticated users to delete products" ON public.products;
  END IF;
  -- Drop any prior stricter policies if they exist to avoid duplicates
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Users can read their own products') THEN
    DROP POLICY "Users can read their own products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Users can insert their own products') THEN
    DROP POLICY "Users can insert their own products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Users can update their own products') THEN
    DROP POLICY "Users can update their own products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Users can delete their own products') THEN
    DROP POLICY "Users can delete their own products" ON public.products;
  END IF;
END$$;

-- New strict policies
CREATE POLICY "Users can read their own products" ON public.products
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own products" ON public.products
FOR INSERT TO authenticated
WITH CHECK ((user_id = auth.uid() OR user_id IS NULL) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own products" ON public.products
FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own products" ON public.products
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Note: We leave user_id nullable to avoid breaking existing data without known owners.
-- Existing rows with NULL user_id will not be visible to regular users after these policies.
