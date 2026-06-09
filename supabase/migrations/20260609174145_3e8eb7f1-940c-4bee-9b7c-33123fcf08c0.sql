
DO $$ BEGIN
  CREATE TYPE public.empresa_role AS ENUM ('owner', 'admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT 'Minha Empresa',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresas TO authenticated;
GRANT ALL ON public.empresas TO service_role;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.empresa_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.empresa_role NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresa_members TO authenticated;
GRANT ALL ON public.empresa_members TO service_role;
ALTER TABLE public.empresa_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_empresa_members_user ON public.empresa_members(user_id);
CREATE INDEX IF NOT EXISTS idx_empresa_members_empresa ON public.empresa_members(empresa_id);

CREATE OR REPLACE FUNCTION public.is_empresa_member(_empresa uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.empresa_members WHERE empresa_id = _empresa AND user_id = _user);
$$;
CREATE OR REPLACE FUNCTION public.is_empresa_admin(_empresa uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.empresa_members WHERE empresa_id = _empresa AND user_id = _user AND role IN ('owner','admin'));
$$;
CREATE OR REPLACE FUNCTION public.get_empresa_ativa(_user uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT empresa_id FROM public.empresa_members WHERE user_id = _user
  ORDER BY (role = 'owner') DESC, created_at ASC LIMIT 1;
$$;

DROP POLICY IF EXISTS "Empresas: members can view" ON public.empresas;
CREATE POLICY "Empresas: members can view" ON public.empresas FOR SELECT TO authenticated USING (public.is_empresa_member(id, auth.uid()));
DROP POLICY IF EXISTS "Empresas: authenticated can create" ON public.empresas;
CREATE POLICY "Empresas: authenticated can create" ON public.empresas FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Empresas: owner can update" ON public.empresas;
CREATE POLICY "Empresas: owner can update" ON public.empresas FOR UPDATE TO authenticated USING (public.is_empresa_admin(id, auth.uid())) WITH CHECK (public.is_empresa_admin(id, auth.uid()));
DROP POLICY IF EXISTS "Empresas: owner can delete" ON public.empresas;
CREATE POLICY "Empresas: owner can delete" ON public.empresas FOR DELETE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Members: view own memberships" ON public.empresa_members;
CREATE POLICY "Members: view own memberships" ON public.empresa_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_empresa_admin(empresa_id, auth.uid()));
DROP POLICY IF EXISTS "Members: admins manage" ON public.empresa_members;
CREATE POLICY "Members: admins manage" ON public.empresa_members FOR INSERT TO authenticated WITH CHECK (public.is_empresa_admin(empresa_id, auth.uid()) OR (user_id = auth.uid() AND role = 'owner'));
DROP POLICY IF EXISTS "Members: admins update" ON public.empresa_members;
CREATE POLICY "Members: admins update" ON public.empresa_members FOR UPDATE TO authenticated USING (public.is_empresa_admin(empresa_id, auth.uid())) WITH CHECK (public.is_empresa_admin(empresa_id, auth.uid()));
DROP POLICY IF EXISTS "Members: admins delete" ON public.empresa_members;
CREATE POLICY "Members: admins delete" ON public.empresa_members FOR DELETE TO authenticated USING (public.is_empresa_admin(empresa_id, auth.uid()) OR user_id = auth.uid());

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.produtos_estoque ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.contagens_estoque ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL;

-- Limpeza de órfãos (dono já não existe)
DELETE FROM public.products WHERE user_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = user_id);
DELETE FROM public.produtos_estoque WHERE user_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = user_id);
DELETE FROM public.contagens_estoque WHERE user_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = user_id);

SET session_replication_role = 'replica';
DO $$
DECLARE rec record; new_empresa_id uuid;
BEGIN
  FOR rec IN SELECT DISTINCT u.id AS user_id FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.empresa_members m WHERE m.user_id = u.id)
  LOOP
    INSERT INTO public.empresas (nome, owner_id) VALUES ('Minha Empresa', rec.user_id) RETURNING id INTO new_empresa_id;
    INSERT INTO public.empresa_members (empresa_id, user_id, role) VALUES (new_empresa_id, rec.user_id, 'owner');
    UPDATE public.products SET empresa_id = new_empresa_id WHERE user_id = rec.user_id AND empresa_id IS NULL;
    UPDATE public.produtos_estoque SET empresa_id = new_empresa_id WHERE user_id = rec.user_id AND empresa_id IS NULL;
    UPDATE public.contagens_estoque SET empresa_id = new_empresa_id WHERE user_id = rec.user_id AND empresa_id IS NULL;
    UPDATE public.subscriptions SET empresa_id = new_empresa_id WHERE user_id = rec.user_id AND empresa_id IS NULL;
  END LOOP;
END $$;
SET session_replication_role = 'origin';

ALTER TABLE public.products ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.produtos_estoque ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.contagens_estoque ALTER COLUMN empresa_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_empresa ON public.products(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_empresa ON public.produtos_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contagens_estoque_empresa ON public.contagens_estoque(empresa_id);

DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can read their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
CREATE POLICY "Products: empresa view" ON public.products FOR SELECT TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Products: empresa insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Products: empresa update" ON public.products FOR UPDATE TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Products: empresa delete" ON public.products FOR DELETE TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can create their own stock products" ON public.produtos_estoque;
DROP POLICY IF EXISTS "Users can delete their own stock products" ON public.produtos_estoque;
DROP POLICY IF EXISTS "Users can update their own stock products" ON public.produtos_estoque;
DROP POLICY IF EXISTS "Users can view their own stock products" ON public.produtos_estoque;
CREATE POLICY "Estoque: empresa view" ON public.produtos_estoque FOR SELECT TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Estoque: empresa insert" ON public.produtos_estoque FOR INSERT TO authenticated WITH CHECK (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Estoque: empresa update" ON public.produtos_estoque FOR UPDATE TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Estoque: empresa delete" ON public.produtos_estoque FOR DELETE TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can create their own stock counts" ON public.contagens_estoque;
DROP POLICY IF EXISTS "Users can delete their own stock counts" ON public.contagens_estoque;
DROP POLICY IF EXISTS "Users can update their own stock counts" ON public.contagens_estoque;
DROP POLICY IF EXISTS "Users can view their own stock counts" ON public.contagens_estoque;
CREATE POLICY "Contagens: empresa view" ON public.contagens_estoque FOR SELECT TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Contagens: empresa insert" ON public.contagens_estoque FOR INSERT TO authenticated WITH CHECK (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Contagens: empresa update" ON public.contagens_estoque FOR UPDATE TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Contagens: empresa delete" ON public.contagens_estoque FOR DELETE TO authenticated USING (public.is_empresa_member(empresa_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.set_empresa_id_default()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.empresa_id IS NULL THEN NEW.empresa_id := public.get_empresa_ativa(auth.uid()); END IF;
  IF NEW.user_id IS NULL THEN NEW.user_id := auth.uid(); END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_empresa_products ON public.products;
CREATE TRIGGER trg_set_empresa_products BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_default();
DROP TRIGGER IF EXISTS trg_set_empresa_produtos_estoque ON public.produtos_estoque;
CREATE TRIGGER trg_set_empresa_produtos_estoque BEFORE INSERT ON public.produtos_estoque FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_default();
DROP TRIGGER IF EXISTS trg_set_empresa_contagens_estoque ON public.contagens_estoque;
CREATE TRIGGER trg_set_empresa_contagens_estoque BEFORE INSERT ON public.contagens_estoque FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_default();

CREATE OR REPLACE FUNCTION public.handle_new_user_empresa()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_empresa_id uuid;
BEGIN
  INSERT INTO public.empresas (nome, owner_id) VALUES ('Minha Empresa', NEW.id) RETURNING id INTO new_empresa_id;
  INSERT INTO public.empresa_members (empresa_id, user_id, role) VALUES (new_empresa_id, NEW.id, 'owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_empresa ON auth.users;
CREATE TRIGGER on_auth_user_created_empresa AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_empresa();

DROP TRIGGER IF EXISTS trg_empresas_updated_at ON public.empresas;
CREATE TRIGGER trg_empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
