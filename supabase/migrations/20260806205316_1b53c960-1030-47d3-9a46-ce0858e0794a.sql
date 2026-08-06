-- 1. Revoke execute from anon on all public functions
REVOKE ALL ON FUNCTION public.claim_pending_invites() FROM anon;
REVOKE ALL ON FUNCTION public.get_empresa_ativa(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_empresa() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_subscription() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.invite_empresa_member(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.is_empresa_admin(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_empresa_member(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_empresa_owner(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.list_empresa_invites(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.list_empresa_members(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.prevent_role_manipulation() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_subscription_manipulation() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_empresa_member(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.rename_empresa(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.set_empresa_id_default() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_product_user_id() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_empresa_member_role(uuid, uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;

-- 2. Drop unused subscription helper (subscription feature removed from app)
DROP FUNCTION IF EXISTS public.get_effective_subscription();

-- 3. Ensure the functions the app needs stay callable by signed-in users
GRANT EXECUTE ON FUNCTION public.claim_pending_invites() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_empresa_member(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_empresa_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_empresa_invites(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_empresa_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_empresa_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rename_empresa(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_empresa_member_role(uuid, uuid, text) TO authenticated;