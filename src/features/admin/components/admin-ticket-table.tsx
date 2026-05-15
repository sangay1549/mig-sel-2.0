import { useAdminTickets, useUpdateTicketPriority } from '../api/use-admin-tickets';
import { useUpdateTicketStatus } from '@/features/tickets/api/use-update-ticket-status';
import { TicketStatusBadge } from '@/features/tickets/components/ticket-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, TICKET_STATUS_FLOW } from '@/features/tickets/types';
import { useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, Search } from 'lucide-react';
import type { TicketStatus } from '@/features/tickets/types';

export const AdminTicketTable = () => {
  const { data: tickets, isLoading, error } = useAdminTickets();
  const updateStatus = useUpdateTicketStatus();
  const updatePriority = useUpdateTicketPriority();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center text-sm">Loading tickets…</p>;
  }

  if (error) {
    return <p className="text-destructive py-8 text-center text-sm">Failed to load tickets.</p>;
  }

  const filtered = (tickets ?? [])
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter(
      (t) =>
        !search ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        CATEGORIES.find((c) => c.id === t.category_id)
          ?.name.toLowerCase()
          .includes(search.toLowerCase()),
    );

  const advanceStatus = (current: TicketStatus): TicketStatus | null => {
    const idx = TICKET_STATUS_FLOW.indexOf(current);
    if (idx < TICKET_STATUS_FLOW.length - 1) return TICKET_STATUS_FLOW[idx + 1];
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">All Tickets ({filtered.length})</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search tickets..."
                className="h-9 w-48 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-card border-input h-9 rounded-sm border px-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            >
              <option value="all">All Status</option>
              {TICKET_STATUS_FLOW.map((s) => (
                <option key={s} value={s}>
                  {s.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-muted border-b text-left">
                <th className="px-4 py-3 font-medium">Issue</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Supports</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => {
                const nextStatus = advanceStatus(ticket.status);
                return (
                  <tr key={ticket.id} className="border-muted/50 hover:bg-muted/30 border-b">
                    <td className="max-w-xs truncate px-4 py-3">
                      <Link
                        to={`/admin/tickets/${ticket.id}`}
                        className="hover:text-primary font-medium"
                      >
                        {ticket.description.slice(0, 60)}...
                      </Link>
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {CATEGORIES.find((c) => c.id === ticket.category_id)?.name ?? 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3">
                      {ticket.priority_level === 'urgent' ? (
                        <span className="text-destructive flex items-center gap-1 text-xs font-semibold">
                          <AlertTriangle className="size-3" />
                          URGENT
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Normal</span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">{ticket.support_count}</td>
                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {nextStatus ? (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() =>
                              updateStatus.mutate({
                                ticketId: ticket.id,
                                values: { status: nextStatus },
                              })
                            }
                            disabled={updateStatus.isPending}
                          >
                            {nextStatus === 'resolved'
                              ? 'Resolve'
                              : `→ ${nextStatus.replace('-', ' ')}`}
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            updatePriority.mutate({
                              ticketId: ticket.id,
                              priority_level:
                                ticket.priority_level === 'urgent' ? 'normal' : 'urgent',
                            })
                          }
                          disabled={updatePriority.isPending}
                        >
                          {ticket.priority_level === 'urgent' ? 'Unmark' : 'Urgent'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                    No tickets match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
