INSERT INTO public.subscriptions (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions);