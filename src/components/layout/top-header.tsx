import { useNavigate } from 'react-router';
import { Bell, Search } from 'lucide-react';

export const TopHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="glass fixed inset-x-0 top-0 z-50 border-b border-white/20">
      <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4 md:max-w-3xl lg:max-w-5xl xl:max-w-7xl sm:px-6">
        <button onClick={() => navigate('/community')} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-green shadow-sm">
            <span className="text-xs font-bold text-white">G</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">GMC Civic Connect</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-medium text-emerald-600">Live</span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
            <Search className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
