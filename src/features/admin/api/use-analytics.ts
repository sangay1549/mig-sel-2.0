import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminKeys } from './use-admin-tickets';
import type { AnalyticsSummary } from '../types';

export const useAnalytics = () => {
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data: allTickets } = await supabase
        .from('tickets')
        .select('id, status, priority_level, category_id, created_at, resolved_at');

      const tickets = allTickets ?? [];

      const total_tickets = tickets.length;
      const open_tickets = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;
      const resolved_tickets = tickets.filter((t) => t.status === 'resolved').length;
      const urgent_tickets = tickets.filter((t) => t.priority_level === 'urgent').length;

      const resolvedWithTime = tickets.filter(
        (t): t is typeof t & { resolved_at: string } => t.status === 'resolved' && !!t.resolved_at,
      );

      const avgMs = resolvedWithTime.reduce((sum, t) => {
        return sum + (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime());
      }, 0);

      const avg_resolution_time_hours = resolvedWithTime.length
        ? Math.round((avgMs / resolvedWithTime.length / (1000 * 60 * 60)) * 10) / 10
        : 0;

      const statusCounts: Record<string, number> = {};
      tickets.forEach((t) => {
        statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
      });

      const { data: categories } = await supabase.from('categories').select('id, name');
      const catMap = new Map((categories ?? []).map((c) => [c.id, c.name]));

      const catCounts: Record<string, number> = {};
      tickets.forEach((t) => {
        const name = catMap.get(t.category_id) ?? 'Unknown';
        catCounts[name] = (catCounts[name] ?? 0) + 1;
      });

      const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0] ?? null;

      const dayCounts: Record<string, number> = {};
      tickets.forEach((t) => {
        const day = t.created_at.slice(0, 10);
        dayCounts[day] = (dayCounts[day] ?? 0) + 1;
      });

      return {
        total_tickets,
        open_tickets,
        resolved_tickets,
        urgent_tickets,
        avg_resolution_time_hours,
        top_category: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
        tickets_by_status: Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
        })),
        tickets_by_category: Object.entries(catCounts).map(([category, count]) => ({
          category,
          count,
        })),
        tickets_by_day: Object.entries(dayCounts)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    },
  });
};
