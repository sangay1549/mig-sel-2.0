export type LeaderboardEntry = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  street: string | null;
  total_points: number;
  reports_count: number;
  supports_count: number;
  rank: number;
};

export type MonthlyChallenge = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
};
