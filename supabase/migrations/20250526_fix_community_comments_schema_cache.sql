-- Fix: "Could not find the 'body' column of 'community_feed_comments' in the schema cache"
-- This happens when the table/column exists but PostgREST schema cache is stale,
-- or when the previous migration hasn't been applied.

-- 1. Ensure the table exists with all columns (idempotent)
CREATE TABLE IF NOT EXISTS community_feed_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  feed_id BIGINT NOT NULL REFERENCES community_feed(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_initials TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. If table existed but was missing the body column, add it
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_feed_comments' AND column_name = 'body'
  ) THEN
    ALTER TABLE community_feed_comments ADD COLUMN body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 1000);
  END IF;
END $$;

-- 3. Ensure RLS is enabled
ALTER TABLE community_feed_comments ENABLE ROW LEVEL SECURITY;

-- 4. Recreate all policies (idempotent via DO blocks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed_comments' AND policyname = 'Users can view all comments') THEN
    CREATE POLICY "Users can view all comments" ON community_feed_comments
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed_comments' AND policyname = 'Users can insert their own comments') THEN
    CREATE POLICY "Users can insert their own comments" ON community_feed_comments
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed_comments' AND policyname = 'Users can delete their own comments') THEN
    CREATE POLICY "Users can delete their own comments" ON community_feed_comments
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Ensure trigger function exists
CREATE OR REPLACE FUNCTION update_feed_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_feed SET comment_count = comment_count + 1 WHERE id = NEW.feed_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_feed SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.feed_id;
    RETURN OLD;
  END IF;
END;
$$;

-- 6. Recreate trigger
DROP TRIGGER IF EXISTS on_comment_insert_delete ON community_feed_comments;
CREATE TRIGGER on_comment_insert_delete
  AFTER INSERT OR DELETE ON community_feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_comment_count();

-- 7. Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_community_feed_comments_feed_id ON community_feed_comments(feed_id);
CREATE INDEX IF NOT EXISTS idx_community_feed_comments_created_at ON community_feed_comments(created_at DESC);

-- 8. Refresh PostgREST schema cache so it picks up the body column
NOTIFY pgrst, 'reload schema';
