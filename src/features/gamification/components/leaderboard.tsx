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
        className={`from-muted to-muted/80 text-muted-foreground flex items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`bg-muted flex items-center justify-center rounded-full ${className}`}>
      <User className="text-muted-foreground h-5 w-5" />
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
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading leaderboard...</p>
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
        <div className="from-muted to-muted/50 mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br">
          <TrendingUp className="text-muted-foreground h-10 w-10" />
        </div>
        <p className="text-foreground text-lg font-bold">No points earned yet</p>
        <p className="text-muted-foreground mt-1 max-w-xs text-center text-sm">
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
              <span className="border-border w-full border-t border-dashed" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background text-muted-foreground px-3 text-xs font-bold tracking-wider uppercase">
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
        ? 'from-primary/5 to-primary/10 ring-primary/30 bg-gradient-to-r ring-2'
        : 'bg-card ring-border hover:ring-foreground/10 ring-1'
    }`}
  >
    <div className="flex w-9 shrink-0 items-center justify-center">
      <div className="from-muted to-muted/80 text-muted-foreground flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold">
        {entry.rank}
      </div>
    </div>
    <Avatar
      url={entry.avatar_url}
      username={entry.username}
      className="ring-background h-9 w-9 shrink-0 shadow-sm ring-2"
    />
    <div className="min-w-0 flex-1">
      <p className="text-foreground truncate text-sm font-bold">{entry.username ?? 'Anonymous'}</p>
      {entry.id === currentUserId && <p className="text-primary text-[10px] font-semibold">You</p>}
    </div>
    <div className="shrink-0">
      <div className="from-muted to-muted/80 flex items-baseline gap-1 rounded-lg bg-gradient-to-r px-2.5 py-1.5">
        <span className="text-foreground text-base font-black">{entry.points}</span>
        <span className="text-muted-foreground text-[10px] font-semibold">
          {entry.points === 1 ? 'pt' : 'pts'}
        </span>
      </div>
    </div>
  </div>
);
