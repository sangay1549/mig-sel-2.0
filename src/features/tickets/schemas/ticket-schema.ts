import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const createTicketSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  is_anonymous: z.boolean().default(false),
  location_name: z.string().optional(),
  latitude: z.number({ message: 'Location is required' }),
  longitude: z.number({ message: 'Location is required' }),
  accuracy_radius: z.number().optional(),
  image: z
    .instanceof(File)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only JPEG, JPG & PNG allowed')
    .refine((file) => file.size <= MAX_IMAGE_SIZE, 'Image must be less than 10MB')
    .nullable()
    .optional(),
});

export type CreateTicketValues = z.infer<typeof createTicketSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.enum(['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed']),
  note: z.string().optional(),
  completion_photo: z.instanceof(File).nullable().optional(),
});

export type UpdateTicketStatusValues = z.infer<typeof updateTicketStatusSchema>;

export const ticketFilterSchema = z.object({
  status: z.string().optional(),
  category_id: z.string().optional(),
  priority_level: z.enum(['normal', 'urgent']).optional(),
  search: z.string().optional(),
});

export type TicketFilterValues = z.infer<typeof ticketFilterSchema>;
