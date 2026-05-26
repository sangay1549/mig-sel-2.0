import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { communityKeys } from './use-community-feed';
import type { FeedComment, ActivityItem } from '../types';

export const commentKeys = {
  byFeed: (feedId: number) => [...communityKeys.all, 'comments', feedId] as const,
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const useFeedComments = (feedId: number) => {
  return useQuery({
    queryKey: commentKeys.byFeed(feedId),
    queryFn: async (): Promise<FeedComment[]> => {
      const { data, error } = await supabase
        .from('community_feed_comments')
        .select('id, feed_id, user_id, body, user_name, created_at')
        .eq('feed_id', feedId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id as string,
        feed_id: row.feed_id as number,
        user_id: row.user_id as string,
        body: row.body as string,
        created_at: row.created_at as string,
        user_name: row.user_name as string,
        user_initials: getInitials(row.user_name as string),
      }));
    },
    staleTime: 30_000,
    retry: 1,
    enabled: feedId > 0,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const feedQueryKey = communityKeys.feed(user?.id);

  return useMutation({
    mutationFn: async ({ feedId, body }: { feedId: number; body: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error('Must be logged in to comment');

      const userName =
        user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'Unknown';
      const initials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const { error } = await supabase.from('community_feed_comments').insert({
        feed_id: feedId,
        user_id: user.id,
        user_name: userName,
        user_initials: initials,
        body,
      });

      if (error) throw error;
    },
    onMutate: async ({ feedId }) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKey });

      const prev = queryClient.getQueryData<ActivityItem[]>(feedQueryKey);

      queryClient.setQueryData<ActivityItem[]>(feedQueryKey, (old) =>
        old?.map((item) =>
          item.id === feedId ? { ...item, commentCount: item.commentCount + 1 } : item,
        ),
      );

      return { prev };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byFeed(variables.feedId) });
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(feedQueryKey, ctx.prev);
      }
      alert(`Failed to post comment: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedQueryKey });
    },
  });
};
