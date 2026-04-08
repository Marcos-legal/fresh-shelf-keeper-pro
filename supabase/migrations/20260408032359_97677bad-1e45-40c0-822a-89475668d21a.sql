
-- Fix products INSERT policy: change from public to authenticated
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
CREATE POLICY "Users can insert their own products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix produtos_estoque INSERT policy: change from public to authenticated
DROP POLICY IF EXISTS "Users can create their own stock products" ON public.produtos_estoque;
CREATE POLICY "Users can create their own stock products"
  ON public.produtos_estoque
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix contagens_estoque INSERT policy: change from public to authenticated
DROP POLICY IF EXISTS "Users can create their own stock counts" ON public.contagens_estoque;
CREATE POLICY "Users can create their own stock counts"
  ON public.contagens_estoque
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix remaining SELECT/UPDATE/DELETE policies on contagens_estoque and produtos_estoque to use authenticated
DROP POLICY IF EXISTS "Users can view their own stock counts" ON public.contagens_estoque;
CREATE POLICY "Users can view their own stock counts"
  ON public.contagens_estoque FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update their own stock counts" ON public.contagens_estoque;
CREATE POLICY "Users can update their own stock counts"
  ON public.contagens_estoque FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can delete their own stock counts" ON public.contagens_estoque;
CREATE POLICY "Users can delete their own stock counts"
  ON public.contagens_estoque FOR DELETE TO authenticated
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their own stock products" ON public.produtos_estoque;
CREATE POLICY "Users can view their own stock products"
  ON public.produtos_estoque FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update their own stock products" ON public.produtos_estoque;
CREATE POLICY "Users can update their own stock products"
  ON public.produtos_estoque FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can delete their own stock products" ON public.produtos_estoque;
CREATE POLICY "Users can delete their own stock products"
  ON public.produtos_estoque FOR DELETE TO authenticated
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
