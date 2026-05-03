-- Drop self-insert policy that allowed users to insert rows for themselves (privilege escalation risk)
DROP POLICY IF EXISTS "User roles: admin can insert" ON public.user_roles;
DROP POLICY IF EXISTS insert_user_roles ON public.user_roles;
DROP POLICY IF EXISTS update_user_roles ON public.user_roles;
DROP POLICY IF EXISTS delete_user_roles ON public.user_roles;
DROP POLICY IF EXISTS "Leitura pública de roles" ON public.user_roles;

-- Recreate INSERT policy restricted to admins only (no self-assignment possible)
CREATE POLICY "User roles: admin can insert"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Storage: add UPDATE policy for user-uploads bucket (only owner of folder)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads') THEN
    EXECUTE $p$
      CREATE POLICY "Users can update their own uploads"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
        WITH CHECK (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
    $p$;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;