import type { Database } from '@/types/database';

type EngagementRow = Database['public']['Tables']['engagements']['Row'];

export type EngagementType = EngagementRow['type'];

export type Engagement = EngagementRow & {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};
