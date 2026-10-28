CREATE OR REPLACE FUNCTION public.handle_new_user_empresa()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  new_empresa_id uuid;
  _email text := lower(NEW.email);
  _has_invite boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.empresa_invites WHERE lower(email) = _email AND accepted_at IS NULL) INTO _has_invite;
  IF _has_invite THEN
    INSERT INTO public.empresa_members (empresa_id, user_id, role)
    SELECT empresa_id, NEW.id, role::public.empresa_role FROM public.empresa_invites
    WHERE lower(email) = _email AND accepted_at IS NULL
    ON CONFLICT (empresa_id, user_id) DO NOTHING;
    UPDATE public.empresa_invites SET accepted_at = now() WHERE lower(email) = _email AND accepted_at IS NULL;
  ELSE
    INSERT INTO public.empresas (nome, owner_id) VALUES ('Minha Empresa', NEW.id) RETURNING id INTO new_empresa_id;
    INSERT INTO public.empresa_members (empresa_id, user_id, role) VALUES (new_empresa_id, NEW.id, 'owner'::public.empresa_role);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_pending_invites()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _email text; _count integer := 0;
BEGIN
  SELECT lower(email) INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN RETURN 0; END IF;
  WITH pending AS (
    SELECT id, empresa_id, role FROM public.empresa_invites WHERE lower(email) = _email AND accepted_at IS NULL
  ), inserted AS (
    INSERT INTO public.empresa_members (empresa_id, user_id, role)
    SELECT empresa_id, auth.uid(), role::public.empresa_role FROM pending
    ON CONFLICT (empresa_id, user_id) DO NOTHING RETURNING 1
  ), marked AS (
    UPDATE public.empresa_invites SET accepted_at = now() WHERE id IN (SELECT id FROM pending) RETURNING 1
  )
  SELECT count(*)::int INTO _count FROM marked;
  RETURN _count;
END;
$function$;