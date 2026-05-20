import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const grievanceKeys = {
  all: ['grievances'] as const,
  lists: () => [...grievanceKeys.all, 'list'] as const,
};

interface GrievanceRow {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  image_url: string;
  resolved_image_url?: string;
  created_at: string;
}

export const useGrievances = () => {
  return useQuery({
    queryKey: grievanceKeys.lists(),
    queryFn: async (): Promise<GrievanceRow[]> => {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
