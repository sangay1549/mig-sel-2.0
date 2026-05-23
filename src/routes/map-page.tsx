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
    <div className="bg-background min-h-screen font-sans">
      <nav className="border-border bg-card/80 shadow-elevated sticky top-0 z-50 flex h-14 items-center justify-between border-b px-3 backdrop-blur-xl md:h-16 md:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-xl md:h-9 md:w-9">
            <LeafIcon className="text-primary-foreground h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-primary -mb-0.5 text-sm font-bold tracking-tight md:text-base">
              Migsel
            </span>
            <span className="text-muted-foreground hidden text-[10px] font-semibold tracking-wider uppercase sm:block">
              Complaint Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-2 rounded-full px-4 text-xs font-bold shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 md:h-auto md:px-5 md:text-sm"
          >
            <Camera className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Report</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/leaderboard')}
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-9 gap-1.5 px-2.5 text-xs font-semibold md:h-auto md:px-3 md:text-sm"
          >
            <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/shop')}
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-9 gap-1.5 px-2.5 text-xs font-semibold md:h-auto md:px-3 md:text-sm"
          >
            <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Shop</span>
          </Button>
          {isAdmin ? (
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-9 gap-1.5 px-2.5 text-xs font-semibold md:h-auto md:px-3 md:text-sm"
            >
              <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-9 gap-1.5 px-2.5 text-xs font-semibold md:h-auto md:px-3 md:text-sm"
            >
              <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">
                {signOut.isPending ? 'Signing out...' : 'Exit'}
              </span>
            </Button>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="bg-primary/10 text-primary mb-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">
                <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
                Public Map
              </div>
              <h1 className="text-foreground text-xl font-bold tracking-tight md:text-2xl">
                Report an Issue
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Pin a location on the map to report a community concern
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3 md:mt-0">
              <div className="bg-card border-border flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-xs">
                <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold">
                  4
                </span>
                <span className="text-muted-foreground text-xs font-medium">
                  max pts per report
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card border-border shadow-card overflow-hidden rounded-2xl border md:rounded-3xl">
          <div className="border-border flex items-center justify-between border-b px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg md:h-8 md:w-8">
                <span className="text-primary text-xs font-bold md:text-sm">&#x2302;</span>
              </div>
              <span className="text-foreground text-sm font-semibold">Interactive Map</span>
            </div>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
              Tap to place a pin
            </span>
          </div>
          <GrievanceMap />
        </div>
      </main>
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
