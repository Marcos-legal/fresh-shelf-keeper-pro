ALTER TABLE public.user_roles DISABLE TRIGGER USER;
INSERT INTO public.user_roles (user_id, role) SELECT '033821c0-a40b-4709-a54c-acfb228abcb0'::uuid, 'admin'::app_role
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='033821c0-a40b-4709-a54c-acfb228abcb0' AND role='admin');
ALTER TABLE public.user_roles ENABLE TRIGGER USER;
INSERT INTO public.admin_audit_log (actor_id, action, target_type, target_id, reason)
VALUES ('033821c0-a40b-4709-a54c-acfb228abcb0', 'role.grant_admin', 'user', '033821c0-a40b-4709-a54c-acfb228abcb0', 'Primeiro administrador confirmado pelo proprietário');