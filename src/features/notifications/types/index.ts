import type { Database } from '@/types/database';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export type NotificationType = NotificationRow['type'];
export type Notification = NotificationRow;
