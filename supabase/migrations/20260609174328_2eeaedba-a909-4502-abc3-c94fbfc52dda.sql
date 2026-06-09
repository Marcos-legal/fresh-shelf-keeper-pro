
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preco_custo numeric(10,2);

DO $$ BEGIN
  CREATE TYPE public.product_event_type AS ENUM ('consumido', 'descartado', 'vencido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.product_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public.products(id) ON DELETE SET NULL,
  product_nome text,
  product_lote text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo public.product_event_type NOT NULL,
  motivo text,
  custo_snapshot numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_events TO authenticated;
GRANT ALL ON public.product_events TO service_role;
ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_product_events_empresa ON public.product_events(empresa_id);
CREATE INDEX IF NOT EXISTS idx_product_events_created ON public.product_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_events_tipo ON public.product_events(tipo);

DROP POLICY IF EXISTS "Events: empresa view" ON public.product_events;
CREATE POLICY "Events: empresa view" ON public.product_events FOR SELECT TO authenticated
USING (public.is_empresa_member(empresa_id, auth.uid()));
DROP POLICY IF EXISTS "Events: empresa insert" ON public.product_events;
CREATE POLICY "Events: empresa insert" ON public.product_events FOR INSERT TO authenticated
WITH CHECK (public.is_empresa_member(empresa_id, auth.uid()));
DROP POLICY IF EXISTS "Events: admin delete" ON public.product_events;
CREATE POLICY "Events: admin delete" ON public.product_events FOR DELETE TO authenticated
USING (public.is_empresa_admin(empresa_id, auth.uid()));

DROP TRIGGER IF EXISTS trg_set_empresa_product_events ON public.product_events;
CREATE TRIGGER trg_set_empresa_product_events BEFORE INSERT ON public.product_events
FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_default();

CREATE TABLE IF NOT EXISTS public.whatsapp_alerts_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL UNIQUE REFERENCES public.empresas(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  phone_e164 text,
  from_number text,
  daily_hour smallint NOT NULL DEFAULT 8 CHECK (daily_hour BETWEEN 0 AND 23),
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_alerts_config TO authenticated;
GRANT ALL ON public.whatsapp_alerts_config TO service_role;
ALTER TABLE public.whatsapp_alerts_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Wpp: empresa view" ON public.whatsapp_alerts_config;
CREATE POLICY "Wpp: empresa view" ON public.whatsapp_alerts_config FOR SELECT TO authenticated
USING (public.is_empresa_member(empresa_id, auth.uid()));
DROP POLICY IF EXISTS "Wpp: admin upsert" ON public.whatsapp_alerts_config;
CREATE POLICY "Wpp: admin upsert" ON public.whatsapp_alerts_config FOR INSERT TO authenticated
WITH CHECK (public.is_empresa_admin(empresa_id, auth.uid()));
DROP POLICY IF EXISTS "Wpp: admin update" ON public.whatsapp_alerts_config;
CREATE POLICY "Wpp: admin update" ON public.whatsapp_alerts_config FOR UPDATE TO authenticated
USING (public.is_empresa_admin(empresa_id, auth.uid()))
WITH CHECK (public.is_empresa_admin(empresa_id, auth.uid()));
DROP POLICY IF EXISTS "Wpp: admin delete" ON public.whatsapp_alerts_config;
CREATE POLICY "Wpp: admin delete" ON public.whatsapp_alerts_config FOR DELETE TO authenticated
USING (public.is_empresa_admin(empresa_id, auth.uid()));

DROP TRIGGER IF EXISTS trg_whatsapp_alerts_updated_at ON public.whatsapp_alerts_config;
CREATE TRIGGER trg_whatsapp_alerts_updated_at BEFORE UPDATE ON public.whatsapp_alerts_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
