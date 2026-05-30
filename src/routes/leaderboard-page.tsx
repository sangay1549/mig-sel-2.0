import { useNavigate } from 'react-router-dom';
import { Leaderboard } from '@/features/gamification/components/leaderboard';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

export const LeaderboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground">Leaderboard</h1>
          <p className="text-xs text-muted-foreground">Top contributors in Gelephu</p>
        </div>
      </div>

      <div className="animate-slide-up grid grid-cols-3 gap-2">
        {[
          { icon: Trophy, label: '1st', color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Medal, label: '2nd', color: 'text-gray-500', bg: 'bg-gray-50' },
          { icon: Award, label: '3rd', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ icon: Icon, label, color, bg }) => (
          <div key={label} className={`flex flex-col items-center gap-1.5 rounded-xl ${bg} p-3`}>
            <Icon className={`h-5 w-5 ${color}`} />
            <span className={`text-xs font-bold ${color}`}>{label} Place</span>
          </div>
        ))}
      </div>

      <div className="animate-slide-up stagger-1 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
        <Leaderboard />
      </div>
    </div>
  );
};
