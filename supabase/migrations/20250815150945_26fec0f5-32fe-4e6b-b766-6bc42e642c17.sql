-- Set up proper product ownership triggers
CREATE OR REPLACE FUNCTION public.set_product_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$function$;

-- Create trigger to automatically set user_id on product insert
CREATE TRIGGER set_product_user_id_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_user_id();

-- Create trigger to automatically create profiles on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update products RLS policy to remove user_id IS NULL check
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;

CREATE POLICY "Users can insert their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Backfill any existing products without user_id (if any exist)
-- This is safe as it only affects products that currently have NULL user_id
UPDATE public.products 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.email IS NOT NULL 
  LIMIT 1
)
WHERE user_id IS NULL;