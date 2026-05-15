import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ticketsKeys } from '@/features/tickets/api/use-tickets';
import type { Ticket } from '@/features/tickets/types';

export const adminKeys = {
  all: ['admin'] as const,
  tickets: () => [...adminKeys.all, 'tickets'] as const,
  analytics: () => [...adminKeys.all, 'analytics'] as const,
};

export const useAdminTickets = () => {
  return useQuery({
    queryKey: adminKeys.tickets(),
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Ticket[];
    },
  });
};

export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      priority_level,
    }: {
      ticketId: string;
      priority_level: 'normal' | 'urgent';
    }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ priority_level, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;

      if (priority_level === 'urgent') {
        await supabase.from('notifications').insert({
          user_id: 'admin',
          ticket_id: ticketId,
          type: 'emergency',
          title: 'Urgent Complaint',
          message: 'A complaint has been marked as urgent and requires immediate attention.',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.tickets() });
    },
  });
};
