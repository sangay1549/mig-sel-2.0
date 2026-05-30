import {
  Recycle,
  ClipboardList,
  LogOut,
  ChartLine,
  X,
  Map,
  FileText,
  Shield,
  Brain,
  LayoutDashboard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useSignOut } from '@/features/auth/api/use-sign-out';

export type NavView = 'complaint' | 'table' | 'inspector' | 'role' | 'charts' | 'knowledge';

const navItems = [
  { id: 'complaint' as const, label: 'Complaint Monitoring', icon: ClipboardList },
  { id: 'table' as const, label: 'Waste Management', icon: Recycle },
  { id: 'inspector' as const, label: 'Inspector', icon: FileText },
  { id: 'role' as const, label: 'Role Assignment', icon: Shield },
  { id: 'charts' as const, label: 'Analytics', icon: ChartLine },
  { id: 'knowledge' as const, label: 'Knowledge Base', icon: Brain },
];

export function DashboardSidebar({
  activeView,
  onNavigate,
  isMobileOpen,
  onMobileClose,
}: {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const navigate = useNavigate();
  const signOut = useSignOut();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-transform duration-300',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/50 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-green shadow-sm">
          <span className="text-sm font-bold text-white">G</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-foreground">GMC Admin</span>
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
            Panel
          </span>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          <span className="px-3 pb-2 text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
            Main Menu
          </span>
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 outline-none',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                )}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-full bg-primary" />
                )}
                <div className="flex h-5 w-5 items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border/50 p-3">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/map')}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
          >
            <Map className="h-4 w-4" />
            <span>Public Map</span>
          </button>
          <button
            onClick={() => navigate('/community')}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Public View</span>
          </button>
          <button
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span>{signOut.isPending ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
