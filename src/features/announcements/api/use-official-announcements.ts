import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import type { OfficialAnnouncement } from '../types';

export const announcementKeys = {
  all: ['announcements'] as const,
  my: (userId?: string) => [...announcementKeys.all, 'my', userId] as const,
};

export const useOfficialAnnouncements = () => {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: announcementKeys.my(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('official_announcements')
        .select('*')
        .eq('author_id', user.id)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as OfficialAnnouncement[];
    },
    enabled: !!user?.id,
  });
};
