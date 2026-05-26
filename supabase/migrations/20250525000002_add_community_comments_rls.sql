-- Enable RLS on community_feed_upvotes (safe to run multiple times)
ALTER TABLE community_feed_upvotes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view upvotes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed_upvotes' AND policyname = 'Users can view all upvotes') THEN
    CREATE POLICY "Users can view all upvotes" ON community_feed_upvotes
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Allow authenticated users to insert their own upvotes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed_upvotes' AND policyname = 'Users can insert their own upvotes') THEN
    CREATE POLICY "Users can insert their own upvotes" ON community_feed_upvotes
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Allow authenticated users to delete their own upvotes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed_upvotes' AND policyname = 'Users can delete their own upvotes') THEN
    CREATE POLICY "Users can delete their own upvotes" ON community_feed_upvotes
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure feed_id column is bigint for proper type matching
ALTER TABLE community_feed_upvotes ALTER COLUMN feed_id TYPE bigint USING feed_id::bigint;

-- Community feed comments table
CREATE TABLE IF NOT EXISTS community_feed_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  feed_id BIGINT NOT NULL REFERENCES community_feed(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_initials TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE community_feed_comments ENABLE ROW LEVEL SECURITY;

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

-- Function + trigger to keep comment_count in sync
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

DROP TRIGGER IF EXISTS on_comment_insert_delete ON community_feed_comments;
CREATE TRIGGER on_comment_insert_delete
  AFTER INSERT OR DELETE ON community_feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_comment_count();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_feed_comments_feed_id ON community_feed_comments(feed_id);
CREATE INDEX IF NOT EXISTS idx_community_feed_comments_created_at ON community_feed_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_feed_upvotes_feed_id ON community_feed_upvotes(feed_id);
