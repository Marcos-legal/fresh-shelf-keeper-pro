
-- Adiciona valor 'member' ao enum empresa_role, caso ainda não exista
ALTER TYPE public.empresa_role ADD VALUE IF NOT EXISTS 'member';
