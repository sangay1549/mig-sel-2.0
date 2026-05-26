-- Default new grievances to 'pending' status
ALTER TABLE public.grievances
  ALTER COLUMN status SET DEFAULT 'pending';

-- Backfill existing NULL statuses in grievances
UPDATE public.grievances
SET status = 'pending'
WHERE status IS NULL;

-- Backfill existing NULL statuses in community_feed
UPDATE public.community_feed
SET status = 'pending'
WHERE status IS NULL;

NOTIFY pgrst, 'reload schema';
