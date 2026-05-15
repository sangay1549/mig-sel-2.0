import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useSignOut } from '@/features/auth/api/use-sign-out';
import { useUnreadCount } from '@/features/notifications/api/use-notifications';
import { PointsBadge } from '@/features/gamification/components/points-badge';
import { useState } from 'react';
import {
  MapPin,
  PlusCircle,
  List,
  User,
  LogOut,
  Bell,
  LayoutDashboard,
  Menu,
  X,
  Leaf,
} from 'lucide-react';

const navLinks = [
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/tickets', label: 'Reports', icon: List },
  { to: '/report', label: 'Report', icon: PlusCircle },
];

export const Navbar = () => {
  const location = useLocation();
  const { user } = useCurrentUser();
  const signOut = useSignOut();
  const { data: unreadCount } = useUnreadCount(user?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-muted/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-primary flex size-9 items-center justify-center rounded-sm">
            <Leaf className="text-primary-foreground size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">mig-sel</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.to}
              variant={isActive(link.to) ? 'secondary' : 'ghost'}
              size="sm"
              asChild
              className="gap-2"
            >
              <Link to={link.to}>
                <link.icon className="size-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <PointsBadge />
              <Button variant="ghost" size="icon-sm" asChild className="relative">
                <Link to="/my-reports">
                  <User className="size-4" />
                </Link>
              </Button>
              {(unreadCount ?? 0) > 0 ? (
                <Button variant="ghost" size="icon-sm" asChild className="relative">
                  <Link to="/my-reports">
                    <Bell className="size-4" />
                    <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  </Link>
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link to="/admin">
                  <LayoutDashboard className="size-4" />
                  Admin
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut.mutate()}
                disabled={signOut.isPending}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-muted/50 border-t px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                variant={isActive(link.to) ? 'secondary' : 'ghost'}
                asChild
                className="justify-start gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Link to={link.to}>
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
            <hr className="border-muted/50 my-2" />
            {user ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="justify-start gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to="/my-reports">
                    <User className="size-4" />
                    My Reports
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="justify-start gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to="/admin">
                    <LayoutDashboard className="size-4" />
                    Admin
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive justify-start gap-2"
                  onClick={() => {
                    signOut.mutate();
                    setMobileOpen(false);
                  }}
                  disabled={signOut.isPending}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="justify-start gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="justify-start gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to="/sign-up">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
};
