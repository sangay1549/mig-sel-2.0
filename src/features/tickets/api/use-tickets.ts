import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Ticket, TicketListFilters } from '../types';

export const ticketsKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketsKeys.all, 'list'] as const,
  list: (filters: TicketListFilters) => [...ticketsKeys.lists(), filters] as const,
  details: () => [...ticketsKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketsKeys.details(), id] as const,
  nearby: (lat: number, lng: number, radius: number) =>
    [...ticketsKeys.all, 'nearby', lat, lng, radius] as const,
  user: (userId: string) => [...ticketsKeys.all, 'user', userId] as const,
};

export const useTickets = (filters?: TicketListFilters) => {
  return useQuery({
    queryKey: ticketsKeys.list(filters ?? {}),
    queryFn: async (): Promise<Ticket[]> => {
      let query = supabase
        .from('tickets')
        .select(
          `
          *,
          coordinates (*),
          media (*),
          category:categories (*)
        `,
        )
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.priority_level) {
        query = query.eq('priority_level', filters.priority_level);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Ticket[];
    },
  });
};

export const useUserTickets = (userId: string) => {
  return useQuery({
    queryKey: ticketsKeys.user(userId),
    queryFn: async (): Promise<Ticket[]> => {
      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          coordinates (*),
          media (*),
          category:categories (*)
        `,
        )
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Ticket[];
    },
    enabled: !!userId,
  });
};
