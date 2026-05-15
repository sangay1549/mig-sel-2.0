import { useAnalytics } from '../api/use-analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  BarChart3,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TICKET_STATUS_LABELS } from '@/features/tickets/types';
import type { TicketStatus } from '@/features/tickets/types';

export const AnalyticsDashboard = () => {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading || !analytics) {
    return <p className="text-muted-foreground py-8 text-center text-sm">Loading analytics…</p>;
  }

  const statCards = [
    {
      label: 'Total Reports',
      value: analytics.total_tickets,
      icon: ListTodo,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Open',
      value: analytics.open_tickets,
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Resolved',
      value: analytics.resolved_tickets,
      icon: CheckCircle2,
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
    },
    {
      label: 'Urgent',
      value: analytics.urgent_tickets,
      icon: Clock,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Avg Resolution',
      value: `${analytics.avg_resolution_time_hours}h`,
      icon: TrendingUp,
      color: 'text-chart-1',
      bg: 'bg-chart-1/10',
    },
    {
      label: 'Top Category',
      value: analytics.top_category?.name ?? 'N/A',
      icon: BarChart3,
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
    },
  ];

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
        <Button variant="outline" size="sm" onClick={exportPDF}>
          <FileText className="mr-2 size-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex size-10 items-center justify-center rounded-sm ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.tickets_by_status.map((item) => {
                const pct = analytics.total_tickets
                  ? Math.round((item.count / analytics.total_tickets) * 100)
                  : 0;
                return (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize">
                        {TICKET_STATUS_LABELS[item.status as TicketStatus] ?? item.status}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tickets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.tickets_by_category.map((item) => {
                const pct = analytics.total_tickets
                  ? Math.round((item.count / analytics.total_tickets) * 100)
                  : 0;
                return (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-chart-2 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report Trends</CardTitle>
          <CardDescription>Daily ticket submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.tickets_by_day.length > 0 ? (
            <div className="flex items-end gap-1" style={{ height: '120px' }}>
              {analytics.tickets_by_day.map((day) => {
                const maxCount = Math.max(...analytics.tickets_by_day.map((d) => d.count), 1);
                const heightPct = (day.count / maxCount) * 100;
                return (
                  <div
                    key={day.date}
                    className="bg-primary/60 hover:bg-primary/90 relative flex flex-1 flex-col items-center transition-colors"
                    style={{ height: `${heightPct}%`, minHeight: '4px' }}
                    title={`${day.date}: ${day.count} reports`}
                  >
                    <span className="text-muted-foreground absolute -top-5 text-[10px]">
                      {day.count}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground py-4 text-center text-sm">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
