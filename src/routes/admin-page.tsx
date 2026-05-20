import { useState } from 'react';
import { BarChart3, Trash2, AlertTriangle, LogOut, Map, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSignOut } from '@/features/auth/api/use-sign-out';
import { WasteRecord } from '@/features/waste/components/waste-record';
import { ComplaintMonitor } from '@/features/complaint/components/complaint-monitor';

type TabId = 'waste' | 'complaint';

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'waste', label: 'Waste Management Record', icon: <Trash2 className="h-4 w-4" />, desc: 'Track and manage waste collection data' },
  { id: 'complaint', label: 'Complaint Monitoring', icon: <AlertTriangle className="h-4 w-4" />, desc: 'Monitor public complaints and resolutions' },
];

export const AdminPage = () => {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [activeTab, setActiveTab] = useState<TabId>('waste');
  const [animating, setAnimating] = useState(false);
  const [isSlidingRight, setIsSlidingRight] = useState(true);

  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab || animating) return;
    const prevIdx = TABS.findIndex((t) => t.id === activeTab);
    const nextIdx = TABS.findIndex((t) => t.id === tab);
    setIsSlidingRight(nextIdx > prevIdx);
    setActiveTab(tab);
    setAnimating(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fcf9f8' }}>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6" style={{ backgroundColor: '#ffffff', borderColor: '#e5e2e1' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#154212' }}>
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#1c1b1b' }}>Migsel</span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase" style={{ backgroundColor: '#d6e4cc', color: '#3e4a38' }}>
              Admin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{ color: '#42493e' }}
          >
            <Map className="h-3.5 w-3.5" />
            Public Map
          </button>
          <button
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{ color: '#42493e' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            {signOut.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="mx-auto px-4 py-8 sm:px-6" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#154212' }}>
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1c1b1b' }}>Admin Dashboard</h1>
              <p className="mt-0.5 text-sm" style={{ color: '#72796e' }}>Oversight panel for GMC waste & complaint management</p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="mb-8 animate-slide-up rounded-xl p-1.5" style={{ backgroundColor: '#e5e2e1' }}>
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group relative flex flex-1 flex-col items-center gap-1 rounded-lg px-4 py-3 text-center text-xs font-bold tracking-wide transition-all duration-500 ${
                    isActive ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#154212' : '#72796e',
                  }}
                >
                  <span className="flex items-center gap-2 text-sm">
                    {tab.icon}
                    {tab.label}
                  </span>
                  <span className="text-[10px] font-normal tracking-normal" style={{ color: isActive ? '#72796e' : '#72796e' }}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content — sliding panel */}
        <div className="relative mx-auto overflow-hidden rounded-xl border shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e5e2e1', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div
            className={`flex transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              animating ? (isSlidingRight ? 'translate-x-[-100%]' : 'translate-x-[100%]') : ''
            }`}
            style={{
              transform: !animating
                ? activeTab === 'waste'
                  ? 'translateX(0%)'
                  : 'translateX(-100%)'
                : undefined,
            }}
            onTransitionEnd={() => setAnimating(false)}
          >
            <div className="w-full shrink-0 p-6">
              <WasteRecord />
            </div>
            <div className="w-full shrink-0 p-6">
              <ComplaintMonitor />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs" style={{ color: '#c2c9bb' }}>
          GMC Resonance &middot; Administrative Panel
        </p>
      </main>
    </div>
  );
};
