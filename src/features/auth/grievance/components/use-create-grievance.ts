import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { grievanceKeys } from '../api/use-grievances';
import { communityKeys } from '@/features/community/api/use-community-feed';

interface GrievanceInput {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  image_url: string;
  reporter_id: string | null;
}

export const useCreateGrievance = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (input: GrievanceInput) => {
      const { data, error } = await supabase
        .from('grievances')
        .insert({ ...input, status: 'pending', approved: false })
        .select()
        .single();

      if (error) throw error;

      const userId = input.reporter_id ?? user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single();

        const userName = profile?.username ?? 'Anonymous';
        const initials = userName
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        await supabase.from('community_feed').insert({
          user_name: userName,
          user_initials: initials,
          action_text: input.title,
          image_url: input.image_url || null,
          user_id: userId,
          post_type: 'grievance',
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grievanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};
