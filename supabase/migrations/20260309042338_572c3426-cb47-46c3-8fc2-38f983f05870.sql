ALTER TABLE public.plan_days ADD COLUMN ingredients jsonb DEFAULT NULL;
ALTER TABLE public.plan_days ADD COLUMN instructions text[] DEFAULT NULL;