
-- Add reactions column to chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS reactions jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Notification runs history (per-premiere email/notify runs)
CREATE TABLE IF NOT EXISTS public.notification_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  premiere_date timestamptz,
  recipients_count integer NOT NULL DEFAULT 0,
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'ok',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.notification_runs TO authenticated;
GRANT ALL ON public.notification_runs TO service_role;

ALTER TABLE public.notification_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_runs read for all"
  ON public.notification_runs FOR SELECT
  USING (true);
