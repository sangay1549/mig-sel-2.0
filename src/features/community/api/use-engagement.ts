import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Engagement } from '../types';

export const engagementKeys = {
  all: ['engagements'] as const,
  byTicket: (ticketId: string) => [...engagementKeys.all, 'ticket', ticketId] as const,
  byUser: (userId: string) => [...engagementKeys.all, 'user', userId] as const,
};

export const useTicketEngagements = (ticketId: string) => {
  return useQuery({
    queryKey: engagementKeys.byTicket(ticketId),
    queryFn: async (): Promise<Engagement[]> => {
      const { data, error } = await supabase
        .from('engagements')
        .select(
          `
          *,
          user:profiles (id, full_name, avatar_url)
        `,
        )
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Engagement[];
    },
    enabled: !!ticketId,
  });
};

export const useUserEngagement = (ticketId: string, userId: string) => {
  return useQuery({
    queryKey: [...engagementKeys.byTicket(ticketId), 'user', userId],
    queryFn: async (): Promise<Engagement | null> => {
      const { data, error } = await supabase
        .from('engagements')
        .select(
          `
          *,
          user:profiles (id, full_name, avatar_url)
        `,
        )
        .eq('ticket_id', ticketId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return (data ?? null) as unknown as Engagement | null;
    },
    enabled: !!ticketId && !!userId,
  });
};
