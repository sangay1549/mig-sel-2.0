import { Target } from 'lucide-react';
import { useCommunityGoal } from '../api/use-community-feed';

export const ImpactGoals = () => {
  const { data: goal, isLoading } = useCommunityGoal();

  if (isLoading || !goal) return null;

  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);

  return (
    <div className="mb-3 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-sm shadow-emerald-200">
      <div className="px-3.5 py-3">
        <div className="mb-1.5 flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-emerald-100" />
          <span className="text-[10px] font-semibold tracking-wide text-emerald-100 uppercase">
            Community Goal
          </span>
          <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
            {pct}%
          </span>
        </div>
        <h3 className="mb-0.5 text-sm font-bold text-white">{goal.title}</h3>
        <p className="mb-2 text-[11px] text-emerald-100">
          {goal.current}/{goal.target} {goal.unit}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
