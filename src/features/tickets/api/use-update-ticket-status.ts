import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ticketsKeys } from './use-tickets';
import type { UpdateTicketStatusValues } from '../schemas/ticket-schema';

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      values,
    }: {
      ticketId: string;
      values: UpdateTicketStatusValues;
    }) => {
      const updateData: Record<string, unknown> = {
        status: values.status,
        updated_at: new Date().toISOString(),
      };

      if (values.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error: ticketError } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (ticketError) throw ticketError;

      if (values.completion_photo && values.status === 'resolved') {
        const fileExt = values.completion_photo.name.split('.').pop();
        const fileName = `${ticketId}/completion/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('ticket-media')
          .upload(fileName, values.completion_photo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('ticket-media').getPublicUrl(fileName);

        const { error: mediaError } = await supabase.from('media').insert({
          ticket_id: ticketId,
          file_url: urlData.publicUrl,
          file_type: 'image',
          is_completion_photo: true,
        });

        if (mediaError) throw mediaError;
      }

      if (!values.completion_photo && values.status === 'resolved') {
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: 'system',
          ticket_id: ticketId,
          type: 'resolution',
          title: 'Resolution requires photo',
          message: 'Please upload a completion photo to verify the fix.',
        });

        if (notifError) throw notifError;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
};
