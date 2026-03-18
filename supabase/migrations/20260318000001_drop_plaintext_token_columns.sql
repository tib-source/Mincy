-- Remove plain text token columns from profile table.
-- Tokens are now stored encrypted in the secrets table.
ALTER TABLE public.profile
  DROP COLUMN IF EXISTS github_provider_token,
  DROP COLUMN IF EXISTS github_provider_refresh_token;
