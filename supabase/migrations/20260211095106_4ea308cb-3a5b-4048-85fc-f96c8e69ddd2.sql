
-- Add free_messages_used to profiles for tracking preview usage
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_messages_used integer NOT NULL DEFAULT 0;
