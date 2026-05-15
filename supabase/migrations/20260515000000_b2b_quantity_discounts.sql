
-- B2B Quantity-based Discounts table
-- Admin sets discount % based on minimum quantity purchased
CREATE TABLE public.b2b_quantity_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_quantity INTEGER NOT NULL CHECK (min_quantity >= 1),
  discount_percent NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(min_quantity)
);

ALTER TABLE public.b2b_quantity_discounts ENABLE ROW LEVEL SECURITY;

-- Everyone (including anonymous) can read discounts for cart calculation
CREATE POLICY "B2B quantity discounts viewable by everyone" ON public.b2b_quantity_discounts
  FOR SELECT USING (true);

-- Only admins can manage discounts
CREATE POLICY "Admins can manage B2B quantity discounts" ON public.b2b_quantity_discounts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_b2b_quantity_discounts_updated_at
  BEFORE UPDATE ON public.b2b_quantity_discounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some initial data if needed
-- INSERT INTO public.b2b_quantity_discounts (min_quantity, discount_percent) VALUES (2, 5), (5, 10);
