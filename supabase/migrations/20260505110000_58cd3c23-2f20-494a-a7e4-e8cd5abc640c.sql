CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  sender text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  date text NOT NULL,
  is_ai boolean NOT NULL DEFAULT false,
  page_key text DEFAULT 'landing',
  telegram_message_id bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Anyone can read chat messages'
  ) THEN
    CREATE POLICY "Anyone can read chat messages"
    ON public.chat_messages
    FOR SELECT
    USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_page_key ON public.chat_messages (page_key);

ALTER TABLE public.page_images
ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

CREATE INDEX IF NOT EXISTS idx_page_images_page_sort ON public.page_images (page_key, sort_order);

CREATE TABLE IF NOT EXISTS public.telegram_updates (
  update_id bigint PRIMARY KEY,
  chat_id bigint,
  message_id bigint,
  page_key text DEFAULT 'landing',
  text text,
  raw_update jsonb NOT NULL,
  received_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'telegram_updates' AND policyname = 'No public read telegram updates'
  ) THEN
    CREATE POLICY "No public read telegram updates"
    ON public.telegram_updates
    FOR SELECT
    USING (false);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_telegram_updates_received_at ON public.telegram_updates (received_at DESC);

CREATE TABLE IF NOT EXISTS public.telegram_webhook_status (
  id text PRIMARY KEY DEFAULT 'singleton',
  webhook_url text,
  is_registered boolean NOT NULL DEFAULT false,
  last_checked_at timestamp with time zone,
  last_registered_at timestamp with time zone,
  last_error text,
  info jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT telegram_webhook_status_singleton CHECK (id = 'singleton')
);

ALTER TABLE public.telegram_webhook_status ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'telegram_webhook_status' AND policyname = 'No public read telegram webhook status'
  ) THEN
    CREATE POLICY "No public read telegram webhook status"
    ON public.telegram_webhook_status
    FOR SELECT
    USING (false);
  END IF;
END $$;

INSERT INTO public.telegram_webhook_status (id)
VALUES ('singleton')
ON CONFLICT (id) DO NOTHING;