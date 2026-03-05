
CREATE TABLE public.saved_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  date text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert notes" ON public.saved_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read notes" ON public.saved_notes
  FOR SELECT USING (true);
