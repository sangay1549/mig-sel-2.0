export type AnnouncementCategory =
  | 'announcement'
  | 'emergency_alert'
  | 'project_update'
  | 'maintenance_notice';

export type OfficialAnnouncement = {
  id: number;
  title: string;
  body: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  is_emergency: boolean;
  department: string | null;
  author_id: string;
  image_url: string | null;
  published_at: string;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};
