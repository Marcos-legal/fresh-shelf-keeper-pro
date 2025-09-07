-- Fase 1: Corrigir estrutura do banco de dados

-- 1.1 Corrigir tabela products com valores padrão e user_id NOT NULL
ALTER TABLE public.products 
  ALTER COLUMN name SET DEFAULT '',
  ALTER COLUMN lot SET DEFAULT '',
  ALTER COLUMN brand SET DEFAULT '',
  ALTER COLUMN responsible SET DEFAULT '',
  ALTER COLUMN storage SET DEFAULT 'ambiente',
  ALTER COLUMN user_id SET NOT NULL;

-- 1.2 Corrigir funções de segurança com search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.set_product_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

-- 1.3 Padronizar valores de storage para minúsculas
UPDATE public.products 
SET storage = CASE 
  WHEN storage ILIKE '%refrigerado%' THEN 'refrigerado'
  WHEN storage ILIKE '%congelado%' THEN 'congelado'
  WHEN storage ILIKE '%ambiente%' THEN 'ambiente'
  WHEN storage ILIKE '%camara%' OR storage ILIKE '%fria%' THEN 'camara-fria'
  ELSE 'ambiente'
END
WHERE storage IS NOT NULL;