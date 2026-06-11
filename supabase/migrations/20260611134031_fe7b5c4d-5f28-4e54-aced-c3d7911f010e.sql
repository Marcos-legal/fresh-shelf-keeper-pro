
-- ============= Etapa 1: Multitenant — convites e RPCs =============

-- Tabela de convites pendentes (usuário ainda não cadastrado)
CREATE TABLE IF NOT EXISTS public.empresa_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresa_invites TO authenticated;
GRANT ALL ON public.empresa_invites TO service_role;

ALTER TABLE public.empresa_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins gerenciam convites da empresa"
  ON public.empresa_invites
  FOR ALL
  TO authenticated
  USING (public.is_empresa_admin(empresa_id, auth.uid()))
  WITH CHECK (public.is_empresa_admin(empresa_id, auth.uid()));

CREATE INDEX IF NOT EXISTS idx_empresa_invites_email ON public.empresa_invites (lower(email));
CREATE INDEX IF NOT EXISTS idx_empresa_invites_empresa ON public.empresa_invites (empresa_id);

-- ===== RPC: convidar membro =====
-- Se o e-mail já tem usuário em auth.users, cria membership direto.
-- Caso contrário, cria convite pendente.
CREATE OR REPLACE FUNCTION public.invite_empresa_member(
  _empresa uuid,
  _email text,
  _role text DEFAULT 'member'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _target_user uuid;
  _normalized_email text := lower(trim(_email));
BEGIN
  IF NOT public.is_empresa_admin(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem convidar membros';
  END IF;

  IF _role NOT IN ('admin','member') THEN
    RAISE EXCEPTION 'Papel inválido';
  END IF;

  SELECT id INTO _target_user FROM auth.users WHERE lower(email) = _normalized_email LIMIT 1;

  IF _target_user IS NOT NULL THEN
    INSERT INTO public.empresa_members (empresa_id, user_id, role)
    VALUES (_empresa, _target_user, _role)
    ON CONFLICT (empresa_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    RETURN jsonb_build_object('status','added','user_id', _target_user);
  END IF;

  INSERT INTO public.empresa_invites (empresa_id, email, role, invited_by)
  VALUES (_empresa, _normalized_email, _role, auth.uid())
  ON CONFLICT (empresa_id, email) DO UPDATE SET role = EXCLUDED.role, accepted_at = NULL, created_at = now();

  RETURN jsonb_build_object('status','invited','email', _normalized_email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.invite_empresa_member(uuid, text, text) TO authenticated;

-- ===== RPC: aceitar convites pendentes do usuário logado =====
CREATE OR REPLACE FUNCTION public.claim_pending_invites()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email text;
  _count integer := 0;
BEGIN
  SELECT lower(email) INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN RETURN 0; END IF;

  WITH pending AS (
    SELECT id, empresa_id, role FROM public.empresa_invites
    WHERE lower(email) = _email AND accepted_at IS NULL
  ), inserted AS (
    INSERT INTO public.empresa_members (empresa_id, user_id, role)
    SELECT empresa_id, auth.uid(), role FROM pending
    ON CONFLICT (empresa_id, user_id) DO NOTHING
    RETURNING 1
  ), marked AS (
    UPDATE public.empresa_invites SET accepted_at = now()
    WHERE id IN (SELECT id FROM pending)
    RETURNING 1
  )
  SELECT count(*)::int INTO _count FROM marked;

  RETURN _count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_pending_invites() TO authenticated;

-- ===== RPC: remover membro =====
CREATE OR REPLACE FUNCTION public.remove_empresa_member(_empresa uuid, _user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_empresa_admin(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem remover membros';
  END IF;
  IF (SELECT role FROM public.empresa_members WHERE empresa_id = _empresa AND user_id = _user) = 'owner' THEN
    RAISE EXCEPTION 'O proprietário não pode ser removido';
  END IF;
  DELETE FROM public.empresa_members WHERE empresa_id = _empresa AND user_id = _user;
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_empresa_member(uuid, uuid) TO authenticated;

-- ===== RPC: alterar role =====
CREATE OR REPLACE FUNCTION public.update_empresa_member_role(_empresa uuid, _user uuid, _role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_empresa_admin(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar papéis';
  END IF;
  IF _role NOT IN ('admin','member') THEN
    RAISE EXCEPTION 'Papel inválido';
  END IF;
  UPDATE public.empresa_members SET role = _role
  WHERE empresa_id = _empresa AND user_id = _user AND role <> 'owner';
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_empresa_member_role(uuid, uuid, text) TO authenticated;

-- ===== RPC: renomear empresa =====
CREATE OR REPLACE FUNCTION public.rename_empresa(_empresa uuid, _nome text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_empresa_admin(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem renomear';
  END IF;
  UPDATE public.empresas SET nome = _nome WHERE id = _empresa;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rename_empresa(uuid, text) TO authenticated;

-- ===== RPC: listar membros com email/nome =====
CREATE OR REPLACE FUNCTION public.list_empresa_members(_empresa uuid)
RETURNS TABLE (
  user_id uuid,
  role text,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_empresa_member(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Sem acesso à empresa';
  END IF;
  RETURN QUERY
  SELECT em.user_id, em.role, au.email::text, p.first_name, p.last_name, em.created_at
  FROM public.empresa_members em
  JOIN auth.users au ON au.id = em.user_id
  LEFT JOIN public.profiles p ON p.id = em.user_id
  WHERE em.empresa_id = _empresa
  ORDER BY (em.role = 'owner') DESC, em.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_empresa_members(uuid) TO authenticated;

-- ===== RPC: listar convites pendentes =====
CREATE OR REPLACE FUNCTION public.list_empresa_invites(_empresa uuid)
RETURNS TABLE (id uuid, email text, role text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_empresa_admin(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Sem acesso';
  END IF;
  RETURN QUERY
  SELECT ei.id, ei.email, ei.role, ei.created_at
  FROM public.empresa_invites ei
  WHERE ei.empresa_id = _empresa AND ei.accepted_at IS NULL
  ORDER BY ei.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_empresa_invites(uuid) TO authenticated;

-- ===== Atualizar handle_new_user_empresa para aceitar convites automaticamente =====
CREATE OR REPLACE FUNCTION public.handle_new_user_empresa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_empresa_id uuid;
  _email text := lower(NEW.email);
  _has_invite boolean;
BEGIN
  -- Aceitar convites pendentes para este e-mail
  SELECT EXISTS (SELECT 1 FROM public.empresa_invites WHERE lower(email) = _email AND accepted_at IS NULL)
    INTO _has_invite;

  IF _has_invite THEN
    INSERT INTO public.empresa_members (empresa_id, user_id, role)
    SELECT empresa_id, NEW.id, role FROM public.empresa_invites
    WHERE lower(email) = _email AND accepted_at IS NULL
    ON CONFLICT (empresa_id, user_id) DO NOTHING;

    UPDATE public.empresa_invites SET accepted_at = now()
    WHERE lower(email) = _email AND accepted_at IS NULL;
  ELSE
    -- Sem convite: cria empresa padrão
    INSERT INTO public.empresas (nome, owner_id) VALUES ('Minha Empresa', NEW.id) RETURNING id INTO new_empresa_id;
    INSERT INTO public.empresa_members (empresa_id, user_id, role) VALUES (new_empresa_id, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$$;
