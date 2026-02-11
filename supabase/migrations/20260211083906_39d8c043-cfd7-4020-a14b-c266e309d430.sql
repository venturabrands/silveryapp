
-- Create sleep diary entries table
CREATE TABLE public.sleep_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  target_wake_time TEXT,
  target_bedtime TEXT,
  hours_in_bed TEXT,
  times_woke_up TEXT,
  hours_asleep TEXT,
  sleep_efficiency TEXT,
  -- Habit checkboxes
  outside_20_min BOOLEAN NOT NULL DEFAULT false,
  morning_sunlight BOOLEAN NOT NULL DEFAULT false,
  no_eating_2hr BOOLEAN NOT NULL DEFAULT false,
  no_caffeine_after_2pm BOOLEAN NOT NULL DEFAULT false,
  phone_out_bedroom BOOLEAN NOT NULL DEFAULT false,
  no_screens_1hr BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Enable RLS
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own entries
CREATE POLICY "Users can view their own sleep entries"
  ON public.sleep_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep entries"
  ON public.sleep_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
  ON public.sleep_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
  ON public.sleep_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_sleep_entries_updated_at
  BEFORE UPDATE ON public.sleep_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
