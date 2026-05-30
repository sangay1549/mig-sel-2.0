import { Outlet, useLocation } from 'react-router';
import { TopHeader } from './top-header';
import { BottomNav } from './bottom-nav';

const HIDDEN_HEADER_PATHS = ['/report', '/map', '/login', '/auth/callback'];
const HIDDEN_NAV_PATHS = ['/login', '/auth/callback', '/dashboard', '/inspector', '/official'];

export const AppShell = () => {
  const location = useLocation();
  const showHeader = !HIDDEN_HEADER_PATHS.some((p) => location.pathname.startsWith(p));
  const showNav = !HIDDEN_NAV_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="gradient-surface min-h-dvh">
      {showHeader && <TopHeader />}

      <main
        className="mx-auto w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6"
        style={{
          paddingTop: showHeader ? '3.5rem' : '0',
          paddingBottom: showNav ? '7rem' : '0',
        }}
      >
        <Outlet />
      </main>

      {showNav && <BottomNav />}
    </div>
  );
};
