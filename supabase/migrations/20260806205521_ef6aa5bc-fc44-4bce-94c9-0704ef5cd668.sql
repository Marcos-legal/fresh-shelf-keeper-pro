REVOKE ALL ON FUNCTION public.get_empresa_ativa(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_empresa() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_subscription() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_empresa_admin(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_empresa_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_role_manipulation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_subscription_manipulation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_empresa_id_default() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_product_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_owner(uuid, uuid) TO authenticated;