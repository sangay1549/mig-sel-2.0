import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { announcementKeys } from './use-official-announcements';
import { communityKeys } from '@/features/community/api/use-community-feed';

export const useTogglePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: number) => {
      const { error } = await supabase.rpc('toggle_announcement_pin', {
        p_announcement_id: announcementId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};
