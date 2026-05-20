import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Complaint } from '@/features/complaint/types';
import { complaintKeys } from './use-complaints';

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Complaint> & { id: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('You must be signed in to update a complaint');
      }

      const { id, ...fields } = updates;

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
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
};
