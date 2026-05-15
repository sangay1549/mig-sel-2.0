import type { Database } from '@/types/database';

type TicketRow = Database['public']['Tables']['tickets']['Row'];
type CoordinateRow = Database['public']['Tables']['coordinates']['Row'];
type MediaRow = Database['public']['Tables']['media']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export type TicketStatus = TicketRow['status'];
export type PriorityLevel = TicketRow['priority_level'];

export type Ticket = TicketRow & {
  coordinates?: CoordinateRow;
  media?: MediaRow[];
  category?: CategoryRow;
  reporter?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  user_engagement?: 'upvote' | 'comment' | 'follow' | null;
};

export type TicketDetail = Ticket & {
  engagements?: Array<{
    id: string;
    type: 'upvote' | 'comment' | 'follow';
    body: string | null;
    created_at: string;
    user: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }>;
  support_count: number;
  comment_count?: number;
};

export type TicketListFilters = {
  status?: TicketStatus;
  category_id?: string;
  priority_level?: PriorityLevel;
  search?: string;
  nearby_lat?: number;
  nearby_lng?: number;
  radius_meters?: number;
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const TICKET_STATUS_FLOW: TicketStatus[] = [
  'submitted',
  'in_review',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
];

export const CATEGORIES: Array<{ id: string; name: string; slug: string; dept_name: string }> = [
  { id: '1', name: 'Road Damage', slug: 'road-damage', dept_name: 'Dept of Transport' },
  { id: '2', name: 'Streetlight', slug: 'streetlight', dept_name: 'Dept of Energy' },
  { id: '3', name: 'Drainage', slug: 'drainage', dept_name: 'Dept of Water & Sanitation' },
  { id: '4', name: 'Waste Management', slug: 'waste-management', dept_name: 'Dept of Waste' },
  {
    id: '5',
    name: 'Water Leakage',
    slug: 'water-leakage',
    dept_name: 'Dept of Water & Sanitation',
  },
  { id: '6', name: 'Electrical Fault', slug: 'electrical-fault', dept_name: 'Dept of Energy' },
  { id: '7', name: 'Illegal Dumping', slug: 'illegal-dumping', dept_name: 'Dept of Waste' },
  { id: '8', name: 'Other', slug: 'other', dept_name: 'General Triage' },
];
