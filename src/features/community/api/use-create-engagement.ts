import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { engagementKeys } from './use-engagement';
import { ticketsKeys } from '@/features/tickets/api/use-tickets';
import type { CreateEngagementValues } from '../schemas/engagement-schema';

export const useCreateEngagement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateEngagementValues) => {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      if (!userId) throw new Error('Must be logged in to engage');

      const { data: existing } = await supabase
        .from('engagements')
        .select('id')
        .eq('ticket_id', values.ticket_id)
        .eq('user_id', userId)
        .eq('type', values.type)
        .maybeSingle();

      if (existing && values.type === 'upvote') {
        throw new Error('You have already supported this issue');
      }

      const { data, error } = await supabase
        .from('engagements')
        .insert({
          ticket_id: values.ticket_id,
          user_id: userId,
          type: values.type,
          body: values.body ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      if (values.type === 'upvote') {
        const { count } = await supabase
          .from('engagements')
          .select('*', { count: 'exact', head: true })
          .eq('ticket_id', values.ticket_id)
          .eq('type', 'upvote');

        if (count && count >= 10) {
          await supabase
            .from('tickets')
            .update({ priority_level: 'urgent' })
            .eq('id', values.ticket_id);

          await supabase.from('notifications').insert({
            user_id: 'admin',
            ticket_id: values.ticket_id,
            type: 'escalation',
            title: 'Priority Escalated',
            message: `Ticket has received 10+ supports and been escalated to urgent.`,
          });
        }

        await supabase
          .from('tickets')
          .update({ support_count: count ?? 0 })
          .eq('id', values.ticket_id);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.byTicket(variables.ticket_id) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.ticket_id) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
};
