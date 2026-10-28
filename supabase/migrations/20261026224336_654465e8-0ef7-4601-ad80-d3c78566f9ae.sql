CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit: admins view" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Allow subscription writes from trusted roles (service_role webhook, security definer admin functions)
CREATE OR REPLACE FUNCTION public.prevent_subscription_manipulation()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public' AS $$
BEGIN
  IF current_user IN ('postgres','service_role','supabase_admin') THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Subscription manipulation is not allowed from client';
END; $$;

-- Close owner self-assignment gap
DROP POLICY IF EXISTS "Members: admins manage" ON public.empresa_members;
CREATE POLICY "Members: admins manage" ON public.empresa_members FOR INSERT TO authenticated
WITH CHECK (public.is_empresa_admin(empresa_id, auth.uid()) OR (user_id = auth.uid() AND role = 'owner'::empresa_role AND EXISTS (SELECT 1 FROM public.empresas e WHERE e.id = empresa_id AND e.owner_id = auth.uid())));

CREATE OR REPLACE FUNCTION public.admin_assert() RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso restrito ao administrador'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.sub_effective_status(_status text, _trial_end timestamptz, _period_end timestamptz)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN _status = 'trialing' AND _trial_end < now() THEN 'expired'
    WHEN _status = 'active' AND _period_end IS NOT NULL AND _period_end < now() THEN 'past_due'
    ELSE _status END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT auth.uid() IS NOT NULL AND public.has_role(auth.uid(),'admin');
$$;

CREATE OR REPLACE FUNCTION public.admin_overview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r jsonb;
BEGIN
  PERFORM public.admin_assert();
  SELECT jsonb_build_object(
    'users', (SELECT count(*) FROM auth.users),
    'users_30d', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '30 days'),
    'empresas', (SELECT count(*) FROM public.empresas),
    'products', (SELECT count(*) FROM public.products),
    'subs', (SELECT coalesce(jsonb_object_agg(s, c), '{}'::jsonb) FROM (
       SELECT public.sub_effective_status(status, trial_end, current_period_end) s, count(*) c FROM public.subscriptions GROUP BY 1) x)
  ) INTO r;
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, created_at timestamptz, last_sign_in_at timestamptz, empresas integer, sub_status text, trial_end timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM public.admin_assert();
  RETURN QUERY SELECT u.id, u.email::text, p.first_name::text, p.last_name::text, u.created_at, u.last_sign_in_at,
    (SELECT count(*)::int FROM public.empresa_members m WHERE m.user_id = u.id),
    (SELECT public.sub_effective_status(s.status, s.trial_end, s.current_period_end) FROM public.subscriptions s WHERE s.user_id = u.id ORDER BY s.created_at DESC LIMIT 1),
    (SELECT s.trial_end FROM public.subscriptions s WHERE s.user_id = u.id ORDER BY s.created_at DESC LIMIT 1)
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id ORDER BY u.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_empresas()
RETURNS TABLE(id uuid, nome text, owner_email text, members integer, products integer, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM public.admin_assert();
  RETURN QUERY SELECT e.id, e.nome::text, u.email::text,
    (SELECT count(*)::int FROM public.empresa_members m WHERE m.empresa_id = e.id),
    (SELECT count(*)::int FROM public.products pr WHERE pr.empresa_id = e.id), e.created_at
  FROM public.empresas e LEFT JOIN auth.users u ON u.id = e.owner_id ORDER BY e.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_subscriptions()
RETURNS TABLE(id uuid, user_id uuid, email text, empresa_nome text, status text, effective_status text, plan text, trial_end timestamptz, current_period_end timestamptz, mp_subscription_id text, updated_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM public.admin_assert();
  RETURN QUERY SELECT s.id, s.user_id, u.email::text, e.nome::text, s.status, public.sub_effective_status(s.status, s.trial_end, s.current_period_end),
    s.plan, s.trial_end, s.current_period_end, s.mp_subscription_id, s.updated_at
  FROM public.subscriptions s LEFT JOIN auth.users u ON u.id = s.user_id LEFT JOIN public.empresas e ON e.id = s.empresa_id
  ORDER BY s.updated_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_update_subscription(_id uuid, _status text, _trial_days integer, _period_days integer, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _before jsonb; _after jsonb;
BEGIN
  PERFORM public.admin_assert();
  IF _reason IS NULL OR length(trim(_reason)) < 3 THEN RAISE EXCEPTION 'Informe o motivo da alteração'; END IF;
  IF _status IS NOT NULL AND _status NOT IN ('trialing','active','past_due','canceled','expired','suspended') THEN RAISE EXCEPTION 'Status inválido'; END IF;
  IF coalesce(_trial_days,0) < 0 OR coalesce(_trial_days,0) > 365 OR coalesce(_period_days,0) < 0 OR coalesce(_period_days,0) > 366 THEN RAISE EXCEPTION 'Quantidade de dias inválida'; END IF;
  SELECT to_jsonb(s) INTO _before FROM public.subscriptions s WHERE s.id = _id;
  IF _before IS NULL THEN RAISE EXCEPTION 'Assinatura não encontrada'; END IF;
  UPDATE public.subscriptions s SET
    status = coalesce(_status, s.status),
    trial_end = CASE WHEN coalesce(_trial_days,0) > 0 THEN greatest(s.trial_end, now()) + make_interval(days => _trial_days) ELSE s.trial_end END,
    current_period_end = CASE WHEN coalesce(_period_days,0) > 0 THEN greatest(coalesce(s.current_period_end, now()), now()) + make_interval(days => _period_days) ELSE s.current_period_end END
  WHERE s.id = _id;
  SELECT to_jsonb(s) INTO _after FROM public.subscriptions s WHERE s.id = _id;
  INSERT INTO public.admin_audit_log(actor_id, action, target_type, target_id, reason, before_data, after_data)
  VALUES (auth.uid(), 'subscription.update', 'subscription', _id::text, trim(_reason), _before, _after);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_audit()
RETURNS TABLE(id uuid, actor_email text, action text, target_type text, target_id text, reason text, before_data jsonb, after_data jsonb, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM public.admin_assert();
  RETURN QUERY SELECT a.id, u.email::text, a.action, a.target_type, a.target_id, a.reason, a.before_data, a.after_data, a.created_at
  FROM public.admin_audit_log a LEFT JOIN auth.users u ON u.id = a.actor_id ORDER BY a.created_at DESC LIMIT 500;
END; $$;

REVOKE ALL ON FUNCTION public.admin_assert(), public.admin_overview(), public.admin_list_users(), public.admin_list_empresas(), public.admin_list_subscriptions(), public.admin_update_subscription(uuid,text,integer,integer,text), public.admin_list_audit(), public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview(), public.admin_list_users(), public.admin_list_empresas(), public.admin_list_subscriptions(), public.admin_update_subscription(uuid,text,integer,integer,text), public.admin_list_audit(), public.is_current_user_admin() TO authenticated;