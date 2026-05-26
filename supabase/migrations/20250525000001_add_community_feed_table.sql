CREATE TABLE IF NOT EXISTS community_feed (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_initials TEXT NOT NULL,
  action_text TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_feed_upvotes (
  feed_id BIGINT NOT NULL REFERENCES community_feed(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (feed_id, user_id)
);

ALTER TABLE community_feed ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed' AND policyname = 'Users can view all feed items') THEN
    CREATE POLICY "Users can view all feed items" ON community_feed
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_feed' AND policyname = 'Users can insert feed items') THEN
    CREATE POLICY "Users can insert feed items" ON community_feed
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;
NOTIFY pgrst, 'reload schema';