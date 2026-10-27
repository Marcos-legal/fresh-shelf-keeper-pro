DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['products','produtos_estoque','contagens_estoque','empresas','empresa_members','empresa_invites','product_events','profiles','subscriptions','user_roles','whatsapp_alerts_config','admin_audit_log'] LOOP
 EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
END LOOP; END $$;

DROP POLICY IF EXISTS "Products: empresa view" ON public.products;
DROP POLICY IF EXISTS "Products: empresa insert" ON public.products;
DROP POLICY IF EXISTS "Products: empresa update" ON public.products;
DROP POLICY IF EXISTS "Products: empresa delete" ON public.products;
CREATE POLICY "Products: empresa view" ON public.products FOR SELECT TO authenticated USING (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Products: empresa insert" ON public.products FOR INSERT TO authenticated WITH CHECK (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Products: empresa update" ON public.products FOR UPDATE TO authenticated USING (is_empresa_member(empresa_id, auth.uid())) WITH CHECK (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Products: empresa delete" ON public.products FOR DELETE TO authenticated USING (is_empresa_member(empresa_id, auth.uid()));

DROP POLICY IF EXISTS "Estoque: empresa view" ON public.produtos_estoque;
DROP POLICY IF EXISTS "Estoque: empresa insert" ON public.produtos_estoque;
DROP POLICY IF EXISTS "Estoque: empresa update" ON public.produtos_estoque;
DROP POLICY IF EXISTS "Estoque: empresa delete" ON public.produtos_estoque;
CREATE POLICY "Estoque: empresa view" ON public.produtos_estoque FOR SELECT TO authenticated USING (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Estoque: empresa insert" ON public.produtos_estoque FOR INSERT TO authenticated WITH CHECK (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Estoque: empresa update" ON public.produtos_estoque FOR UPDATE TO authenticated USING (is_empresa_member(empresa_id, auth.uid())) WITH CHECK (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Estoque: empresa delete" ON public.produtos_estoque FOR DELETE TO authenticated USING (is_empresa_member(empresa_id, auth.uid()));

DROP POLICY IF EXISTS "Contagens: empresa view" ON public.contagens_estoque;
DROP POLICY IF EXISTS "Contagens: empresa insert" ON public.contagens_estoque;
DROP POLICY IF EXISTS "Contagens: empresa update" ON public.contagens_estoque;
DROP POLICY IF EXISTS "Contagens: empresa delete" ON public.contagens_estoque;
CREATE POLICY "Contagens: empresa view" ON public.contagens_estoque FOR SELECT TO authenticated USING (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Contagens: empresa insert" ON public.contagens_estoque FOR INSERT TO authenticated WITH CHECK (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Contagens: empresa update" ON public.contagens_estoque FOR UPDATE TO authenticated USING (is_empresa_member(empresa_id, auth.uid())) WITH CHECK (is_empresa_member(empresa_id, auth.uid()));
CREATE POLICY "Contagens: empresa delete" ON public.contagens_estoque FOR DELETE TO authenticated USING (is_empresa_member(empresa_id, auth.uid()));

DROP POLICY IF EXISTS "Members: admins manage" ON public.empresa_members;
CREATE POLICY "Members: admins manage" ON public.empresa_members FOR INSERT TO authenticated WITH CHECK (
  is_empresa_admin(empresa_id, auth.uid())
  OR (user_id = auth.uid() AND role = 'owner'::empresa_role
      AND EXISTS (SELECT 1 FROM public.empresas e WHERE e.id = empresa_id AND e.owner_id = auth.uid())
      AND NOT EXISTS (SELECT 1 FROM public.empresa_members m WHERE m.empresa_id = empresa_members.empresa_id)));

DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON public.profiles;