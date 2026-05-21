import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Complaint, ComplaintStatus } from '@/features/complaint/types';
import { complaintKeys } from './use-complaints';

const awardPoints = async (userId: string, points: number) => {
  if (!userId) return;
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single();

  const currentPoints = profile?.points ?? 0;
  await supabase
    .from('profiles')
    .update({ points: currentPoints + points })
    .eq('id', userId);
};

const POINTS_MAP: Partial<Record<ComplaintStatus, number>> = {
  pending: 2,
  resolved: 3,
};

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Complaint> & { id: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('You must be signed in to update a complaint');
      }

      const { id, ...fields } = updates;

      const { data: current } = await supabase
        .from('grievances')
        .select('status, reporter_id')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('grievances')
        .update(fields)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(
          'No matching grievance found to update. This is likely due to database ' +
            'Row-Level Security (RLS) — the grievances table needs an UPDATE policy ' +
            'that allows the current user to modify records. ' +
            'Run the RLS migration in supabase/migrations/ to fix this.',
        );
      }

      if (current && fields.status && fields.status !== current.status) {
        const pts = POINTS_MAP[fields.status];
        if (pts && current.reporter_id) {
          await awardPoints(current.reporter_id, pts);
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
};
