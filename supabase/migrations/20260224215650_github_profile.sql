-- Create a `profile` table
DROP TABLE IF EXISTS public.profile;
CREATE TABLE public.profile (
  id UUID REFERENCES auth.users NOT NULL,
  login VARCHAR NOT NULL,
  github_provider_token VARCHAR NULL,
  github_provider_refresh_token VARCHAR NULL,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profile
  ENABLE ROW LEVEL SECURITY;

-- User can select their profile.
CREATE POLICY
  "Can only view own profile data."
  ON public.profile
  FOR SELECT
  USING ( auth.uid() = id );

-- User can update their profile (to update tokens)
CREATE POLICY
  "Can only update own profile data."
  ON public.profile
  FOR UPDATE
  USING ( auth.uid() = id );

-- Create a postgres function that will automatically create new `profile`
-- row when new user is authenticated for the first time.
-- This new row will contain only `id` (uuid) and `login` (github username)
-- fields.
DROP FUNCTION IF EXISTS public.create_profile_for_new_user CASCADE;
CREATE FUNCTION
  public.create_profile_for_new_user()
  RETURNS TRIGGER AS
  $$
  BEGIN
    INSERT INTO public.profile (id, login)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'user_name'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger to call create_profile_for_new_user when new
-- user is authenticated.
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;
CREATE TRIGGER
  create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE
    public.create_profile_for_new_user();
