CREATE POLICY "Users can view their own moderation logs"
ON public.moderation_logs
FOR SELECT
USING (auth.uid() = user_id);