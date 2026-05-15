import { z } from 'zod';

export const createEngagementSchema = z.object({
  ticket_id: z.string().min(1),
  type: z.enum(['upvote', 'comment', 'follow']),
  body: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long').optional(),
});

export type CreateEngagementValues = z.infer<typeof createEngagementSchema>;
