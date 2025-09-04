-- Fix the products table to use user_id properly and add RLS policies for proper user isolation

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Add missing trigger for products table to auto-set user_id
CREATE TRIGGER set_user_id_products
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_user_id();

-- Add missing trigger for produtos_estoque table to auto-set user_id  
CREATE TRIGGER set_user_id_produtos_estoque
  BEFORE INSERT ON public.produtos_estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_user_id();

-- Add missing trigger for contagens_estoque table to auto-set user_id
CREATE TRIGGER set_user_id_contagens_estoque
  BEFORE INSERT ON public.contagens_estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_user_id();

-- Add update trigger for products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Remove the problematic policy that allows public access to contagens_estoque
DROP POLICY IF EXISTS "replace_with_policy_name" ON public.contagens_estoque;