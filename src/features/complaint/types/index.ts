export type ComplaintCategory = 'road' | 'garbage' | 'lighting' | 'drainage' | 'other';

export type ComplaintUrgency = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved';

export type Complaint = {
  id: string;
  title: string;
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  status: ComplaintStatus;
  description: string;
  reporter: string;
  reportedAt: string;
  resolvedAt: string | null;
  lat: number;
  lng: number;
};
