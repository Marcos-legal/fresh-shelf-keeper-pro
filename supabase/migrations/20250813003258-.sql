-- Fix attempt 3: correct policy expressions (remove NEW.*)
DO $$
BEGIN
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

CREATE POLICY "Users can read their own products" ON public.products
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own products" ON public.products
FOR INSERT TO authenticated
WITH CHECK ((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own products" ON public.products
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own products" ON public.products
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));