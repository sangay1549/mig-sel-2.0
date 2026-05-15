import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ticketsKeys } from './use-tickets';
import type { TicketDetail } from '../types';

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ticketsKeys.detail(id),
    queryFn: async (): Promise<TicketDetail | null> => {
      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          coordinates (*),
          media (*),
          category:categories (*),
          engagements (
            id,
            type,
            body,
            created_at,
            user:profiles (id, full_name, avatar_url)
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const ticket = data as unknown as TicketDetail;
      const supportCount = ticket.engagements?.filter((e) => e.type === 'upvote').length ?? 0;
      const commentCount = ticket.engagements?.filter((e) => e.type === 'comment').length ?? 0;

      return {
        ...ticket,
        support_count: supportCount,
        comment_count: commentCount,
      };
    },
    enabled: !!id,
  });
};
