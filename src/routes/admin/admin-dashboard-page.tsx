import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { AnalyticsDashboard } from '@/features/admin/components/analytics-dashboard';
import { AdminMapView } from '@/features/admin/components/admin-map-view';
import { AdminTicketTable } from '@/features/admin/components/admin-ticket-table';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router';
import { LayoutDashboard, Map as MapIcon, List } from 'lucide-react';
import { useState } from 'react';

type AdminTab = 'dashboard' | 'map' | 'tickets';

export const AdminDashboardPage = () => {
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Map View', icon: MapIcon },
    { id: 'tickets', label: 'Tickets', icon: List },
  ];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage community reports, monitor department performance, and track resolution metrics.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/">View Public Site</Link>
        </Button>
      </div>

      <div className="flex gap-1 rounded-sm border p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' ? <AnalyticsDashboard /> : null}
      {activeTab === 'map' ? <AdminMapView /> : null}
      {activeTab === 'tickets' ? <AdminTicketTable /> : null}
    </div>
  );
};
