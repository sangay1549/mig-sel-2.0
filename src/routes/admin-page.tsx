import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, ChartPie, Table2 } from 'lucide-react';
import { DashboardSidebar, type NavView } from '@/components/layout/dashboard-sidebar';
import { WasteRecord } from '@/features/waste/components/waste-record';
import { WasteCharts } from '@/features/waste/components/waste-charts';
import { ComplaintMonitor } from '@/features/complaint/components/complaint-monitor';

const iconMap: Record<NavView, typeof ClipboardList> = {
  charts: ChartPie,
  table: Table2,
  complaint: ClipboardList,
};

export const AdminPage = () => {
  const [searchParams] = useSearchParams();
  const defaultView = searchParams.get('view') === 'complaint' ? 'complaint' : 'charts';
  const [activeView, setActiveView] = useState<NavView>(defaultView);

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
      <DashboardSidebar activeView={activeView} onNavigate={setActiveView} />

      <div className="ml-60 flex flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-8 py-8" style={{ maxWidth: '1200px' }}>
            <div className="animate-fade-in mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <IconComponent className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-foreground text-xl font-bold tracking-tight">{pageTitle}</h1>
                  <p className="text-muted-foreground/70 mt-0.5 text-sm">{pageDescription}</p>
                </div>
              </div>
            </div>

            {activeView === 'charts' && <WasteCharts />}
            {activeView === 'table' && <WasteRecord />}
            {activeView === 'complaint' && <ComplaintMonitor />}
          </div>
        </main>
      </div>
    </div>
  );
};
