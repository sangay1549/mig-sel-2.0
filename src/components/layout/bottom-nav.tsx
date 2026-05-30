import { useNavigate, useLocation } from 'react-router';
import {
  Home,
  Users,
  Map,
  User,
  type LucideIcon,
} from 'lucide-react';
import { GlobalActionButton } from './global-action-button';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`group relative flex w-full flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {isActive && (
      <span className="absolute -top-1.5 mx-auto h-1 w-6 rounded-full bg-primary" />
    )}
    <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
    <span className="text-[10px] leading-none font-semibold tracking-tight">{label}</span>
  </button>
);

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = (() => {
    const path = location.pathname;
    if (path.startsWith('/home')) return 'home';
    if (path.startsWith('/community')) return 'community';
    if (path.startsWith('/map')) return 'map';
    if (path.startsWith('/profile')) return 'profile';
    return '';
  })();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg">
      <div className="glass relative mx-3 mb-3 rounded-2xl px-2 py-2 shadow-lg">
        <div className="grid grid-cols-5 items-center">
          <NavItem
            icon={Home}
            label="Home"
            isActive={activeTab === 'home'}
            onClick={() => navigate('/home')}
          />

          <NavItem
            icon={Users}
            label="Community"
            isActive={activeTab === 'community'}
            onClick={() => navigate('/community')}
          />

          <div className="relative -mt-6 flex items-center justify-center">
            <GlobalActionButton
              onOpenReport={() => navigate('/report')}
              onOpenPost={() => navigate('/life-update')}
            />
          </div>

          <NavItem
            icon={Map}
            label="Map"
            isActive={activeTab === 'map'}
            onClick={() => navigate('/map')}
          />

          <NavItem
            icon={User}
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>
    </nav>
  );
};
