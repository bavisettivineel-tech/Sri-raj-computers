
-- B2B Category-wise GST Discounts table
-- Admin sets a discount % per product category for verified GST users
CREATE TABLE public.b2b_category_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT NOT NULL,
  discount_percent NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id)
);

ALTER TABLE public.b2b_category_discounts ENABLE ROW LEVEL SECURITY;

-- Everyone (including anonymous) can read discounts for cart calculation
CREATE POLICY "B2B discounts viewable by everyone" ON public.b2b_category_discounts
  FOR SELECT USING (true);

-- Only admins can manage discounts
CREATE POLICY "Admins can manage B2B discounts" ON public.b2b_category_discounts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_b2b_discounts_updated_at
  BEFORE UPDATE ON public.b2b_category_discounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add gstin column to profiles so users can save their verified GST
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gstin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gst_verified BOOLEAN DEFAULT false;
