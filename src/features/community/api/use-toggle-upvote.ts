import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { communityKeys } from './use-community-feed';
import type { ActivityItem } from '../types';

const inflightFeedIds = new Set<number>();

interface ToggleUpvoteInput {
  feedId: number;
  isCurrentlyUpvoted: boolean;
}

export const useToggleUpvote = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const queryKey = communityKeys.feed(user?.id);

  return useMutation({
    mutationFn: async ({ feedId }: ToggleUpvoteInput) => {
      const { data, error } = await supabase.rpc('toggle_feed_upvote', {
        p_feed_id: feedId,
      });
      if (error) throw error;
      if (!data?.length) throw new Error('No data returned from toggle_feed_upvote');
      return data[0];
    },
    onMutate: async ({ feedId, isCurrentlyUpvoted }) => {
      if (inflightFeedIds.has(feedId)) {
        return { prev: undefined, skipped: true as const };
      }
      inflightFeedIds.add(feedId);

      await queryClient.cancelQueries({ queryKey });

      const prev = queryClient.getQueryData<ActivityItem[]>(queryKey);

      queryClient.setQueryData<ActivityItem[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === feedId
            ? {
                ...item,
                isUpvoted: !isCurrentlyUpvoted,
                upvoteCount: item.upvoteCount + (isCurrentlyUpvoted ? -1 : 1),
              }
            : item,
        ),
      );

      return { prev };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.skipped) return;
      console.error('Toggle upvote failed:', error);
      if (ctx?.prev) {
        queryClient.setQueryData(queryKey, ctx.prev);
      }
    },
    onSettled: (_data, _error, { feedId }) => {
      inflightFeedIds.delete(feedId);
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
