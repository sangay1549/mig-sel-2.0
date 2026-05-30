import { useNavigate } from 'react-router';
import {
  Bell,
  Map,
  Users,
  ShoppingBag,
  Trophy,
  ChevronRight,
  Megaphone,
  AlertTriangle,
  BadgeCheck,
  MessageCircle,
  Heart,
  AlertCircle,
  Clock,
  CircleCheck,
} from 'lucide-react';
import { useHomeData } from '@/features/home/api/use-home-data';

const QUICK_ACCESS = [
  { icon: Map, label: 'Map', desc: 'View reports nearby', to: '/map', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Users, label: 'Community', desc: 'See what people share', to: '/community', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Trophy, label: 'Leaderboard', desc: 'Check your rank', to: '/leaderboard', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: ShoppingBag, label: 'Shop', desc: 'Redeem your points', to: '/shop', color: 'text-purple-600', bg: 'bg-purple-50' },
];

const METRIC_CONFIG = [
  { key: 'totalComplaints' as const, label: 'Total Reports', icon: AlertCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { key: 'inProgress' as const, label: 'In Progress', icon: Clock, bg: 'bg-orange-50', color: 'text-orange-500' },
  { key: 'resolved' as const, label: 'Resolved', icon: CircleCheck, bg: 'bg-green-50', color: 'text-green-600' },
];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const HomePage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useHomeData();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const stats = data?.stats;
  const announcements = data?.announcements ?? [];
  const updates = data?.nearbyUpdates ?? [];

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground">
            Hello, {data?.userName ?? 'there'}! 👋
          </h1>
          <p className="text-xs text-muted-foreground">Let's make Gelephu better together.</p>
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
          <Bell className="h-4 w-4" />
        </button>
      </div>

      {/* Announcements */}
      <div className="animate-slide-up">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Announcements</h2>
          <button
            onClick={() => navigate('/community?tab=official')}
            className="flex items-center gap-0.5 text-xs font-semibold text-primary"
          >
            See all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        {announcements.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm">
            <p className="text-xs text-muted-foreground">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`rounded-xl border p-4 shadow-sm ${
                  ann.is_emergency
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      ann.is_emergency ? 'bg-red-100' : 'bg-blue-100'
                    }`}
                  >
                    {ann.is_emergency ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Megaphone className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          ann.is_emergency ? 'text-red-800' : 'text-blue-800'
                        }`}
                      >
                        {ann.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          ann.is_emergency
                            ? 'bg-red-200/60 text-red-600'
                            : 'bg-blue-200/60 text-blue-700'
                        }`}
                      >
                        {ann.is_emergency ? 'Emergency' : ann.category}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 text-xs leading-relaxed line-clamp-2 ${
                        ann.is_emergency ? 'text-red-700' : 'text-blue-700'
                      }`}
                    >
                      {ann.body}
                    </p>
                    {ann.department && (
                      <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                        {ann.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access */}
      <div className="animate-slide-up stagger-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3.5 text-left shadow-sm transition-all hover:border-primary/30 active:scale-[0.98]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview */}
      <div className="animate-slide-up stagger-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Overview</h2>
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-0.5 text-xs font-semibold text-primary"
          >
            View on Map <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {METRIC_CONFIG.map((m) => (
            <div key={m.key} className="rounded-xl border border-border/50 bg-card p-3 text-center shadow-sm">
              <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg ${m.bg}`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <p className="text-base font-black text-foreground">
                {stats ? (stats[m.key]?.toLocaleString() ?? '--') : '--'}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Updates */}
      <div className="animate-slide-up stagger-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Recent Updates</h2>
          <button
            onClick={() => navigate('/community')}
            className="flex items-center gap-0.5 text-xs font-semibold text-primary"
          >
            See all <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {updates.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-6 text-center shadow-sm">
            <p className="text-xs text-muted-foreground">No recent updates.</p>
          </div>
        ) : (
          updates.map((item) => (
            <div key={item.id} className="mb-3 overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
              <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {item.userInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-foreground">{item.userName}</span>
                    {item.isVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(item.timestamp)} &middot; {item.location || 'Unknown'}
                  </p>
                </div>
              </div>

              <p className="px-4 pb-3 text-sm leading-relaxed text-gray-700">{item.action}</p>

              {item.image_url && (
                <div className="px-4 pb-3">
                  <img src={item.image_url} alt="" className="h-40 w-full rounded-lg object-cover" />
                </div>
              )}

              <div className="flex items-center gap-4 border-t border-border/30 px-4 py-2.5">
                <button className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-emerald-600">
                  <Heart className="h-[18px] w-[18px]" />
                  <span className="text-xs font-medium">{item.upvoteCount}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-primary">
                  <MessageCircle className="h-[18px] w-[18px]" />
                  <span className="text-xs font-medium">{item.commentCount}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
