import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import type { ActivityItem, FeedStatus, ImpactGoal } from '../types';

const MOCK_GOAL: ImpactGoal = {
  id: 'g1',
  title: 'Monsoon Readiness',
  current: 15,
  target: 30,
  unit: 'issues resolved',
  location: 'Sarpang',
};

export type FeedCategory = 'all' | 'issues' | 'updates' | 'official' | 'life_updates';

export const communityKeys = {
  all: ['community'] as const,
  feed: (userId?: string, page?: number, pageSize?: number, category?: FeedCategory) =>
    [...communityKeys.all, 'feed', userId, page, pageSize, category] as const,
  goal: () => [...communityKeys.all, 'goal'] as const,
};

export const useCommunityFeed = (page: number = 1, pageSize: number = 5, category: FeedCategory = 'all') => {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: communityKeys.feed(user?.id, page, pageSize, category),
    staleTime: 30_000,
    retry: 1,
    queryFn: async (): Promise<{ items: ActivityItem[]; count: number }> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const userId = user?.id;

      const tryQuery = (withPostType: boolean) => {
        const cols =
          'id, user_name, user_initials, action_text, location, image_url, created_at, upvote_count, comment_count, user_id, status, is_official, official_department, is_pinned, is_emergency, announcement_category' +
          (withPostType ? ', post_type' : '');

        let q: any = supabase.from('community_feed').select(cols, { count: 'exact', head: false });

        if (category === 'official') {
          q = q.eq('is_official', true);
        } else if (category === 'issues' && withPostType) {
          q = q.eq('post_type', 'grievance');
        } else if (category === 'updates' && withPostType) {
          q = q.eq('post_type', 'life_update');
        } else if (category === 'issues' || category === 'updates') {
          q = q.not('is_official', 'eq', true);
        }

        return q.order('created_at', { ascending: false }).range(from, to);
      };

      const first = await tryQuery(true);
      if (first.error) {
        // post_type column may not be in schema cache — fall back to legacy filter
        if (first.error.code === '42703' || first.error.message?.includes('schema cache')) {
          console.warn('post_type column not available, using legacy filter');
          const fb = await tryQuery(false);
          if (fb.error) {
            if (fb.error.code === '42P01') {
              console.warn('community_feed table not yet created in DB');
              return { items: [], count: 0 };
            }
            throw fb.error;
          }
          return parseFeedResult(fb.data, fb.count, userId);
        }

        if (first.error.code === '42P01') {
          console.warn('community_feed table not yet created in DB');
          return { items: [], count: 0 };
        }
        throw first.error;
      }

      return parseFeedResult(first.data, first.count, userId);
    },
  });
};

async function parseFeedResult(
  input: Record<string, unknown>[] | null,
  count: number | null,
  userId: string | undefined,
): Promise<{ items: ActivityItem[]; count: number }> {
  const avatarMap = new Map<string, string>();
  const userIds = (input || []).map((r) => r.user_id as string).filter((id): id is string => !!id);
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .in('id', userIds);
    if (profiles) {
      for (const p of profiles) {
        if (p.avatar_url) avatarMap.set(p.id, p.avatar_url);
      }
    }
  }

  let upvotedIds = new Set<number>();
  if (userId && input?.length) {
    const ids = input.map((r) => r.id as number);
    const { data: upvotes, error: upvoteError } = await supabase
      .from('community_feed_upvotes')
      .select('feed_id')
      .eq('user_id', userId)
      .in('feed_id', ids);

    if (upvoteError) {
      console.warn('community_feed_upvotes query failed:', upvoteError.message);
    } else if (upvotes) {
      upvotedIds = new Set(upvotes.map((u) => u.feed_id));
    }
  }

  const items = (input || []).map<ActivityItem>((row) => ({
    id: row.id as number,
    userName: (row.user_name as string) ?? '',
    userInitials: (row.user_initials as string) ?? '',
    action: (row.action_text as string) ?? '',
    location: (row.location as string) ?? '',
    timestamp: new Date((row.created_at as string) ?? Date.now()),
    upvoteCount: (row.upvote_count as number) ?? 0,
    commentCount: (row.comment_count as number) ?? 0,
    isUpvoted: upvotedIds.has(row.id as number),
    image_url: (row.image_url as string) ?? undefined,
    userId: (row.user_id as string) ?? undefined,
    avatarUrl: row.user_id ? avatarMap.get(row.user_id as string) : undefined,
    status: (row.status as FeedStatus) ?? undefined,
    latitude: undefined,
    longitude: undefined,
    isOfficial: (row.is_official as boolean) ?? undefined,
    isVerified: (row.is_official as boolean) ?? undefined,
    department: (row.official_department as string) ?? undefined,
    isPinned: (row.is_pinned as boolean) ?? undefined,
    isEmergency: (row.is_emergency as boolean) ?? undefined,
    postType: (row.post_type as string) ?? undefined,
  }));

  return { items, count: count ?? items.length };
}

export const useCommunityGoal = () => {
  return useQuery({
    queryKey: communityKeys.goal(),
    queryFn: async (): Promise<ImpactGoal> => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_GOAL;
    },
  });
};
