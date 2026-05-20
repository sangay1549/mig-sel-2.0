import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Complaint } from '@/features/complaint/types';

export const complaintKeys = {
  all: ['complaints'] as const,
  lists: () => [...complaintKeys.all, 'list'] as const,
  detail: (id: string) => [...complaintKeys.all, 'detail', id] as const,
};

export const useComplaints = () => {
  return useQuery({
    queryKey: complaintKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    },
  });
};
