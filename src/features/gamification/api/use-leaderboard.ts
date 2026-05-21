import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/features/gamification/types';

export const leaderboardKeys = {
  all: () => ['leaderboard'] as const,
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: leaderboardKeys.all(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, points')
        .gt('points', 0)
        .order('points', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map<LeaderboardEntry>((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    },
  });
};
