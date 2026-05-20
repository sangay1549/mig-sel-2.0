import { useState } from 'react';
import { GrievanceMap } from '@/features/auth/grievance/components/grievance-map';
import { GrievanceDrawer } from '@/features/auth/grievance/components/grievance-drawer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="bg-background min-h-screen font-sans">
      <nav className="border-border bg-card sticky top-0 z-50 flex h-14 items-center justify-between border-b px-3 md:h-16 md:px-6">
        <div className="flex items-center gap-2">
          <span className="md:text-label-lg text-primary text-sm font-bold tracking-wide">
            Migsel
          </span>
          <span className="bg-secondary-container text-on-secondary-container hidden rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase sm:inline">
            Portal
          </span>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-body-sm text-muted-foreground hover:text-primary text-xs font-medium md:text-sm"
        >
          Exit Session
        </Button>
      </nav>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-card border-border rounded-xl border p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <GrievanceMap />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <h3 className="text-label-lg text-on-surface font-bold tracking-wide uppercase">
              Operational Actions
            </h3>
            <p className="text-body-sm text-muted-foreground">
              Observe reported utility malfunctions or activate tracking metrics to dispatch
              cleanups.
            </p>
            <Button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary-container h-11 w-full rounded-md font-medium shadow-sm transition-all"
            >
              Initiate Quick Report
            </Button>
          </div>
        </div>
      </main>

      {isDrawerOpen && <GrievanceDrawer onClose={() => setIsDrawerOpen(false)} />}
    </div>
  );
};
