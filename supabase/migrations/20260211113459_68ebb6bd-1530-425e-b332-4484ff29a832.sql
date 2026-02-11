-- Remove the overly permissive SELECT policy on claim_codes
DROP POLICY IF EXISTS "Authenticated can read unredeemed codes" ON public.claim_codes;