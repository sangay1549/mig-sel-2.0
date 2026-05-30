import { useState } from 'react';
import {
  ClipboardList,
  ChartPie,
  Menu,
  Recycle,
  AlertTriangle,
  FileText,
  Shield,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardSidebar, type NavView } from '@/components/layout/dashboard-sidebar';
import { WasteRecord } from '@/features/waste/components/waste-record';
import { WasteCharts } from '@/features/waste/components/waste-charts';
import { ComplaintMonitor } from '@/features/complaint/components/complaint-monitor';
import { ComplaintCharts } from '@/features/complaint/components/complaint-charts';
import { WasteReportingForm } from '@/features/waste/components/waste-reporting-form';
import { RoleAssignment } from '@/features/admin/components/role-assignment';
import { KnowledgeBase } from '@/features/admin/components/knowledge-base';

const iconMap: Record<NavView, typeof ClipboardList> = {
  complaint: ClipboardList,
  table: Recycle,
  inspector: FileText,
  role: Shield,
  charts: ChartPie,
  knowledge: Brain,
};

const SUMMARY = [
  { label: 'Total Complaints', value: '--', color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Resolved', value: '--', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'In Progress', value: '--', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Pending', value: '--', color: 'text-amber-600', bg: 'bg-amber-50' },
];

export const AdminPage = () => {
  const [activeView, setActiveView] = useState<NavView>('complaint');
  const [analyticsTab, setAnalyticsTab] = useState<'waste' | 'complaint'>('complaint');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageMeta: Record<NavView, { title: string; description: string }> = {
    complaint: {
      title: 'Complaint Monitoring',
      description: 'Monitor and manage community complaints',
    },
    table: {
      title: 'Waste Management',
      description: 'Oversight panel for GMC waste management',
    },
    inspector: {
      title: 'Inspector Portal',
      description: 'Submit waste collection records',
    },
    role: {
      title: 'Role Assignment',
      description: 'Search and update user roles',
    },
    charts: {
      title: 'Analytics',
      description: 'Oversight panel for GMC analytics',
    },
    knowledge: {
      title: 'Knowledge Base',
      description: 'Manage chatbot Q&A pairs',
    },
  };

  const { title: pageTitle, description: pageDescription } = pageMeta[activeView];
  const IconComponent = iconMap[activeView];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/80">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

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

      <div className="flex flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-white/70 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: '1200px' }}>
            <div className="hidden md:block">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm',
                      activeView === 'complaint' ? 'gradient-green' : 'bg-secondary',
                    )}
                  >
                    <IconComponent
                      className={cn(
                        'h-6 w-6',
                        activeView === 'complaint' ? 'text-white' : 'text-primary',
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
                      {activeView === 'charts' ? 'Overview' : 'Management'}
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                      {pageTitle}
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">{pageDescription}</p>
                  </div>
                </div>
              </div>

              {activeView === 'complaint' && (
                <div className="mb-6 grid grid-cols-4 gap-3">
                  {SUMMARY.map((s) => (
                    <div
                      key={s.label}
                      className={cn(
                        'flex flex-col gap-1 rounded-2xl border border-border/50 p-4 shadow-sm',
                        s.bg,
                      )}
                    >
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {s.label}
                      </span>
                      <span className={cn('text-2xl font-black', s.color)}>{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeView === 'inspector' && (
              <div className="animate-slide-up">
                <WasteReportingForm />
              </div>
            )}
            {activeView === 'role' && <RoleAssignment />}
            {activeView === 'charts' && (
              <div className="space-y-6">
                <div className="animate-slide-up rounded-2xl border border-border/50 bg-card/60 p-1.5 shadow-sm backdrop-blur-sm">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAnalyticsTab('waste')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                        analyticsTab === 'waste'
                          ? 'gradient-green text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                      )}
                    >
                      <Recycle className="h-4 w-4" />
                      Waste Management
                    </button>
                    <button
                      onClick={() => setAnalyticsTab('complaint')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                        analyticsTab === 'complaint'
                          ? 'gradient-green text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                      )}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Complaint Monitoring
                    </button>
                  </div>
                </div>
                <div className="animate-slide-up stagger-1">
                  {analyticsTab === 'waste' ? <WasteCharts /> : <ComplaintCharts />}
                </div>
              </div>
            )}
            <div className="animate-slide-up">
              {activeView === 'table' && <WasteRecord />}
              {activeView === 'complaint' && <ComplaintMonitor />}
            </div>
            {activeView === 'knowledge' && (
              <div className="animate-slide-up">
                <KnowledgeBase />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
