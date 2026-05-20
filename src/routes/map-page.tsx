import { useState } from 'react';
import { GrievanceMap } from '@/features/auth/grievance/components/grievance-map.tsx';
import { GrievanceDrawer } from '@/features/auth/grievance/components/grievance-drawer.tsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useIsAdmin } from '@/features/auth/api/use-is-admin';

export const MapPage = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="bg-background min-h-screen font-sans">
      <nav className="border-border bg-card sticky top-0 z-50 flex h-14 items-center justify-between border-b px-3 md:h-16 md:px-6">
        <div className="flex items-center gap-2">
          <span className="md:text-label-lg text-primary text-sm font-bold tracking-wide">
            Migsel
          </span>
          <span className="bg-secondary-container text-on-secondary-container hidden rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase sm:inline">
            Complaint Portal
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="bg-primary text-primary-foreground h-9 text-xs font-medium md:h-auto md:text-sm"
          >
            + Report
          </Button>
          {isAdmin ? (
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-body-sm text-muted-foreground hover:text-primary text-xs font-medium md:text-sm"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin Dashboard
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-body-sm text-muted-foreground hover:text-primary text-xs font-medium md:text-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit
            </Button>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-2 py-3 md:px-4 md:py-6">
        <div className="mb-3 px-2 md:mb-6 md:px-0">
          <h1 className="md:text-headline-sm text-on-surface text-sm font-semibold">
            Report an Issue
          </h1>
          <p className="text-body-xs md:text-body-sm text-muted-foreground mt-1 hidden sm:block">
            Your location is detected automatically. Use Find Me to locate yourself on the map.
          </p>
        </div>
        <div className="bg-card border-border rounded-xl border shadow-[0px_4px_20px_rgba(0,0,0,0.04)] md:p-4">
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
