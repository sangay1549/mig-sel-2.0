import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ticketsKeys } from './use-tickets';
import type { Ticket } from '../types';

export const useNearbyTickets = (
  latitude: number,
  longitude: number,
  radiusMeters: number = 50,
) => {
  return useQuery({
    queryKey: ticketsKeys.nearby(latitude, longitude, radiusMeters),
    queryFn: async (): Promise<Ticket[]> => {
      const { data, error } = await supabase.rpc('get_nearby_tickets', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_meters: radiusMeters,
      });

      if (error) {
        const { data: fallback, error: fallbackError } = await supabase
          .from('tickets')
          .select(
            `
            *,
            coordinates (*),
            media (*),
            category:categories (*)
          `,
          )
          .not('status', 'in', '("resolved","closed")')
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        return (fallback ?? []) as unknown as Ticket[];
      }

      return (data ?? []) as unknown as Ticket[];
    },
    enabled: Number.isFinite(latitude) && Number.isFinite(longitude),
  });
};
