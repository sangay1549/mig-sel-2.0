import { useNavigate } from 'react-router-dom';
import { ActivityFeed } from '@/features/community/components/activity-feed';
import { ArrowLeft } from 'lucide-react';

export const CommunityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground">Community Feed</h1>
          <p className="text-xs text-muted-foreground">Stay updated with your city</p>
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
};
