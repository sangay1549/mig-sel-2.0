import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { announcementKeys } from './use-official-announcements';
import { communityKeys } from '@/features/community/api/use-community-feed';
import type { AnnouncementCategory } from '../types';

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  category: AnnouncementCategory;
  is_emergency: boolean;
  department: string | null;
  image_url: string | null;
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (input: CreateAnnouncementInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      const userName = profile?.username ?? 'GMC Official';
      const department = input.department ?? profile?.username ?? 'GMC Official';
      const initials = userName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const { data: announcement, error } = await supabase
        .from('official_announcements')
        .insert({
          title: input.title,
          body: input.body,
          category: input.category,
          is_emergency: input.is_emergency,
          is_pinned: input.is_emergency,
          department,
          author_id: user.id,
          image_url: input.image_url,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Also insert into community_feed so it appears in the feed
      const { error: feedError } = await supabase.from('community_feed').insert({
        user_name: userName,
        user_initials: initials,
        action_text: input.body,
        user_id: user.id,
        image_url: input.image_url,
        is_official: true,
        official_department: department,
        is_pinned: input.is_emergency,
        is_emergency: input.is_emergency,
        announcement_category: input.category,
        post_type: 'announcement',
      });

      if (feedError) {
        // Some columns may not exist if migrations haven't been applied yet
        // Try again with only the core columns
        const { error: retryError } = await supabase.from('community_feed').insert({
          user_name: userName,
          user_initials: initials,
          action_text: input.body,
          user_id: user.id,
          image_url: input.image_url,
          post_type: 'announcement',
        });
        if (retryError) {
          console.warn('Failed to add announcement to community_feed:', retryError.message);
        }
      }

      return announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};
