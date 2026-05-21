export type UserProfile = {
  id: string;
  username: string | null;
  points: number;
  role: string | null;
};

export type LeaderboardEntry = {
  id: string;
  username: string | null;
  points: number;
  rank: number;
};
