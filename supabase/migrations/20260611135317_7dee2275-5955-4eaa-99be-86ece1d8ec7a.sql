
REVOKE EXECUTE ON FUNCTION public.invite_empresa_member(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_pending_invites() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.remove_empresa_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_empresa_member_role(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rename_empresa(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.list_empresa_members(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.list_empresa_invites(uuid) FROM PUBLIC, anon;
