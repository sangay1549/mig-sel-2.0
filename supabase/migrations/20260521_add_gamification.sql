-- Add gamification columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create index for leaderboard sorting
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles (points DESC);

-- Function to ensure a profile exists when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, points, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'preferred_username',
      SPLIT_PART(NEW.email, '@', 1),
      'User'
    ),
    0,
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET username = COALESCE(
    EXCLUDED.username,
    profiles.username
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
