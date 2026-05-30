import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { communityKeys } from '@/features/community/api/use-community-feed';

export interface CreateLifeUpdateInput {
  body: string;
  image_url: string | null;
}

export const useCreateLifeUpdate = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (input: CreateLifeUpdateInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      const userName = profile?.username ?? 'Anonymous';
      const initials = userName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const { error } = await supabase.from('community_feed').insert({
        user_name: userName,
        user_initials: initials,
        action_text: input.body,
        image_url: input.image_url,
        user_id: user.id,
        post_type: 'life_update',
      });

      if (error) {
        // post_type column may not be in schema cache yet; retry without it
        if (error.message?.includes('post_type') || error.code === '42703') {
          const { error: retryError } = await supabase.from('community_feed').insert({
            user_name: userName,
            user_initials: initials,
            action_text: input.body,
            image_url: input.image_url,
            user_id: user.id,
          });
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};
