export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          device_id_hash: string | null;
          total_points: number;
          street: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          device_id_hash?: string | null;
          total_points?: number;
          street?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          device_id_hash?: string | null;
          total_points?: number;
          street?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          dept_name: string;
          dept_head_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          dept_name: string;
          dept_head_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          dept_name?: string;
          dept_head_id?: string | null;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          reporter_id: string | null;
          category_id: string;
          description: string;
          status: 'submitted' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
          priority_level: 'normal' | 'urgent';
          is_anonymous: boolean;
          location_name: string | null;
          support_count: number;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          category_id: string;
          description: string;
          status?: 'submitted' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
          priority_level?: 'normal' | 'urgent';
          is_anonymous?: boolean;
          location_name?: string | null;
          support_count?: number;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          reporter_id?: string | null;
          category_id?: string;
          description?: string;
          status?: 'submitted' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
          priority_level?: 'normal' | 'urgent';
          is_anonymous?: boolean;
          location_name?: string | null;
          support_count?: number;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
        };
      };
      coordinates: {
        Row: {
          id: string;
          ticket_id: string;
          latitude: number;
          longitude: number;
          accuracy_radius: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          latitude: number;
          longitude: number;
          accuracy_radius?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          latitude?: number;
          longitude?: number;
          accuracy_radius?: number | null;
          created_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          ticket_id: string;
          file_url: string;
          file_type: 'image' | 'video';
          is_completion_photo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          file_url: string;
          file_type?: 'image' | 'video';
          is_completion_photo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          file_url?: string;
          file_type?: 'image' | 'video';
          is_completion_photo?: boolean;
          created_at?: string;
        };
      };
      engagements: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          type: 'upvote' | 'comment' | 'follow';
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          type: 'upvote' | 'comment' | 'follow';
          body?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          type?: 'upvote' | 'comment' | 'follow';
          body?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          ticket_id: string | null;
          type: 'status_change' | 'assignment' | 'resolution' | 'escalation' | 'emergency';
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticket_id?: string | null;
          type: 'status_change' | 'assignment' | 'resolution' | 'escalation' | 'emergency';
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticket_id?: string | null;
          type?: 'status_change' | 'assignment' | 'resolution' | 'escalation' | 'emergency';
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      monthly_challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
