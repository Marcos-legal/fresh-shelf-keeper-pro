GRANT EXECUTE ON FUNCTION public.is_empresa_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_empresa_ativa(uuid) TO authenticated;