import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';
import {
  PieChart as PieChartIcon,
  BarChart3,
  Recycle,
  FileText,
  Layers,
  TrendingUp,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WasteCategory } from '@/features/waste/types';
import { useWasteRecords } from '@/features/waste/api/use-waste-records';

type Period = 'weekly' | 'monthly' | 'yearly';

const CATEGORY_COLORS: Record<WasteCategory, string> = {
  'organic-food': '#22c55e',
  'paper-cardboard': '#3b82f6',
  'plastic-soft-packaging': '#eab308',
  'plastic-pet-hdpe': '#f97316',
  textile: '#ec4899',
  glass: '#06b6d4',
  'metal-aluminum': '#a855f7',
  'e-waste': '#ef4444',
  'infectious-waste': '#be123c',
  'leather-rubber': '#78716c',
  wood: '#d97706',
  'sanitary-waste': '#94a3b8',
  'green-plant-materials': '#10b981',
  'construction-demolition': '#92400e',
};

const CATEGORY_LABELS: Record<WasteCategory, string> = {
  'organic-food': 'Organic/Food waste',
  'paper-cardboard': 'Paper & Cardboard',
  'plastic-soft-packaging': 'Plastic soft packaging',
  'plastic-pet-hdpe': 'Plastic (PET&HDPE)',
  textile: 'Textile',
  glass: 'Glass',
  'metal-aluminum': 'Metal, Aluminum',
  'e-waste': 'E-waste',
  'infectious-waste': 'Infectious waste',
  'leather-rubber': 'Leather, Rubber',
  wood: 'Wood',
  'sanitary-waste': 'Sanitary waste',
  'green-plant-materials': 'Green plant materials',
  'construction-demolition': 'Construction & Demolition wastes',
};

function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  switch (period) {
    case 'weekly':
      start.setDate(start.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
}

const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { total: number; color: string } }>;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  const pct = ((entry.value / entry.payload.total) * 100).toFixed(1);
  return (
    <div className="bg-card/95 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.payload.color }} />
        <span className="text-foreground text-sm font-semibold">{entry.name}</span>
      </div>
      <p className="text-muted-foreground/70 mt-1 text-xs">
        <span className="text-primary font-bold">{Number(entry.value).toFixed(1)}</span> kg
        <span className="ml-2">({pct}%)</span>
      </p>
    </div>
  );
};

export const WasteCharts = () => {
  const { data: records = [], isLoading } = useWasteRecords();
  const [period, setPeriod] = useState<Period>('monthly');
  const [chartMode, setChartMode] = useState<'pie' | 'bar'>('bar');

  const { start, end } = getDateRange(period);

  const filteredRecords = useMemo(
    () =>
      records.filter((r) => {
        const d = new Date(r.reportedAt);
        return d >= start && d <= end;
      }),
    [records, start, end],
  );

  const totalQuantity = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.quantity, 0),
    [filteredRecords],
  );

  const topCategory = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    const catTotals = filteredRecords.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.quantity;
      return acc;
    }, {});
    const top = Object.entries(catTotals).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    return { category: top[0] as WasteCategory, quantity: top[1] };
  }, [filteredRecords]);

  const pieData = useMemo(() => {
    const data = Object.entries(
      filteredRecords.reduce<Record<string, number>>((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.quantity;
        return acc;
      }, {}),
    )
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: CATEGORY_LABELS[key as WasteCategory] || key,
        value,
        color: CATEGORY_COLORS[key as WasteCategory] || '#999',
        total: totalQuantity,
      }))
      .sort((a, b) => b.value - a.value);
    return data;
  }, [filteredRecords, totalQuantity]);

  const barCategoryData = useMemo(() => {
    return [...pieData]
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        category: item.name,
        quantity: Number(item.value.toFixed(1)),
        color: item.color,
        pct: ((item.value / totalQuantity) * 100).toFixed(1),
      }));
  }, [pieData, totalQuantity]);

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
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setChartMode(chartMode === 'pie' ? 'bar' : 'pie')}
          className="border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
        >
          {chartMode === 'bar' ? (
            <>
              <PieChartIcon className="h-3.5 w-3.5" /> Pie Chart
            </>
          ) : (
            <>
              <BarChart3 className="h-3.5 w-3.5" /> Bar Chart
            </>
          )}
        </button>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="border-input bg-card text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-9 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all outline-none focus-visible:ring-2"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {filteredRecords.length === 0 ? (
        <Card className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground/50 text-sm">No data for this period</p>
        </Card>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card size="sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-xs font-semibold tracking-wide uppercase">
                  Total Waste
                </p>
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <Recycle className="text-primary h-4 w-4" />
                </div>
              </div>
              <p className="text-primary mt-2 text-2xl font-bold">{totalQuantity.toFixed(1)}</p>
              <p className="text-muted-foreground/60 text-xs">kg</p>
            </Card>
            <Card size="sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-xs font-semibold tracking-wide uppercase">
                  Records
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">{filteredRecords.length}</p>
              <p className="text-muted-foreground/60 text-xs">entries</p>
            </Card>
            <Card size="sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-xs font-semibold tracking-wide uppercase">
                  Categories
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                  <Layers className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">{pieData.length}</p>
              <p className="text-muted-foreground/60 text-xs">active types</p>
            </Card>
            <Card size="sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground/60 text-xs font-semibold tracking-wide uppercase">
                  Top Category
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-foreground mt-2 truncate text-lg font-bold">
                {topCategory
                  ? CATEGORY_LABELS[topCategory.category] || topCategory.category
                  : 'N/A'}
              </p>
              <p className="text-muted-foreground/60 text-xs">
                {topCategory ? `${topCategory.quantity.toFixed(1)} kg` : ''}
              </p>
            </Card>
          </div>

          {/* Single chart with toggle */}
          {chartMode === 'pie' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={56}
                      formatter={(value) => (
                        <span className="text-muted-foreground text-xs font-medium">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                  Waste Quantity by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart
                    data={barCategoryData}
                    margin={{ left: 12, right: 60, top: 12, bottom: 80 }}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eded" vertical={false} />
                    <XAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 10, fill: '#72796e' }}
                      axisLine={{ stroke: '#e5e2e1' }}
                      tickLine={false}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#72796e' }}
                      axisLine={{ stroke: '#e5e2e1' }}
                      tickLine={false}
                      unit=" kg"
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
                              <span className="text-primary font-bold">{d.quantity}</span> kg
                              <span className="ml-2">({d.pct}%)</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="quantity" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {barCategoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="quantity"
                        position="top"
                        formatter={(val) => `${Number(val ?? 0).toFixed(1)} kg`}
                        style={{ fontSize: 10, fill: '#72796e', fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
