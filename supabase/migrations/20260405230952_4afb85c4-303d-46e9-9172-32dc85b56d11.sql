
-- 1. Drop the permissive UPDATE policy on subscriptions to prevent billing bypass
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- 2. Add a trigger on user_roles to block non-superuser INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.prevent_role_manipulation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow role changes via service role (superuser/rls bypass)
  -- Regular authenticated users will hit this trigger
  RAISE EXCEPTION 'Role manipulation is not allowed';
  RETURN NULL;
END;
$$;

CREATE TRIGGER guard_user_roles_insert
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_manipulation();

CREATE TRIGGER guard_user_roles_update
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_manipulation();

CREATE TRIGGER guard_user_roles_delete
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_manipulation();
