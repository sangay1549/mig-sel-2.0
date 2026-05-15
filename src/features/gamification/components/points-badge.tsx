import { useUserPoints } from '../api/use-gamification';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';

type PointsBadgeProps = {
  className?: string;
};

export const PointsBadge = ({ className }: PointsBadgeProps) => {
  const { user } = useCurrentUser();
  const { data: points } = useUserPoints(user?.id ?? '');

  if (!user) return null;

  return (
    <span
      className={cn(
        'bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        className,
      )}
    >
      <Award className="size-3.5" />
      {points?.total_points ?? 0} pts
    </span>
  );
};
