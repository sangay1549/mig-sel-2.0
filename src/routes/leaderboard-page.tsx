import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/features/gamification/components/leaderboard';
import { useUserProfile } from '@/features/gamification/api/use-user-profile';

export const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-600">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {profile && (
            <div className="rounded-xl border bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase">
                Your Points
              </p>
              <p className="text-xl font-bold text-gray-900">{profile.points}</p>
            </div>
          )}
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Top contributors ranked by points earned from complaints
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};
