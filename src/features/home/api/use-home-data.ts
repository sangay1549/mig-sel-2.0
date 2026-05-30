import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import type { ActivityItem } from '@/features/community/types';

interface HomeStats {
  totalComplaints: number;
  inProgress: number;
  resolved: number;
  activeUsers: number;
}

interface Announcement {
  id: number;
  title: string;
  body: string;
  department: string;
  category: string;
  is_emergency: boolean;
  published_at: string;
}

interface HomeData {
  userName: string | null;
  stats: HomeStats;
  announcements: Announcement[];
  nearbyUpdates: ActivityItem[];
}

export const homeKeys = {
  all: ['home'] as const,
  data: () => [...homeKeys.all, 'data'] as const,
};

export const useHomeData = () => {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: homeKeys.data(),
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async (): Promise<HomeData> => {
      const [profile, totalComplaints, inProgress, resolved, activeUsers, announcements, feedData] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('username')
            .eq('id', user!.id)
            .single()
            .then((r) => (r.error ? null : r.data)),
          supabase.from('grievances').select('*', { count: 'exact', head: true }).then((r) => r.count ?? 0),
          supabase
            .from('grievances')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'in-progress'])
            .then((r) => r.count ?? 0),
          supabase
            .from('grievances')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'resolved')
            .then((r) => r.count ?? 0),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).then((r) => r.count ?? 0),
          supabase
            .from('official_announcements')
            .select('id, title, body, department, category, is_emergency, published_at')
            .order('published_at', { ascending: false })
            .limit(2)
            .then((r) => r.data as Announcement[] ?? []),
          supabase
            .from('community_feed')
            .select('id, user_name, user_initials, action_text, location, image_url, created_at, upvote_count, comment_count, user_id, is_official, official_department, is_pinned, is_emergency')
            .order('created_at', { ascending: false })
            .limit(3)
            .then((r) => r.data ?? []),
        ]);

      const userName = profile?.username ?? user?.user_metadata?.full_name ?? null;

      const nearbyUpdates: ActivityItem[] = feedData.map((row) => ({
        id: row.id,
        userName: row.user_name ?? '',
        userInitials: row.user_initials ?? '',
        action: row.action_text ?? '',
        location: row.location ?? '',
        timestamp: new Date(row.created_at),
        upvoteCount: row.upvote_count ?? 0,
        commentCount: row.comment_count ?? 0,
        isUpvoted: false,
        image_url: row.image_url ?? undefined,
        userId: row.user_id ?? undefined,
        isOfficial: row.is_official ?? undefined,
        isVerified: row.is_official ?? undefined,
        department: row.official_department ?? undefined,
        isPinned: row.is_pinned ?? undefined,
        isEmergency: row.is_emergency ?? undefined,
      }));

      return {
        userName,
        stats: {
          totalComplaints,
          inProgress,
          resolved,
          activeUsers,
        },
        announcements,
        nearbyUpdates,
      };
    },
  });
};
