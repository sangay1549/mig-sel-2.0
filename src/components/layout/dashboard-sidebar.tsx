import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Recycle,
  ClipboardList,
  LogOut,
  Map,
  Leaf,
  ChartLine,
  Table2,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSignOut } from '@/features/auth/api/use-sign-out';

export type NavView = 'charts' | 'table' | 'complaint';

const navItems = [
  {
    id: 'charts' as const,
    label: 'Analytics',
    icon: ChartLine,
    children: null,
  },
  {
    id: 'complaint' as const,
    label: 'Complaint Monitoring',
    icon: ClipboardList,
    children: null,
  },
  {
    id: 'waste' as const,
    label: 'Waste Management',
    icon: Recycle,
    children: [{ id: 'table' as const, label: 'Records', icon: Table2 }],
  },
] as const;

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
  const [wasteExpanded, setWasteExpanded] = useState(true);

  return (
    <aside
      className={`bg-card fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-5">
        <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
          <Leaf className="text-primary-foreground h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground text-lg font-bold tracking-tight">Migsel</span>
          <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            Admin
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

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground/60 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
            Main Menu
          </span>
          {navItems.map((item) =>
            item.children ? (
              <div key={item.id}>
                <button
                  onClick={() => setWasteExpanded(!wasteExpanded)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                    activeView === 'table'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {wasteExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                  )}
                </button>
                {wasteExpanded && (
                  <div className="mt-0.5 ml-3 flex flex-col gap-0.5">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200',
                          activeView === child.id
                            ? 'bg-accent text-primary'
                            : 'text-muted-foreground/70 hover:bg-accent/50 hover:text-foreground',
                        )}
                      >
                        <child.icon className="h-3.5 w-3.5 shrink-0" />
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                  activeView === item.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            ),
          )}
        </div>
      </nav>

      <div className="border-t p-3">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/map')}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200"
          >
            <Map className="h-4 w-4 shrink-0" />
            Public Map
          </button>
          <button
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {signOut.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </aside>
  );
}
