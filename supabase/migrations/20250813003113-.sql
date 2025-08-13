-- 1) Add user_id column and backfill safely
-- Create a safe extension if needed for gen_random_uuid (already available usually)
-- Add user_id column nullable first to avoid failing existing inserts
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill: for existing rows with null user_id, set to a placeholder uuid that doesn't match any real user
-- This prevents accidental exposure across users, but keeps data queryable by admins later.
-- We'll also create an admin role gate via a function.
UPDATE public.products
SET user_id = COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid)
WHERE user_id IS NULL;

-- 2) Create a function to default user_id on insert from auth.uid()
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

-- 3) Attach trigger to set user_id before insert
DROP TRIGGER IF EXISTS trg_set_product_user_id ON public.products;
CREATE TRIGGER trg_set_product_user_id
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_user_id();

-- 4) Optional admin role infra for future-proofing (no recursion): enum + table + helper fn only if not exists
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

-- 5) Harden RLS on products: replace permissive policies with owner-based access + admin override
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing overly-permissive policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Allow authenticated users to read products') THEN
    DROP POLICY "Allow authenticated users to read products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Allow authenticated users to insert products') THEN
    DROP POLICY "Allow authenticated users to insert products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Allow authenticated users to update their products') THEN
    DROP POLICY "Allow authenticated users to update their products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Allow authenticated users to delete products') THEN
    DROP POLICY "Allow authenticated users to delete products" ON public.products;
  END IF;
END$$;

-- Owner can read their products; admins can read all
CREATE POLICY "Users can read their own products" ON public.products
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Owner can insert (user_id auto-set via trigger) and admins can insert
CREATE POLICY "Users can insert their own products" ON public.products
FOR INSERT TO authenticated
WITH CHECK ((NEW.user_id = auth.uid() OR NEW.user_id IS NULL) OR public.has_role(auth.uid(), 'admin'));

-- Owner can update; admins can update all
CREATE POLICY "Users can update their own products" ON public.products
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Owner can delete; admins can delete all
CREATE POLICY "Users can delete their own products" ON public.products
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 6) Helpful index for filtering by owner
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
