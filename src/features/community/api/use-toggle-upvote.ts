import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { communityKeys } from './use-community-feed';

interface ToggleUpvoteInput {
  feedId: number;
}

export const useToggleUpvote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feedId }: ToggleUpvoteInput) => {
      const { error } = await supabase.rpc('toggle_feed_upvote', {
        p_feed_id: feedId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.feed() });
    },
  });
};
