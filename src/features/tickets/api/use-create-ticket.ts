import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ticketsKeys } from './use-tickets';
import type { CreateTicketValues } from '../schemas/ticket-schema';

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateTicketValues) => {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id ?? null;

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          reporter_id: values.is_anonymous ? null : userId,
          category_id: values.category_id,
          description: values.description,
          is_anonymous: values.is_anonymous,
          location_name: values.location_name ?? null,
          status: 'submitted',
          priority_level: 'normal',
        })
        .select()
        .single();

      if (ticketError) throw ticketError;
      if (!ticket) throw new Error('Failed to create ticket');

      const { error: coordError } = await supabase.from('coordinates').insert({
        ticket_id: ticket.id,
        latitude: values.latitude,
        longitude: values.longitude,
        accuracy_radius: values.accuracy_radius ?? null,
      });

      if (coordError) throw coordError;

      if (values.image) {
        const fileExt = values.image.name.split('.').pop();
        const fileName = `${ticket.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('ticket-media')
          .upload(fileName, values.image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('ticket-media').getPublicUrl(fileName);

        const { error: mediaError } = await supabase.from('media').insert({
          ticket_id: ticket.id,
          file_url: urlData.publicUrl,
          file_type: 'image',
          is_completion_photo: false,
        });

        if (mediaError) throw mediaError;
      }

      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
};
