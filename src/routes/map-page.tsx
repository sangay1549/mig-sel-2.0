import { useState } from 'react';
import { GrievanceMap } from '@/features/auth/grievance/components/grievance-map.tsx';
import { GrievanceDrawer } from '@/features/auth/grievance/components/grievance-drawer.tsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { LogOut, LayoutDashboard, Trophy, ShoppingBag, Camera } from 'lucide-react';
import { LeafIcon } from '@/components/ui/leaf-icon';
import { useIsAdmin } from '@/features/auth/api/use-is-admin';
import { useSignOut } from '@/features/auth/api/use-sign-out';

export const MapPage = () => {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="bg-background flex h-dvh flex-col overflow-hidden font-sans">
      <nav className="border-border bg-card/80 shadow-elevated z-50 flex h-12 shrink-0 items-center justify-between border-b px-2 backdrop-blur-xl md:h-16 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-xl md:h-9 md:w-9">
            <LeafIcon className="text-primary-foreground h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="text-primary text-sm font-bold tracking-tight md:text-base">Migsel</span>
        </div>
        <div className="flex items-center gap-0.5 md:gap-2">
          <Button
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 gap-1 rounded-full px-3 text-[10px] font-bold shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 md:h-auto md:gap-2 md:px-5 md:text-sm"
          >
            <Camera className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Report</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/leaderboard')}
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-1 px-1.5 text-[10px] font-semibold md:h-auto md:gap-1.5 md:px-3 md:text-sm"
          >
            <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/shop')}
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-1 px-1.5 text-[10px] font-semibold md:h-auto md:gap-1.5 md:px-3 md:text-sm"
          >
            <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Shop</span>
          </Button>
          {isAdmin ? (
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-1 px-1.5 text-[10px] font-semibold md:h-auto md:gap-1.5 md:px-3 md:text-sm"
            >
              <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-1 px-1.5 text-[10px] font-semibold md:h-auto md:gap-1.5 md:px-3 md:text-sm"
            >
              <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">
                {signOut.isPending ? 'Signing out...' : 'Exit'}
              </span>
            </Button>
          )}
        </div>
      </nav>

      <GrievanceMap />
      {isDrawerOpen && (
        <GrievanceDrawer
          onClose={() => {
            setIsDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
};
