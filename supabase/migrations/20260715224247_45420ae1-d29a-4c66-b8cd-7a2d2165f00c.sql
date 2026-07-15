CREATE OR REPLACE FUNCTION public.list_empresa_members(_empresa uuid)
 RETURNS TABLE(user_id uuid, role text, email text, first_name text, last_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_empresa_member(_empresa, auth.uid()) THEN
    RAISE EXCEPTION 'Sem acesso à empresa';
  END IF;
  RETURN QUERY
  SELECT em.user_id, em.role::text, au.email::text, p.first_name::text, p.last_name::text, em.created_at
  FROM public.empresa_members em
  JOIN auth.users au ON au.id = em.user_id
  LEFT JOIN public.profiles p ON p.id = em.user_id
  WHERE em.empresa_id = _empresa
  ORDER BY (em.role = 'owner') DESC, em.created_at ASC;
END;
$function$;