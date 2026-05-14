
-- Admin notifications table
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Contact messages table
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- FAQs table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQs viewable by everyone" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admins can manage FAQs" ON public.faqs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- App settings key-value store
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by everyone" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Dealer applications table
CREATE TABLE public.dealer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  gstin text,
  address text,
  city text,
  state text,
  status text NOT NULL DEFAULT 'pending',
  discount_percent numeric DEFAULT 0,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.dealer_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit dealer application" ON public.dealer_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own application" ON public.dealer_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage dealer applications" ON public.dealer_applications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin activity log
CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage activity log" ON public.admin_activity_log FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Insert default app settings
INSERT INTO public.app_settings (key, value) VALUES
  ('store_name', 'Sri Raj Computers & IT Solutions'),
  ('tagline', 'Quality Printer Parts, Computer Peripherals & CCTV in One Roof'),
  ('address', '#5-12-16, Ground Floor, Nageswararao Street, Near Maridamma Temple, Peddapuram - 533437, E.G. Dist., A.P.'),
  ('phone1', '9949915177'),
  ('phone2', '7386089900'),
  ('email1', 'rajcomputers.pdp@gmail.com'),
  ('whatsapp', '9949915177'),
  ('gst_number', '37CQEPB1752N1ZQ'),
  ('gst_percent', '18'),
  ('free_shipping_threshold', '999'),
  ('shipping_charge', '99'),
  ('express_shipping_charge', '199'),
  ('cod_available', 'true'),
  ('cod_extra_charge', '0'),
  ('currency', 'INR')
ON CONFLICT (key) DO NOTHING;
