
-- Create table for email subscribers (no auth required, public site)
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_email TEXT NOT NULL,
  backup_email TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public site, no auth)
CREATE POLICY "Anyone can subscribe" ON public.email_subscribers
  FOR INSERT WITH CHECK (true);

-- Only allow reading via edge functions (no public read)
CREATE POLICY "No public read" ON public.email_subscribers
  FOR SELECT USING (false);
