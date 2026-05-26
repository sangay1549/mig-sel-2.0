import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { grievanceKeys } from '../api/use-grievances';
import { leaderboardKeys } from '@/features/gamification/api/use-leaderboard';
import { profileKeys } from '@/features/gamification/api/use-user-profile';
import { awardPointsForSubmission } from '@/features/complaint/utils/award-points';

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

  return useMutation({
    mutationFn: async (input: GrievanceInput) => {
      const { data, error } = await supabase.from('grievances').insert(input).select().single();

      if (error) throw error;

      await awardPointsForSubmission(input.reporter_id, data.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grievanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.all() });
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
  });
};
