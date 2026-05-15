import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MapTicketPin } from '../types';

export const mapKeys = {
  all: ['map'] as const,
  pins: (bounds?: string) => [...mapKeys.all, 'pins', bounds] as const,
};

export const useMapTickets = (bounds?: string) => {
  return useQuery({
    queryKey: mapKeys.pins(bounds),
    queryFn: async (): Promise<MapTicketPin[]> => {
      const query = supabase
        .from('tickets')
        .select(
          `
          id,
          description,
          status,
          priority_level,
          support_count,
          created_at,
          coordinates (latitude, longitude),
          category:categories (name)
        `,
        )
        .not('status', 'in', '("closed")')
        .order('created_at', { ascending: false });

      if (bounds) {
        void bounds;
      }

      const { data, error } = await query;
      if (error) throw error;

      return ((data ?? []) as Record<string, unknown>[]).map((item) => {
        const coords = item.coordinates as { latitude: number; longitude: number } | null;
        const cat = item.category as { name: string } | null;
        return {
          id: item.id as string,
          latitude: coords?.latitude ?? 0,
          longitude: coords?.longitude ?? 0,
          status: item.status as string,
          priority_level: item.priority_level as string,
          category_name: cat?.name ?? 'Unknown',
          support_count: item.support_count as number,
          description: (item.description as string).slice(0, 100),
          created_at: item.created_at as string,
        };
      });
    },
  });
};
