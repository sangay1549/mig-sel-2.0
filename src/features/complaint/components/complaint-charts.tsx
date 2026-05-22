import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
} from 'recharts';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  Loader2,
  Layers,
  Route,
  Trash2,
  Lightbulb,
  Droplets,
  MoreHorizontal,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { useComplaints } from '@/features/complaint/api/use-complaints';
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS } from '@/features/complaint/constants';
import type { ComplaintCategory } from '@/features/complaint/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  resolved: '#10b981',
};

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  road: Route,
  garbage: Trash2,
  lighting: Lightbulb,
  drainage: Droplets,
  other: MoreHorizontal,
};

const CategoryIcon = ({
  category,
  className,
  style,
}: {
  category: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const Icon = CATEGORY_ICONS[category] || MoreHorizontal;
  return <Icon className={className} style={style} />;
};

const STATUS_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  pending: Clock,
  'in-progress': MapPin,
  resolved: CheckCircle2,
};

const StatusIcon = ({
  status,
  className,
  style,
}: {
  status: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const Icon = STATUS_ICONS[status];
  if (!Icon) return null;
  return <Icon className={className} style={style} />;
};

export const ComplaintCharts = () => {
  const { data: complaints = [], isLoading } = useComplaints();

  const summary = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'pending').length,
      inProgress: complaints.filter((c) => c.status === 'in-progress').length,
      resolved: complaints.filter((c) => c.status === 'resolved').length,
      critical: complaints.filter((c) => c.urgency === 'critical').length,
    }),
    [complaints],
  );

  const categoryData = useMemo(() => {
    const catTotals = complaints.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(catTotals)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        key: key as ComplaintCategory,
        category: CATEGORY_LABELS[key as ComplaintCategory] || key,
        count: value,
        color: CATEGORY_COLORS[key as ComplaintCategory] || '#999',
      }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  const statusData = useMemo(() => {
    const statTotals = complaints.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statTotals)
      .filter(([, value]) => value > 0)
      .map(([statusKey, value]) => ({
        statusKey,
        name: STATUS_LABELS[statusKey as keyof typeof STATUS_LABELS] || statusKey,
        value,
        color: STATUS_COLORS[statusKey] || '#999',
      }));
  }, [complaints]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground/70 flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {complaints.length === 0 ? (
        <Card className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground/50 text-sm">No complaint data available</p>
        </Card>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-5 gap-2.5">
            <Card size="sm" className="!p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-wide uppercase">
                  Total
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50">
                  <Layers className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <p className="text-foreground text-2xl font-bold">{summary.total}</p>
            </Card>
            <Card size="sm" className="!p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-wide uppercase">
                  Pending
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-50">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <p className="text-foreground text-2xl font-bold">{summary.pending}</p>
            </Card>
            <Card size="sm" className="!p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-wide uppercase">
                  In Progress
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <p className="text-foreground text-2xl font-bold">{summary.inProgress}</p>
            </Card>
            <Card size="sm" className="!p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-wide uppercase">
                  Resolved
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <p className="text-foreground text-2xl font-bold">{summary.resolved}</p>
            </Card>
            <Card size="sm" className="!p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-[11px] font-semibold tracking-wide uppercase">
                  Critical
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </div>
              <p className="text-foreground text-2xl font-bold">{summary.critical}</p>
            </Card>
          </div>

          {/* Unified category analytics card: bar chart (75%) + compact distribution (25%) */}
          <Card className="overflow-hidden">
            <div className="flex">
              {/* Bar chart — 75% */}
              <div className="flex-[3] border-r">
                <div className="flex items-center justify-between px-6 pt-5 pb-1">
                  <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                    Complaints by Category
                  </p>
                </div>
                <div className="px-2">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={categoryData}
                      margin={{ left: 8, right: 40, top: 8, bottom: 32 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0eded" vertical={false} />
                      <XAxis
                        type="category"
                        dataKey="category"
                        tick={{ fontSize: 10, fill: '#72796e' }}
                        axisLine={{ stroke: '#e5e2e1' }}
                        tickLine={false}
                      />
                      <YAxis
                        type="number"
                        tick={{ fontSize: 10, fill: '#72796e' }}
                        axisLine={{ stroke: '#e5e2e1' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-card/95 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: d.color }}
                                />
                                <span className="text-foreground text-sm font-semibold">
                                  {d.category}
                                </span>
                              </div>
                              <p className="text-muted-foreground/70 mt-1 text-xs">
                                <span className="text-primary font-bold">{d.count}</span> complaint
                                {d.count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey="count"
                          position="top"
                          style={{ fontSize: 10, fill: '#72796e', fontWeight: 600 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Compact distribution list — 25% */}
              <div className="min-w-0 flex-[1]">
                <div className="px-4 pt-5 pb-2">
                  <p className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">
                    Distribution
                  </p>
                </div>
                <div className="space-y-0.5 px-2 pb-4">
                  {categoryData.map((entry) => {
                    const pct =
                      summary.total > 0 ? ((entry.count / summary.total) * 100).toFixed(0) : '0';
                    return (
                      <div
                        key={entry.key}
                        className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all hover:bg-gray-50/80"
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${entry.color}18` }}
                        >
                          <CategoryIcon
                            category={entry.key}
                            className="h-3.5 w-3.5"
                            style={{ color: entry.color }}
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                          <span
                            className="truncate text-xs font-semibold"
                            style={{ color: '#1c1b1b' }}
                          >
                            {entry.category}
                          </span>
                          <span
                            className="shrink-0 text-[11px] font-bold tabular-nums"
                            style={{ color: entry.color }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Unified status analytics card: pie chart (75%) + compact distribution (25%) */}
          {statusData.length > 0 && (
            <Card className="overflow-hidden">
              <div className="flex">
                {/* Pie chart — 75% */}
                <div className="flex-[3] border-r">
                  <div className="flex items-center justify-between px-6 pt-5 pb-1">
                    <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                      Complaints by Status
                    </p>
                  </div>
                  <div className="px-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={3}
                          dataKey="value"
                          cornerRadius={6}
                          stroke="#fff"
                          strokeWidth={2}
                          label={({ name, percent }) =>
                            `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          labelLine={{
                            stroke: '#a3a7a1',
                            strokeWidth: 1.5,
                            strokeDasharray: '3 2',
                          }}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-card/95 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: d.color }}
                                  />
                                  <span className="text-foreground text-sm font-semibold">
                                    {d.name}
                                  </span>
                                </div>
                                <p className="text-muted-foreground/70 mt-1 text-xs">
                                  <span className="text-primary font-bold">{d.value}</span>{' '}
                                  complaint{d.value !== 1 ? 's' : ''}
                                </p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Compact distribution list — 25% */}
                <div className="min-w-0 flex-[1]">
                  <div className="px-4 pt-5 pb-2">
                    <p className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">
                      Distribution
                    </p>
                  </div>
                  <div className="space-y-0.5 px-2 pb-4">
                    {statusData.map((entry) => {
                      const pct =
                        summary.total > 0 ? ((entry.value / summary.total) * 100).toFixed(0) : '0';
                      return (
                        <div
                          key={entry.statusKey}
                          className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all hover:bg-gray-50/80"
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${entry.color}18` }}
                          >
                            <StatusIcon
                              status={entry.statusKey}
                              className="h-3.5 w-3.5"
                              style={{ color: entry.color }}
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                            <span
                              className="truncate text-xs font-semibold"
                              style={{ color: '#1c1b1b' }}
                            >
                              {entry.name}
                            </span>
                            <span
                              className="shrink-0 text-[11px] font-bold tabular-nums"
                              style={{ color: entry.color }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
