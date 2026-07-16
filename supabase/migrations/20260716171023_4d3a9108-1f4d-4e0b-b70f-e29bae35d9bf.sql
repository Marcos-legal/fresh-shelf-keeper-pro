
CREATE OR REPLACE FUNCTION public.is_empresa_owner(_empresa uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.empresa_members WHERE empresa_id = _empresa AND user_id = _user AND role = 'owner');
$$;
REVOKE EXECUTE ON FUNCTION public.is_empresa_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_empresa_owner(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.invite_empresa_member(_empresa uuid, _email text, _role text DEFAULT 'member')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _target_user uuid;
  _normalized_email text := lower(trim(_email));
BEGIN
  IF NOT public.is_empresa_owner(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o proprietário pode convidar membros';
  END IF;

  _role := 'member';

  SELECT id INTO _target_user FROM auth.users WHERE lower(email) = _normalized_email LIMIT 1;

  IF _target_user IS NOT NULL THEN
    INSERT INTO public.empresa_members (empresa_id, user_id, role)
    VALUES (_empresa, _target_user, _role::public.empresa_role)
    ON CONFLICT (empresa_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    RETURN jsonb_build_object('status','added','user_id', _target_user);
  END IF;

  INSERT INTO public.empresa_invites (empresa_id, email, role, invited_by)
  VALUES (_empresa, _normalized_email, _role, auth.uid())
  ON CONFLICT (empresa_id, email) DO UPDATE SET role = EXCLUDED.role, accepted_at = NULL, created_at = now();
  RETURN jsonb_build_object('status','invited','email', _normalized_email);
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_empresa_member(_empresa uuid, _user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_empresa_owner(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o proprietário pode remover membros';
  END IF;
  IF (SELECT role FROM public.empresa_members WHERE empresa_id = _empresa AND user_id = _user) = 'owner' THEN
    RAISE EXCEPTION 'O proprietário não pode ser removido';
  END IF;
  DELETE FROM public.empresa_members WHERE empresa_id = _empresa AND user_id = _user;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_empresa_member_role(_empresa uuid, _user uuid, _role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_empresa_owner(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o proprietário pode alterar papéis';
  END IF;
  IF _role <> 'member' THEN
    RAISE EXCEPTION 'Papel inválido';
  END IF;
  UPDATE public.empresa_members SET role = _role::public.empresa_role
  WHERE empresa_id = _empresa AND user_id = _user AND role <> 'owner';
END;
$$;

CREATE OR REPLACE FUNCTION public.rename_empresa(_empresa uuid, _nome text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_empresa_owner(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o proprietário pode renomear a empresa';
  END IF;
  UPDATE public.empresas SET nome = _nome WHERE id = _empresa;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_empresa_invites(_empresa uuid)
RETURNS TABLE(id uuid, email text, role text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_empresa_owner(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Sem acesso';
  END IF;
  RETURN QUERY
  SELECT ei.id, ei.email, ei.role::text, ei.created_at
  FROM public.empresa_invites ei
  WHERE ei.empresa_id = _empresa AND ei.accepted_at IS NULL
  ORDER BY ei.created_at DESC;
END;
$$;

-- Rebaixa admins/staff existentes para membro (mantém owners)
UPDATE public.empresa_members SET role = 'member'::public.empresa_role WHERE role IN ('admin'::public.empresa_role, 'staff'::public.empresa_role);

-- Assinatura efetiva: membros convidados herdam a assinatura do proprietário
CREATE OR REPLACE FUNCTION public.get_effective_subscription()
RETURNS TABLE(
  status text,
  trial_start timestamptz,
  trial_end timestamptz,
  plan text,
  payment_provider text,
  payment_id text,
  current_period_end timestamptz,
  mp_subscription_id text,
  is_inherited boolean,
  owner_user_id uuid
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _me uuid := auth.uid();
  _owner uuid;
BEGIN
  IF _me IS NULL THEN RETURN; END IF;

  SELECT e.owner_id INTO _owner
  FROM public.empresa_members em
  JOIN public.empresas e ON e.id = em.empresa_id
  WHERE em.user_id = _me AND em.role <> 'owner'
  ORDER BY em.created_at ASC
  LIMIT 1;

  IF _owner IS NOT NULL AND _owner <> _me THEN
    RETURN QUERY
    SELECT s.status, s.trial_start, s.trial_end, s.plan, s.payment_provider, s.payment_id,
           s.current_period_end, s.mp_subscription_id, true AS is_inherited, _owner
    FROM public.subscriptions s WHERE s.user_id = _owner;
  ELSE
    RETURN QUERY
    SELECT s.status, s.trial_start, s.trial_end, s.plan, s.payment_provider, s.payment_id,
           s.current_period_end, s.mp_subscription_id, false AS is_inherited, _me
    FROM public.subscriptions s WHERE s.user_id = _me;
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_effective_subscription() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_effective_subscription() TO authenticated;
