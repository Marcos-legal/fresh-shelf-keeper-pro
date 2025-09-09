-- Fix products table to allow nullable dates for optional fields
ALTER TABLE public.products 
ALTER COLUMN manufacture_date DROP NOT NULL,
ALTER COLUMN expiry_date DROP NOT NULL,
ALTER COLUMN opening_date DROP NOT NULL,
ALTER COLUMN days_valid DROP NOT NULL,
ALTER COLUMN use_by_date DROP NOT NULL;

-- Set default values for better UX
ALTER TABLE public.products 
ALTER COLUMN days_valid SET DEFAULT 0;