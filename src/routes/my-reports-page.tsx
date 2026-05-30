import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { FeedItem } from '@/features/community/components/feed-item';
import type { ActivityItem, FeedStatus } from '@/features/community/types';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

export const MyReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ['my-reports', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res: PostgrestSingleResponse<Record<string, unknown>[]> = await supabase
        .from('community_feed')
        .select('id, user_name, user_initials, action_text, location, image_url, created_at, upvote_count, comment_count, user_id, status, is_official, official_department, is_pinned, is_emergency, announcement_category, post_type')
        .eq('user_id', user!.id)
        .eq('post_type', 'grievance')
        .order('created_at', { ascending: false });

      const rows = res.data ?? [];
      const items: ActivityItem[] = rows.map((row) => ({
        id: row.id as number,
        userName: (row.user_name as string) ?? '',
        userInitials: (row.user_initials as string) ?? '',
        action: (row.action_text as string) ?? '',
        location: (row.location as string) ?? '',
        timestamp: new Date((row.created_at as string) ?? Date.now()),
        upvoteCount: (row.upvote_count as number) ?? 0,
        commentCount: (row.comment_count as number) ?? 0,
        isUpvoted: false,
        image_url: (row.image_url as string) ?? undefined,
        userId: (row.user_id as string) ?? undefined,
        status: (row.status as FeedStatus) ?? undefined,
        isOfficial: (row.is_official as boolean) ?? undefined,
        department: (row.official_department as string) ?? undefined,
        isPinned: (row.is_pinned as boolean) ?? undefined,
        isEmergency: (row.is_emergency as boolean) ?? undefined,
        postType: (row.post_type as string) ?? undefined,
      }));
      return items;
    },
  });

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
          <h1 className="text-lg font-black text-foreground">My Reports</h1>
          <p className="text-xs text-muted-foreground">Issues you've submitted</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 rounded bg-gray-200" />
                  <div className="h-2.5 w-16 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 w-full rounded bg-gray-200" />
                <div className="h-2.5 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No reports yet.</p>
          <button
            onClick={() => navigate('/report')}
            className="gradient-green rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            Submit a Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <FeedItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
