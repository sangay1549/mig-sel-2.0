import { useNavigate } from 'react-router-dom';
import { Megaphone, Map, LogOut, X, User, Award, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSignOut } from '@/features/auth/api/use-sign-out';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useUserProfile } from '@/features/gamification/api/use-user-profile';

export const OfficialSidebar = ({
  isMobileOpen,
  onMobileClose,
}: {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) => {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const { user } = useCurrentUser();
  const { data: profile } = useUserProfile();

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? '?');

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/20 bg-white/70 backdrop-blur-xl transition-transform duration-300',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-5">
        <div className="flex items-center justify-center">
          <img src="/3d logo.png" alt="Logo" className="h-10 w-auto rounded-lg object-contain" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-foreground text-lg font-bold tracking-tight">Migsel</span>
          <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase">
            Official
          </span>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="hover:bg-accent ml-auto rounded-lg p-1.5 transition-all md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground/40 px-3 pb-2 text-[11px] font-semibold tracking-widest uppercase">
            Publishing Tools
          </span>
          <div className="group bg-primary/10 text-primary relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium">
            <div className="bg-primary absolute left-0 h-5 w-0.5 rounded-full" />
            <div className="flex h-5 w-5 items-center justify-center">
              <Megaphone className="h-4 w-4" />
            </div>
            <span>Announcements</span>
          </div>
        </div>
      </nav>

      <div className="border-t p-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/map')}
            className="group text-muted-foreground relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-300 ease-out outline-none hover:text-slate-900"
          >
            <span className="absolute inset-0 rounded-lg bg-slate-100/60 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100" />
            <div className="relative flex h-5 w-5 items-center justify-center transition-transform duration-300 ease-out group-hover:translate-x-0.5">
              <Map className="h-4 w-4" />
            </div>
            <span className="relative transition-all duration-300 ease-out group-hover:translate-x-0.5">
              Public Map
            </span>
          </button>
          <button
            onClick={() => navigate('/community')}
            className="group text-muted-foreground relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-300 ease-out outline-none hover:text-slate-900"
          >
            <span className="absolute inset-0 rounded-lg bg-slate-100/60 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100" />
            <div className="relative flex h-5 w-5 items-center justify-center transition-transform duration-300 ease-out group-hover:translate-x-0.5">
              <User className="h-4 w-4" />
            </div>
            <span className="relative transition-all duration-300 ease-out group-hover:translate-x-0.5">
              Community Feed
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {profile?.username ?? 'Official'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Award className="h-3 w-3" />
              <span>{profile?.role ?? 'official'}</span>
              <Coins className="ml-1 h-3 w-3" />
              <span>{profile?.points ?? 0}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signOut.isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};
