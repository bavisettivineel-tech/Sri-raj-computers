-- Add payment_id column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
