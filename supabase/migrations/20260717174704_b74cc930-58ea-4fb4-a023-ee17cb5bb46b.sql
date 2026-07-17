-- Payment methods (admin-editable) for the Gift page
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text NOT NULL, -- 'bank' | 'mobile' | 'paypal' | 'card' | 'crypto' | 'other'
  label text NOT NULL,
  account_name text,
  account_value text NOT NULL,
  instructions text,
  deep_link text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active payment methods"
  ON public.payment_methods FOR SELECT
  USING (is_active = true);

-- The Manual — hidden journal of guidance entries
CREATE TABLE public.manual_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text,
  body text NOT NULL,
  steps jsonb,
  tags text[],
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.manual_entries TO anon;
GRANT SELECT ON public.manual_entries TO authenticated;
GRANT ALL ON public.manual_entries TO service_role;
ALTER TABLE public.manual_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published manual entries"
  ON public.manual_entries FOR SELECT
  USING (is_published = true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TRIGGER trg_manual_entries_updated_at
  BEFORE UPDATE ON public.manual_entries
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Seed a couple starter payment methods (admin will edit real values later)
INSERT INTO public.payment_methods (kind, label, account_name, account_value, instructions, sort_order) VALUES
  ('bank', 'Bank Transfer', 'Her Name', 'Set account number in admin', 'Standard bank transfer — usually 1–2 business days.', 10),
  ('mobile', 'Mobile Money', 'Her Name', 'Set phone number in admin', 'Send directly to her mobile wallet.', 20),
  ('paypal', 'PayPal', 'Her Name', 'set-paypal@example.com', 'Instant international transfer.', 30);

-- Seed a first manual entry
INSERT INTO public.manual_entries (title, category, body, sort_order) VALUES
  ('Welcome to the Manual', 'Preface', 'This is a private journal — a guide of things worth knowing. New entries will appear here as they are written. Take your time.', 0);
