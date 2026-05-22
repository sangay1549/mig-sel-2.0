import { useMemo, useState } from 'react';
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
} from 'recharts';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWasteRecords } from '@/features/waste/api/use-waste-records';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/features/waste/constants';
import type { WasteCategory } from '@/features/waste/types';
import type { WasteRecord } from '@/features/waste/types';

type Period = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const YEARS = Array.from({ length: 14 }, (_, i) => 2026 + i);

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const QUARTER_LABELS = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)'];

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeeksInMonth(year: number, month: number): number[] {
  const weeks = new Set<number>();
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    weeks.add(getISOWeekNumber(new Date(year, month, day)));
  }
  return Array.from(weeks).sort((a, b) => a - b);
}

function getWeekRange(year: number, week: number): { start: Date; end: Date } {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1);
  const monday = new Date(mondayOfWeek1);
  monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getQuarterRange(year: number, quarter: number): { start: Date; end: Date } {
  const start = new Date(year, quarter * 3, 1);
  const end = new Date(year, quarter * 3 + 3, 0, 23, 59, 59, 999);
  return { start, end };
}

function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  switch (period) {
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
}

type BarItem = {
  category: string;
  quantity: number;
  color: string;
  pct: string;
};

function buildBarDataForRange(records: WasteRecord[], start: Date, end: Date): BarItem[] {
  const filtered = records.filter((r) => {
    const d = new Date(r.reportedAt);
    return d >= start && d <= end;
  });

  if (filtered.length === 0) return [];

  const total = filtered.reduce((sum, r) => sum + r.quantity, 0);
  const grouped = filtered.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.quantity;
    return acc;
  }, {});

  return Object.entries(grouped)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      category: CATEGORY_LABELS[key as WasteCategory] || key,
      quantity: Number(value.toFixed(1)),
      color: CATEGORY_COLORS[key as WasteCategory] || '#999',
      pct: ((value / total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.quantity - a.quantity);
}

const PERIODS: Period[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

const PERIOD_LABELS: Record<Period, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const CARD_STYLES: Record<Period, { className: string; dot: string }> = {
  weekly: { className: 'border-t-4 border-t-chart-1', dot: 'bg-chart-1' },
  monthly: { className: 'border-l-4 border-l-chart-2', dot: 'bg-chart-2' },
  quarterly: { className: 'border-b-4 border-b-chart-4', dot: 'bg-chart-4' },
  yearly: { className: 'border-r-4 border-r-chart-5', dot: 'bg-chart-5' },
};

function WasteBarChart({
  data,
  title,
  controls,
  accentDot,
  className,
}: {
  data: BarItem[];
  title: string;
  controls?: React.ReactNode;
  accentDot?: string;
  className?: string;
}) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {accentDot && <span className={cn('h-2 w-2 rounded-full', accentDot)} />}
            <CardTitle className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
              {title}
            </CardTitle>
          </div>
          {controls}
        </div>
      </CardHeader>
      {data.length === 0 ? (
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground/50 text-sm">No data for {title.toLowerCase()}</p>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              margin={{ left: 8, right: 48, top: 12, bottom: 24 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eded" vertical={false} />
              <XAxis
                type="category"
                dataKey="category"
                tick={{ fontSize: 9, fill: '#72796e' }}
                axisLine={{ stroke: '#e5e2e1' }}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                type="number"
                tick={{ fontSize: 10, fill: '#72796e' }}
                axisLine={{ stroke: '#e5e2e1' }}
                tickLine={false}
                unit=" kg"
                width={40}
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
                        <span className="text-foreground text-sm font-semibold">{d.category}</span>
                      </div>
                      <p className="text-muted-foreground/70 mt-1 text-xs">
                        <span className="text-primary font-bold">{d.quantity}</span> kg
                        <span className="ml-2">({d.pct}%)</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="quantity" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="quantity"
                  position="top"
                  formatter={(val) => `${Number(val ?? 0).toFixed(1)}`}
                  style={{ fontSize: 9, fill: '#72796e', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  );
}

export const WasteCharts = () => {
  const { data: records = [], isLoading } = useWasteRecords();

  const now = new Date();
  const initialYear = Math.min(2039, Math.max(2026, now.getFullYear()));
  const [selectedYear, setSelectedYear] = useState<string>(String(initialYear));
  const [selectedWeek, setSelectedWeek] = useState<number>(getISOWeekNumber(now));
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(now.getMonth() / 3));

  const yearFilteredRecords = useMemo(
    () => records.filter((r) => new Date(r.reportedAt).getFullYear() === Number(selectedYear)),
    [records, selectedYear],
  );

  const periodDataWeekly = useMemo(() => {
    const wRange = getWeekRange(Number(selectedYear), selectedWeek);
    return buildBarDataForRange(yearFilteredRecords, wRange.start, wRange.end);
  }, [yearFilteredRecords, selectedYear, selectedWeek]);

  const periodDataMonthly = useMemo(() => {
    const mRange = getMonthRange(Number(selectedYear), selectedMonth);
    return buildBarDataForRange(yearFilteredRecords, mRange.start, mRange.end);
  }, [yearFilteredRecords, selectedYear, selectedMonth]);

  const periodDataQuarterly = useMemo(() => {
    const qRange = getQuarterRange(Number(selectedYear), selectedQuarter);
    return buildBarDataForRange(yearFilteredRecords, qRange.start, qRange.end);
  }, [yearFilteredRecords, selectedYear, selectedQuarter]);

  const periodDataYearly = useMemo(() => {
    const yRange = getDateRange('yearly');
    return buildBarDataForRange(yearFilteredRecords, yRange.start, yRange.end);
  }, [yearFilteredRecords]);

  const periodData: Record<Period, BarItem[]> = {
    weekly: periodDataWeekly,
    monthly: periodDataMonthly,
    quarterly: periodDataQuarterly,
    yearly: periodDataYearly,
  };

  const weeksInMonth = useMemo(
    () => getWeeksInMonth(Number(selectedYear), selectedMonth),
    [selectedYear, selectedMonth],
  );

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Waste Management</h2>
          <p className="text-muted-foreground/60 text-sm">
            Waste quantity by category across different periods
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedWeek(getWeeksInMonth(Number(e.target.value), selectedMonth)[0]);
          }}
          className="border-muted bg-background text-foreground focus:border-ring focus:ring-ring/30 h-10 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {PERIODS.map((p) => {
          let controls: React.ReactNode = null;
          if (p === 'weekly') {
            controls = (
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="border-muted bg-background text-foreground focus:border-ring focus:ring-ring/30 h-8 rounded-md border px-2 py-1 text-xs outline-none focus:ring-2"
              >
                {weeksInMonth.map((w, i) => (
                  <option key={w} value={w}>
                    Week {i + 1}
                  </option>
                ))}
              </select>
            );
          } else if (p === 'monthly') {
            controls = (
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setSelectedWeek(getWeeksInMonth(Number(selectedYear), Number(e.target.value))[0]);
                }}
                className="border-muted bg-background text-foreground focus:border-ring focus:ring-ring/30 h-8 rounded-md border px-2 py-1 text-xs outline-none focus:ring-2"
              >
                {MONTH_LABELS.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            );
          } else if (p === 'quarterly') {
            controls = (
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="border-muted bg-background text-foreground focus:border-ring focus:ring-ring/30 h-8 rounded-md border px-2 py-1 text-xs outline-none focus:ring-2"
              >
                {QUARTER_LABELS.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <WasteBarChart
              key={p}
              data={periodData[p]}
              title={PERIOD_LABELS[p]}
              controls={controls}
              className={CARD_STYLES[p].className}
              accentDot={CARD_STYLES[p].dot}
            />
          );
        })}
      </div>
    </div>
  );
};
