export type UserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  points: number;
  role: string | null;
};

export type LeaderboardEntry = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  points: number;
  rank: number;
};
