-- Page settings (premiere date, description per page key)
CREATE TABLE public.page_settings (
  page_key text PRIMARY KEY,
  premiere_date timestamptz,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read page settings" ON public.page_settings FOR SELECT USING (true);
-- writes only via service role (edge function); no insert/update/delete policies for anon

-- Page images
CREATE TABLE public.page_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  image_path text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_images_page_key_idx ON public.page_images(page_key, sort_order);
ALTER TABLE public.page_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read page images" ON public.page_images FOR SELECT USING (true);

-- Admin sessions (short-lived tokens issued by validate-access for admin role)
CREATE TABLE public.admin_sessions (
  token text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
-- no policies: only service role accesses this table

-- Storage bucket for premiere media
INSERT INTO storage.buckets (id, name, public) VALUES ('premiere-media', 'premiere-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read premiere media"
ON storage.objects FOR SELECT
USING (bucket_id = 'premiere-media');
-- writes/updates/deletes only via service role through edge function

-- Seed default page settings
INSERT INTO public.page_settings (page_key, premiere_date, description) VALUES
  ('our-story', '2026-08-14T00:00:00Z', 'The tale of how two hearts collided and never looked back.'),
  ('the-journey', '2026-09-05T00:00:00Z', 'Every step, every mile, every moment that led us here.'),
  ('laughs', '2026-10-01T00:00:00Z', 'The moments that made us cry from laughing too hard.'),
  ('letters', '2026-10-20T00:00:00Z', 'Words written from the heart, just for you.'),
  ('goals', '2026-11-20T00:00:00Z', 'Everything we dreamed of, everything we became.')
ON CONFLICT (page_key) DO NOTHING;