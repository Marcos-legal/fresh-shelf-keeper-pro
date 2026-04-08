
-- 1. Fix update_updated_at_column function to have explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Add explicit deny triggers for user_roles INSERT and DELETE
-- The prevent_role_manipulation trigger already exists but let's ensure it covers all operations
DROP TRIGGER IF EXISTS prevent_role_insert ON public.user_roles;
DROP TRIGGER IF EXISTS prevent_role_update ON public.user_roles;
DROP TRIGGER IF EXISTS prevent_role_delete ON public.user_roles;

CREATE TRIGGER prevent_role_insert
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_manipulation();

CREATE TRIGGER prevent_role_update
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_manipulation();

CREATE TRIGGER prevent_role_delete
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_manipulation();

-- 3. Add trigger to prevent client-side subscription manipulation
CREATE OR REPLACE FUNCTION public.prevent_subscription_manipulation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RAISE EXCEPTION 'Subscription manipulation is not allowed from client';
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_subscription_insert ON public.subscriptions;
DROP TRIGGER IF EXISTS prevent_subscription_update ON public.subscriptions;
DROP TRIGGER IF EXISTS prevent_subscription_delete ON public.subscriptions;

CREATE TRIGGER prevent_subscription_update
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_manipulation();

CREATE TRIGGER prevent_subscription_delete
  BEFORE DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_manipulation();
