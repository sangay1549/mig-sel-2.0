import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry, MonthlyChallenge } from '../types';

export const gamificationKeys = {
  all: ['gamification'] as const,
  leaderboard: () => [...gamificationKeys.all, 'leaderboard'] as const,
  streetLeaderboard: (street: string) => [...gamificationKeys.all, 'street', street] as const,
  challenges: () => [...gamificationKeys.all, 'challenges'] as const,
  userPoints: (userId: string) => [...gamificationKeys.all, 'user', userId] as const,
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(),
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, street, total_points')
        .order('total_points', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data ?? []).map((profile, index) => ({
        user_id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        street: profile.street,
        total_points: profile.total_points ?? 0,
        reports_count: 0,
        supports_count: 0,
        rank: index + 1,
      })) as LeaderboardEntry[];
    },
  });
};

export const useStreetLeaderboard = (street: string) => {
  return useQuery({
    queryKey: gamificationKeys.streetLeaderboard(street),
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, street, total_points')
        .eq('street', street)
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data ?? []).map((profile, index) => ({
        user_id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        street: profile.street,
        total_points: profile.total_points ?? 0,
        reports_count: 0,
        supports_count: 0,
        rank: index + 1,
      })) as LeaderboardEntry[];
    },
    enabled: !!street,
  });
};

export const useMonthlyChallenges = () => {
  return useQuery({
    queryKey: gamificationKeys.challenges(),
    queryFn: async (): Promise<MonthlyChallenge[]> => {
      const { data, error } = await supabase
        .from('monthly_challenges')
        .select('*')
        .eq('is_active', true)
        .order('end_date', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useUserPoints = (userId: string) => {
  return useQuery({
    queryKey: gamificationKeys.userPoints(userId),
    queryFn: async (): Promise<{ total_points: number; street: string | null }> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_points, street')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { total_points: data?.total_points ?? 0, street: data?.street ?? null };
    },
    enabled: !!userId,
  });
};
