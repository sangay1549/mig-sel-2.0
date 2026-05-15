export type AnalyticsSummary = {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  urgent_tickets: number;
  avg_resolution_time_hours: number;
  top_category: { name: string; count: number } | null;
  tickets_by_status: Array<{ status: string; count: number }>;
  tickets_by_category: Array<{ category: string; count: number }>;
  tickets_by_day: Array<{ date: string; count: number }>;
};

export type HeatMapPoint = {
  latitude: number;
  longitude: number;
  weight: number;
  category: string;
};

export const DEPARTMENT_COLORS: Record<string, string> = {
  'Dept of Transport': '#154212',
  'Dept of Energy': '#55624f',
  'Dept of Water & Sanitation': '#2d5a27',
  'Dept of Waste': '#3a3936',
  'General Triage': '#72796e',
};
