import { Trophy, Medal, Award, Loader2, User } from 'lucide-react';
import { useLeaderboard } from '@/features/gamification/api/use-leaderboard';

const rankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return null;
};

const rankBg = (rank: number) => {
  if (rank === 1) return 'bg-yellow-50 border-yellow-200';
  if (rank === 2) return 'bg-gray-50 border-gray-200';
  if (rank === 3) return 'bg-amber-50 border-amber-200';
  return 'border-gray-100';
};

export const Leaderboard = () => {
  const { data: entries, isLoading, isError, error } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load leaderboard: {error?.message}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Trophy className="mb-2 h-12 w-12" />
        <p className="text-sm font-medium">No points earned yet</p>
        <p className="mt-1 text-xs">Submit complaints and get them acknowledged to earn points!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${rankBg(entry.rank)}`}
        >
          <div className="flex w-8 items-center justify-center">
            {rankIcon(entry.rank) ?? (
              <span className="text-sm font-bold text-gray-400">{entry.rank}</span>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{entry.username ?? 'Anonymous'}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{entry.points}</p>
            <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
              {entry.points === 1 ? 'Point' : 'Points'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
