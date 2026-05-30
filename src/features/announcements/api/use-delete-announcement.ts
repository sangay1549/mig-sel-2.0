import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { announcementKeys } from './use-official-announcements';
import { communityKeys } from '@/features/community/api/use-community-feed';

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: number) => {
      const { data: ann } = await supabase
        .from('official_announcements')
        .select('body, author_id')
        .eq('id', announcementId)
        .single();

      const { error } = await supabase
        .from('official_announcements')
        .delete()
        .eq('id', announcementId);
      if (error) throw error;

      if (ann) {
        const { error: feedError } = await supabase
          .from('community_feed')
          .delete()
          .eq('action_text', ann.body)
          .eq('user_id', ann.author_id);
        if (feedError) throw feedError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};
