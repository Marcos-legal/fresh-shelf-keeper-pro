-- Fix attempt 2: secure ownership RLS for products

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Add user_id and backfill
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS user_id uuid;

UPDATE public.products
SET user_id = COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid)
WHERE user_id IS NULL;

-- 2) Trigger to set user_id from auth.uid()
CREATE OR REPLACE FUNCTION public.set_product_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_product_user_id ON public.products;
CREATE TRIGGER trg_set_product_user_id
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_user_id();

-- 3) Admin role infra (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- 4) RLS: replace permissive policies with owner-based
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', pol);
  END LOOP;
END$$;

CREATE POLICY "Users can read their own products" ON public.products
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own products" ON public.products
FOR INSERT TO authenticated
WITH CHECK ((NEW.user_id = auth.uid() OR NEW.user_id IS NULL) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own products" ON public.products
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own products" ON public.products
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 5) Index + NOT NULL
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

ALTER TABLE public.products
  ALTER COLUMN user_id SET NOT NULL;