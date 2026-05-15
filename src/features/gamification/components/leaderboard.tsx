import { useLeaderboard } from '../api/use-gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';

export const Leaderboard = () => {
  const { data: entries, isLoading } = useLeaderboard();

  if (isLoading) {
    return <p className="text-muted-foreground py-4 text-center text-sm">Loading leaderboard…</p>;
  }

  if (!entries || entries.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        No contributors yet. Be the first to report an issue!
      </p>
    );
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="size-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="size-4 text-gray-400" />;
    if (rank === 3) return <Medal className="size-4 text-amber-600" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-5 text-yellow-500" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.user_id} className="flex items-center gap-3">
            <div className="flex w-8 items-center justify-center">
              {rankIcon(entry.rank) ?? (
                <span className="text-muted-foreground text-xs font-bold">{entry.rank}</span>
              )}
            </div>
            <div className="bg-muted flex size-8 items-center justify-center rounded-full text-sm font-bold">
              {entry.full_name?.[0] ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.full_name ?? 'Anonymous'}</p>
              {entry.street ? (
                <p className="text-muted-foreground truncate text-xs">{entry.street}</p>
              ) : null}
            </div>
            <div className="text-sm font-bold">
              {entry.total_points}
              <span className="text-muted-foreground text-xs font-normal"> pts</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
