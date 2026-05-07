
ALTER TABLE public.page_images
  ADD COLUMN IF NOT EXISTS uploaded_by text NOT NULL DEFAULT 'admin';

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS media_path text,
  ADD COLUMN IF NOT EXISTS media_type text;
