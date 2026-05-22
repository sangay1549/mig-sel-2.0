import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, ChartPie, Table2, Menu, Recycle, AlertTriangle } from 'lucide-react';
import { DashboardSidebar, type NavView } from '@/components/layout/dashboard-sidebar';
import { WasteRecord } from '@/features/waste/components/waste-record';
import { WasteCharts } from '@/features/waste/components/waste-charts';
import { ComplaintMonitor } from '@/features/complaint/components/complaint-monitor';
import { ComplaintCharts } from '@/features/complaint/components/complaint-charts';

const iconMap: Record<NavView, typeof ClipboardList> = {
  charts: ChartPie,
  table: Table2,
  complaint: ClipboardList,
};

export const AdminPage = () => {
  const [searchParams] = useSearchParams();
  const defaultView = searchParams.get('view') === 'complaint' ? 'complaint' : 'charts';
  const [activeView, setActiveView] = useState<NavView>(defaultView);
  const [analyticsTab, setAnalyticsTab] = useState<'waste' | 'complaint'>('waste');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageMeta: Record<NavView, { title: string; description: string }> = {
    charts: { title: 'Analytics', description: 'Oversight panel for GMC waste management' },
    table: { title: 'Records', description: 'Oversight panel for GMC waste management' },
    complaint: {
      title: 'Complaint Monitoring',
      description: 'Monitor and manage community complaints',
    },
  };

  const { title: pageTitle, description: pageDescription } = pageMeta[activeView];
  const IconComponent = iconMap[activeView];

  return (
    <div className="bg-muted flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        activeView={activeView}
        onNavigate={(v) => {
          setActiveView(v);
          setSidebarOpen(false);
        }}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col md:ml-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-accent rounded-lg p-1.5 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          {activeView !== 'complaint' && (
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-bold tracking-tight">{pageTitle}</h1>
              <p className="text-muted-foreground/70 truncate text-xs">{pageDescription}</p>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: '1200px' }}>
            {activeView !== 'complaint' && (
              <div className="mb-8 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                    <IconComponent className="text-primary-foreground h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-foreground text-xl font-bold tracking-tight">
                      {pageTitle}
                    </h1>
                    <p className="text-muted-foreground/70 mt-0.5 text-sm">{pageDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'charts' && (
              <div className="space-y-6">
                <div className="flex gap-1 rounded-lg border bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setAnalyticsTab('waste')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      analyticsTab === 'waste'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Recycle className="h-4 w-4" />
                    Waste Management
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsTab('complaint')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      analyticsTab === 'complaint'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Complaint Monitoring
                  </button>
                </div>
                {analyticsTab === 'waste' ? <WasteCharts /> : <ComplaintCharts />}
              </div>
            )}
            {activeView === 'table' && <WasteRecord />}
            {activeView === 'complaint' && <ComplaintMonitor />}
          </div>
        </main>
      </div>
    </div>
  );
};
