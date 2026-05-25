import { Loader2, User, TrendingUp } from 'lucide-react';
import { useLeaderboard } from '@/features/gamification/api/use-leaderboard';
import { useSession } from '@/features/auth/api/use-session';

const Avatar = ({
  url,
  username,
  className = '',
}: {
  url: string | null;
  username: string | null;
  className?: string;
}) => {
  if (url) {
    return (
      <img
        src={url}
        alt={username ?? 'Avatar'}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  const initials = (username ?? '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (initials) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-bold text-gray-600 ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full bg-gray-100 ${className}`}>
      <User className="h-5 w-5 text-gray-400" />
    </div>
  );
};

export const Leaderboard = () => {
  const { data: entries, isLoading, isError, error } = useLeaderboard();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-gray-500">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-6 text-center">
        <p className="text-sm font-medium text-red-600">
          Failed to load leaderboard: {error?.message}
        </p>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
          <TrendingUp className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-lg font-bold text-gray-900">No points earned yet</p>
        <p className="mt-1 max-w-xs text-center text-sm text-gray-500">
          Submit complaints and get them acknowledged to earn points and climb the ranks!
        </p>
      </div>
    );
  }

  const topFive = entries.slice(0, 5);
  const currentUserEntry = entries.find((e) => e.id === currentUserId);
  const isUserInTop5 = currentUserEntry && currentUserEntry.rank <= 5;

  return (
    <div className="space-y-1.5">
      {topFive.map((entry) => (
        <LeaderboardRow key={entry.id} entry={entry} currentUserId={currentUserId} />
      ))}

      {currentUserEntry && !isUserInTop5 && (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dashed border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Your Ranking
              </span>
            </div>
          </div>
          <LeaderboardRow entry={currentUserEntry} currentUserId={currentUserId} isCurrentUser />
        </>
      )}
    </div>
  );
};

const LeaderboardRow = ({
  entry,
  currentUserId,
  isCurrentUser,
}: {
  entry: {
    id: string;
    rank: number;
    avatar_url: string | null;
    username: string | null;
    points: number;
  };
  currentUserId: string | undefined;
  isCurrentUser?: boolean;
}) => (
  <div
    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 ${
      isCurrentUser
        ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/50 ring-2 ring-emerald-400/40'
        : 'bg-white ring-1 ring-gray-100 hover:ring-gray-200'
    }`}
  >
    <div className="flex w-9 shrink-0 items-center justify-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-bold text-gray-500">
        {entry.rank}
      </div>
    </div>
    <Avatar
      url={entry.avatar_url}
      username={entry.username}
      className="h-9 w-9 shrink-0 shadow-sm ring-2 ring-white"
    />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-gray-900">{entry.username ?? 'Anonymous'}</p>
      {entry.id === currentUserId && (
        <p className="text-[10px] font-semibold text-emerald-600">You</p>
      )}
    </div>
    <div className="shrink-0">
      <div className="flex items-baseline gap-1 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 px-2.5 py-1.5">
        <span className="text-base font-black text-gray-800">{entry.points}</span>
        <span className="text-[10px] font-semibold text-gray-400">
          {entry.points === 1 ? 'pt' : 'pts'}
        </span>
      </div>
    </div>
  </div>
);
